from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re
import numpy as np
import requests
import time
from groq import Groq
import os
from dotenv import load_dotenv

app = Flask(__name__)
# In production, set FRONTEND_URL env variable on Render to your frontend's URL.
# Falls back to localhost for local development.
FRONTEND_ORIGIN = os.environ.get("FRONTEND_URL", "http://localhost:5173")
CORS(app, resources={r"/api/*": {"origins": FRONTEND_ORIGIN}})

load_dotenv()
client = Groq()

# ─── LOAD ALL PRODUCT DATA ───────────────────────────────────────────────────
print("Loading product databases...")

DATA_FILES = {
    "keyboards": "keyboards.json",
    "mouse": "mouse.json",
    "desktop_mats": "desktop_mats.json",
    "cables": "cables.json",
    "laptops": "laptops.json",
    "monitors": "monitors.json",
    "desktops": "desktops.json",
}

all_products = []
for category_key, filename in DATA_FILES.items():
    filepath = os.path.join(os.path.dirname(__file__), filename)
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Normalize: ensure every product has a 'link' field for frontend navigation
            for product in data:
                if "link" not in product:
                    product["link"] = f"/{category_key}"
            all_products.extend(data)
            print(f"  ✓ Loaded {len(data)} products from {filename}")
    except FileNotFoundError:
        print(f"  ✗ WARNING: {filename} not found, skipping.")

print(f"Total products loaded: {len(all_products)}")

# ─── BUILD EMBEDDINGS VIA HUGGINGFACE API ────────────────────────────────────
def get_hf_embeddings(texts, max_retries=3):
    """Fetch embeddings from HuggingFace Inference API with retry logic for cold starts."""
    hf_token = os.environ.get("HF_TOKEN")
    if not hf_token:
        print("WARNING: HF_TOKEN environment variable not set. Embeddings will fail.")
        return np.zeros((len(texts), 384)) # Fallback dummy embeddings

    api_url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
    headers = {"Authorization": f"Bearer {hf_token}"}

    for attempt in range(max_retries):
        try:
            response = requests.post(api_url, headers=headers, json={"inputs": texts, "options": {"wait_for_model": True}})
            if response.status_code == 200:
                return np.array(response.json())
            elif response.status_code == 503:
                print(f"HF API Cold Start (503). Retrying in 10s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(10)
            else:
                print(f"HF API Error: {response.status_code} - {response.text}")
                break
        except Exception as e:
            print(f"HF API Request Failed: {e}")
            break
            
    print("Failed to get embeddings from HF API. Returning empty vectors.")
    return np.zeros((len(texts), 384))


# Build richer searchable text for better RAG retrieval
def build_search_text(p):
    parts = [p.get("name", "")]
    if p.get("category"):
        parts.append(f"({p['category']})")
    if p.get("brand"):
        parts.append(f"by {p['brand']}")
    if p.get("description"):
        parts.append(p["description"])
    if p.get("best_for"):
        best_for = p["best_for"]
        if isinstance(best_for, list):
            parts.append("Best for: " + ", ".join(best_for))
        else:
            parts.append(f"Best for: {best_for}")
    if p.get("type"):
        parts.append(f"Type: {p['type']}")
    if p.get("profile"):
        parts.append(f"Profile: {p['profile']}")
    if p.get("material"):
        parts.append(f"Material: {p['material']}")
    return " ".join(parts)


print("Generating initial product embeddings via HuggingFace API...")
product_texts = [build_search_text(p) for p in all_products]

# The public HF API has payload limits, so we batch if necessary. 
# 70 items is usually fine in one batch for all-MiniLM-L6-v2, but we'll do it in chunks to be safe.
CHUNKS = 100
product_vectors = []
for i in range(0, len(product_texts), CHUNKS):
    chunk = product_texts[i:i+CHUNKS]
    vecs = get_hf_embeddings(chunk)
    if len(product_vectors) == 0:
        product_vectors = vecs
    else:
        product_vectors = np.concatenate((product_vectors, vecs), axis=0)

print("Backend Ready! ✓")

# ─── BUDGET HELPER ───────────────────────────────────────────────────────────

def extract_budget(text):
    """Extract a dollar budget from free-form text. Returns float or None."""
    # Match patterns like $200, 200 dollars, under 200, within 300, budget of 150
    patterns = [
        r'\$([\d,]+(?:\.\d+)?)',          # $200, $1,500
        r'([\d,]+(?:\.\d+)?)\s*(?:dollar|usd|bucks)',  # 200 dollars
        r'(?:under|below|within|around|max(?:imum)?|budget(?:\s+of)?)\s*\$?([\d,]+(?:\.\d+)?)',
        r'([\d,]+(?:\.\d+)?)\s*(?:total|budget)',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            raw = m.group(1).replace(',', '')
            try:
                return float(raw)
            except ValueError:
                pass
    return None


# ─── ROUTES ──────────────────────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "KeyForge AI Backend is running!", "total_products": len(all_products)})


@app.route('/api/products', methods=['GET'])
def get_products():
    """Return all products, optionally filtered by category."""
    category = request.args.get('category', '').strip().lower()

    if category:
        filtered = [p for p in all_products if p.get("category", "").lower() == category]
        return jsonify(filtered)

    return jsonify(all_products)


@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Return a single product by ID."""
    product = next((p for p in all_products if p.get("id") == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('prompt', '')

    if not user_input:
        return jsonify({"error": "Prompt is required"}), 400

    # --- STEP A: EXTRACT BUDGET (if any) ---
    budget = extract_budget(user_input)

    # --- STEP B: VECTOR RETRIEVAL (guaranteed diverse across all categories) ---
    query_vector = get_hf_embeddings([user_input])
    similarities = np.dot(product_vectors, query_vector.T).squeeze()

    if similarities.ndim == 0:
        top_indices = [0]
    else:
        sorted_indices = np.argsort(similarities)[::-1]

        # PASS 1: Guarantee at least 1 product per category (so the LLM always has
        # every category available when building a full setup recommendation).
        # If budget is set, only include products within budget (10% tolerance).
        category_best = {}   # cat -> best index (within budget)
        for idx in sorted_indices:
            product = all_products[idx]
            cat = product.get("category", "other")
            price = product.get("price", 0)
            if budget is not None and price > budget * 1.1:
                continue
            if cat not in category_best:
                category_best[cat] = idx  # first (highest similarity) within budget

        guaranteed_indices = list(category_best.values())
        guaranteed_set = set(guaranteed_indices)

        # PASS 2: Fill remaining slots (up to MAX_CONTEXT total) with the next-best
        # products, prioritising variety (max 2 extras per category).
        EXTRA_PER_CAT = 2
        MAX_CONTEXT = 21  # 7 categories × 3 products each
        extra_picks = {}
        for idx in sorted_indices:
            if idx in guaranteed_set:
                continue
            product = all_products[idx]
            cat = product.get("category", "other")
            price = product.get("price", 0)
            if budget is not None and price > budget * 1.1:
                continue
            extra_picks.setdefault(cat, [])
            if len(extra_picks[cat]) < EXTRA_PER_CAT:
                extra_picks[cat].append(idx)
            if len(guaranteed_indices) + sum(len(v) for v in extra_picks.values()) >= MAX_CONTEXT:
                break

        top_indices = guaranteed_indices
        for picks in extra_picks.values():
            top_indices.extend(picks)

    context_items = [all_products[i] for i in top_indices]

    # Attach price info clearly for the LLM
    context_str = json.dumps(context_items, indent=2)
    budget_instruction = (
        f"""\n    BUDGET CONSTRAINT: The user has a TOTAL budget of ${budget:.2f} for the ENTIRE setup.
    - You MUST pick one product from each relevant category such that their prices ADD UP to no more than ${budget:.2f}.
    - Calculate the exact total: sum up the prices of every product you recommend.
    - If you cannot find a valid combination within ${budget:.2f}, say so and recommend the closest best-value options.
    - Always state the total cost in your message (e.g., "Total: $X.XX")."""
        if budget is not None else ""
    )

    # --- STEP C: LLM GENERATION WITH STRUCTURED JSON ---
    system_prompt = f"""You are a luxury keyboard & desktop setup AI shopping assistant for KeyForge.
    User Request: "{user_input}"
    {budget_instruction}

    Available Inventory (pre-filtered, most relevant products across all categories):
    {context_str}

    INSTRUCTIONS:
    1. You are an expert desktop setup advisor. Help users build their perfect setup.
    2. FULL SETUP REQUEST RULE (CRITICAL): If the user asks for a full/complete/total/entire setup,
       you MUST recommend EXACTLY ONE product from EACH of these 7 categories:
         - Keyboard
         - Mouse
         - Desktop Mats
         - Cable
         - Laptop
         - Monitor
         - Desktop
       Do NOT pick two items from the same category. Do NOT skip any category.
       The inventory provided contains products from all 7 categories — use them.
    3. For a SINGLE CATEGORY request: recommend 1-3 best products from that category.
    4. BUDGET RULE (critical): When a budget is given, sum every recommended product price.
       The total MUST be <= the budget. Show the breakdown: "Keyboard: $X + Mouse: $Y + Mat: $Z + Cable: $W + Laptop: $L + Monitor: $M + Desktop: $D = Total: $T".
    5. Be conversational, enthusiastic, and explain WHY you recommend each item.
    6. If the user wants to buy/add to cart, include product IDs in itemIds.
    7. Respond ONLY in this exact JSON format:
    {{
        "message": "Your helpful, detailed response including price breakdown if budget was requested.",
        "recommendedProducts": [
            {{
                "id": "exact-product-id-from-inventory",
                "name": "Exact Product Name",
                "price": 99.99,
                "image": "exact-image-path-from-inventory",
                "link": "/exact-link-from-inventory"
            }}
        ],
        "action": {{
            "type": "ADD_TO_CART",
            "itemIds": []
        }}
    }}
    8. Use EXACT id, name, price, image, link values from the inventory above. Do not invent products.
    9. recommendedProducts: For full-setup queries return exactly 7 items (one per category).
       For single-category queries return 1-3 items.
    10. If no items to add to cart, leave itemIds as: [].
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )

        response_json = json.loads(chat_completion.choices[0].message.content)
        return jsonify(response_json)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "message": "I'm having trouble connecting right now. Please try again!",
            "recommendedProducts": [],
            "action": {"type": "ERROR", "itemIds": []}
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
