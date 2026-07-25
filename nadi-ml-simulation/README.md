# Nādī Astrology Alignment with Machine Learning Simulation

This directory contains the simulation coding of Nadi Astrology with Machine Learning, reflecting concepts from [Nadi-Astrology-Machine-Learning](https://github.com/ParthaPRay/Nadi-Astrology-Machine-Learning).

## Overview
This notebook implements three separate simulation modules that mirror the key steps of a modern, ML-aligned Nādī pipeline:

**Module 1:** Biometric matching—simulating how a seeker's thumbprint might be embedded and compared to a set of pre-indexed "bundles."
**Module 2:** Leaf retrieval by textual similarity—showing how a small set of candidate leaves (each represented by an embedding) might be ranked against a query embedding constructed from known attributes.
**Module 3:** Kaṇḍam (chapter) classification—demonstrating a multi-label classifier that predicts which of the sixteen Kaṇḍams appear on a given palm leaf.

Each module is synthetic: it does not use any real thumbs, palm leaves, or language models. Instead, it generates random "feature vectors" and random labels, then shows how you would train or compare those vectors in each step. The goal is to provide reproducible, illustrative code that you can adapt once you plug in real fingerprint minutiae, real OCR embeddings, or real transformer representations.

## How to Run
1. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the simulation:
   ```bash
   python nadi_simulation.py
   ```

## Walkthrough

### 1. Module 1: Simulated Thumbprint → Bundle Matching
In this first section, we emulate the process of converting a thumbprint into a fixed-length embedding and then finding which of K "bundle centroids" it most closely matches. In a real Nādī center, each bundle of palm leaves is pre-indexed by a set of prototype thumb impressions (the "centroids"). Here, we replace actual images with synthetic minutiae points.

### 2. Module 2: Simulated Leaf Retrieval via Textual Similarity
In this section, we simulate how one might rank a bundle of N_b palm leaves (once they have been encoded into vectors by OCR + an embedding model) based on a query formed from the seeker's known personal details. Because we lack real OCR or embedding weights, we create random vectors in R^768 to stand in for both leaves and attribute tokens.

### 3. Module 3: Simulated Kaṇḍam Classification
The third section demonstrates a toy multi-label classification pipeline. We imagine each palm leaf is represented by two concatenated feature blocks: a "language model" embedding of dimension d_LM and a "meter" embedding of dimension d_meter. In reality, those might come from a fine-tuned Tamil BERT plus a small CNN+LSTM that reads poetic meter.

## How to Use This Code in Your Own Experiment

**Replace Random Simulations with Real Data**
- In **Module 1**, instead of `simulate_minutiae(...)`, call your actual fingerprint-processing routine (e.g. detect minutiae from an inked thumb image).
- In **Module 2**, substitute `simulate_leaf_embeddings(...)` with your real OCR+embedding pipeline applied to scanned palm leaves.
- In **Module 3**, replace `simulate_leaf_features_and_labels(...)` with a function that loads real embeddings (for example, a 768-dim Tamil BERT vector, plus a 32-dim meter embedding).

**Adjust Hyperparameters and Paths**
If your actual model uses a different embedding dimension (e.g. BERT outputs 1024 features), update the `LM_dim` list accordingly. Decide whether you want to vary the probability threshold (0.5 vs 0.7) or cross-validate it per Kaṇḍam.

**Interpret the Plots**
- Module 1 plots show how well (or poorly) a new query prints fit within existing bundles.
- Module 2 plots show how the top-scoring leaf(s) stand out above a fixed similarity threshold.
- Module 3 plots show how F1, recall, and precision change as you gather more labeled leaves.
