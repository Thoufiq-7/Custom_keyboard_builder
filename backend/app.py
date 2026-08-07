from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from groq import Groq
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

load_dotenv()
client = Groq()

# ─── LOAD ALL PRODUCT DATA ───────────────────────────────────────────────────
print("Loading product databases...")

DATA_FILES = {
    "keyboards": "keyboards.json",
    "mouse": "mouse.json",
    "desktop_mats": "desktop_mats.json",
    "cables": "cables.json",
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

# ─── BUILD EMBEDDINGS ────────────────────────────────────────────────────────
print("Loading Sentence Transformer Model (takes a few seconds)...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

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

product_texts = [build_search_text(p) for p in all_products]
product_vectors = embedder.encode(product_texts)
print("Backend Ready! ✓")

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

    # --- STEP A: VECTOR RETRIEVAL (diverse across categories) ---
    query_vector = embedder.encode([user_input])
    similarities = np.dot(product_vectors, query_vector.T).squeeze()

    if similarities.ndim == 0:
        top_indices = [0]
    else:
        # Get top matches but ensure we pull from different categories
        sorted_indices = np.argsort(similarities)[::-1]

        # Separate by category: grab top 2 from each category
        category_picks = {}
        for idx in sorted_indices:
            cat = all_products[idx].get("category", "")
            if cat not in category_picks:
                category_picks[cat] = []
            if len(category_picks[cat]) < 2:
                category_picks[cat].append(idx)
            if sum(len(v) for v in category_picks.values()) >= 8:
                break

        top_indices = []
        for picks in category_picks.values():
            top_indices.extend(picks)

    context_items = [all_products[i] for i in top_indices]
    context_str = json.dumps(context_items, indent=2)

    # --- STEP B: LLM GENERATION WITH STRUCTURED JSON ---
    system_prompt = f"""
    You are a luxury mechanical keyboard AI shopping assistant for KeyForge.
    User Request: "{user_input}"
    
    Available Inventory (matching products across all categories):
    {context_str}
    
    INSTRUCTIONS:
    1. You are an expert keyboard and desktop setup advisor. Your PRIMARY job is to help users build or customize their perfect desktop setup.
    2. When a user asks about keyboards or wants to build one:
       - Recommend ACCESSORIES that complement the setup: a gaming mouse, an extended desk mat, and a matching coiled cable.
       - If the user wants a READYMADE keyboard (pre-built, ready to use), recommend keyboards from inventory.
       - Always suggest a complete setup: keyboard + mouse + mouse mat + cable.
    3. When a user asks about specific parts (mouse, mouse mat, cables), recommend those parts.
    4. Be conversational, enthusiastic, and knowledgeable. Explain WHY you recommend each item.
    5. If the user expresses intent to buy, add to cart, or purchase, include the product ID in itemIds.
    6. You MUST respond in pure, valid JSON:
    {{
        "message": "Your response. Be helpful and recommend accessories that pair well together.",
        "recommendedProducts": [
            {{
                "id": "product-id",
                "name": "Product Name",
                "price": 99.99,
                "image": "image-path-from-inventory",
                "link": "/category-page-link"
            }}
        ],
        "action": {{
            "type": "ADD_TO_CART",
            "itemIds": []
        }}
    }}
    7. recommendedProducts should contain 1-4 products. Use exact id, name, price, image, link from inventory.
    8. PRIORITIZE accessories (switches, keycaps, lube, tools) over keyboards unless the user specifically asks for a readymade/pre-built keyboard.
    9. If no items to add to cart, leave itemIds empty: [].
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
    app.run(port=5000, debug=True)
