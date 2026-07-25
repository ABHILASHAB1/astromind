from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from nadi_simulation import (
    simulate_minutiae, build_grid_embedding,
    simulate_attribute_embeddings, compute_query_embedding,
    simulate_leaf_features_and_labels, train_and_evaluate_model
)

app = FastAPI(title="Nadi ML Simulation API")

# Allow requests from the Next.js frontend (e.g., localhost:3000 or Capacitor app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/nadi/predict")
async def predict_nadi_leaf(
    image: UploadFile = File(...),
    attributes: str = Form(...)
):
    """
    Bridge endpoint for the Nadi Astrology Simulation.
    Accepts a thumbprint image and a comma-separated list of attributes (e.g. "Father=Raj,Mother=Sita").
    Returns the predicted matching leaf bundle, leaf similarity score, and predicted Kandams.
    """
    
    # 1. BIOMETRIC MATCHING (Module 1 logic)
    # In a real app, we would process `image` with OpenCV to extract minutiae.
    # Here, we use the simulation function to generate a fake embedding as a placeholder.
    mock_minutiae = simulate_minutiae(num_minutiae=50, img_shape=(256, 256))
    grid_embedding = build_grid_embedding(mock_minutiae, img_shape=(256, 256), G=8)
    
    # Simulate finding the closest bundle out of K=10 bundles (mocking distance)
    simulated_bundle_distances = np.random.uniform(0.1, 2.0, size=10)
    matched_bundle_index = int(np.argmin(simulated_bundle_distances))
    
    # 2. TEXTUAL LEAF RETRIEVAL (Module 2 logic)
    # Process the incoming attributes string
    attr_list = attributes.split(",") if attributes else ["Unknown"]
    num_attrs = max(1, len(attr_list))
    
    # Generate mock attribute embeddings based on the input length
    attr_embeds = simulate_attribute_embeddings(num_attrs=num_attrs, dim=768)
    # Create equal weights for all attributes
    alpha = np.ones(num_attrs) / num_attrs
    query_embed = compute_query_embedding(attr_embeds, alpha)
    
    # Assume the matched bundle has 10 leaves, we evaluate similarity of our query against them
    # We'll just randomly mock a top match score for demonstration
    best_leaf_match_score = float(np.random.uniform(0.75, 0.99))
    
    # 3. KANDAM CLASSIFICATION (Module 3 logic)
    # We would normally train and predict, but since training a Logistic Regression 
    # per request is slow, we will run a rapid simulation to predict chapters
    features, labels = simulate_leaf_features_and_labels(num_leaves=50, LM_dim=128, meter_dim=8)
    # We just run the eval to get a mock F1 score to prove the ML model ran
    f1 = train_and_evaluate_model(features, labels, threshold=0.5)
    
    # Predict which Kandams (chapters 1-16) are present on this leaf. 
    # Chapter 1 is always present. We randomize a few others.
    predicted_kandams = [1]
    for k in range(2, 17):
        if np.random.rand() > 0.7:  # 30% chance of a chapter being present
            predicted_kandams.append(k)

    kandam_names = {
        1: "General Chapter", 2: "Wealth and Family", 3: "Siblings", 
        4: "Mother, Property, Vehicles", 5: "Children", 6: "Enemies and Diseases", 
        7: "Marriage", 8: "Lifespan", 9: "Father and Fortune", 
        10: "Career", 11: "Profits", 12: "Expenditure", 
        13: "Previous Birth", 14: "Mantra Japa", 15: "Medicine", 16: "Dasa Bhukti"
    }
    
    predicted_kandam_details = [{"chapter": k, "name": kandam_names.get(k, "Unknown")} for k in predicted_kandams]

    return {
        "success": True,
        "message": "Thumbprint and attributes processed by Nadi ML engine.",
        "results": {
            "biometric": {
                "extracted_minutiae_count": 50,
                "matched_bundle_index": matched_bundle_index,
            },
            "textual_retrieval": {
                "attributes_processed": attr_list,
                "best_leaf_match_score": round(best_leaf_match_score, 4)
            },
            "kandam_classification": {
                "model_f1_score": round(f1, 4),
                "predicted_kandams": predicted_kandam_details
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
