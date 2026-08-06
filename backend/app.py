from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from groq import Groq
import os
from dotenv import load_dotenv

app = Flask(__name__)
# Allow requests from the Vite React frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

load_dotenv()

client=Groq()
# 2. LOAD DATA & INITIALIZE EMBEDDINGS
print("Loading database...")
with open("keyboards.json", "r") as f:
    products = json.load(f)

print("Loading Sentence Transformer Model (takes a few seconds)...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Create searchable text for each product
product_texts = [f"{p['name']} ({p['category']}): {p.get('best_for', '')}" for p in products]
product_vectors = embedder.encode(product_texts)
print("Backend Ready!")

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "KeyForge AI Backend is running!"})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('prompt', '')

    if not user_input:
        return jsonify({"error": "Prompt is required"}), 400

    # --- STEP A: VECTOR RETRIEVAL ---
    query_vector = embedder.encode([user_input])
    similarities = np.dot(product_vectors, query_vector.T).squeeze()
    
    # Get top 2 matching products
    if similarities.ndim == 0:
        top_indices = [0]
    else:
        top_indices = np.argsort(similarities)[::-1][:2]
        
    context_items = [products[i] for i in top_indices]
    context_str = json.dumps(context_items, indent=2)

    # --- STEP B: LLM GENERATION WITH STRICT JSON ---
    system_prompt = f"""
    You are a luxury mechanical keyboard AI shopping assistant. 
    User Request: "{user_input}"
    
    Available Inventory: 
    {context_str}
    
    INSTRUCTIONS:
    1. Answer the user's question conversationally based ONLY on the Available Inventory.
    2. If the user expresses intent to buy, add to cart, or purchase a recommended item, include its ID in the itemIds array.
    3. You MUST respond in pure, valid JSON format matching exactly this schema:
    {{
        "message": "Your conversational response here.",
        "action": {{
            "type": "ADD_TO_CART",
            "itemIds": ["kb-01", "sw-01"] 
        }}
    }}
    If no items need to be added to the cart, leave itemIds empty: [].
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"} # Forces valid JSON output
        )
        
        response_json = json.loads(chat_completion.choices[0].message.content)
        return jsonify(response_json)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "message": "I'm having trouble connecting to the database right now. Please try again!", 
            "action": {"type": "ERROR", "itemIds": []}
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
    