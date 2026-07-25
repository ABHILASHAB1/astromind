"""
Nādī Astrology Alignment with Machine Learning Simulation

Overview
This script implements three separate simulation modules that mirror the key steps of a modern, ML-aligned Nādī pipeline:
Module 1: Biometric matching—simulating how a seeker's thumbprint might be embedded and compared to a set of pre-indexed "bundles."
Module 2: Leaf retrieval by textual similarity—showing how a small set of candidate leaves (each represented by an embedding) might be ranked against a query embedding constructed from known attributes.
Module 3: Kaṇḍam (chapter) classification—demonstrating a multi-label classifier that predicts which of the sixteen Kaṇḍams appear on a given palm leaf.

Each module is synthetic: it does not use any real thumbs, palm leaves, or language models.
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score
import pandas as pd

# Ensure reproducible randomness
np.random.seed(42)

# =============================================================================
# 1. Module 1: Simulated Thumbprint -> Bundle Matching
# =============================================================================

def simulate_minutiae(num_minutiae, img_shape=(256, 256)):
    """
    Create `num_minutiae` random points to stand in for real fingerprint minutiae.
    Returns a (num_minutiae x 3) array, where each row is (x, y, theta).
    """
    H, W = img_shape
    xs = np.random.randint(0, H, size=num_minutiae)
    ys = np.random.randint(0, W, size=num_minutiae)
    thetas = np.random.uniform(0, np.pi, size=num_minutiae)
    return np.vstack((xs, ys, thetas)).T

def build_grid_embedding(minutiae, img_shape=(256, 256), G=8):
    """
    Convert minutiae points into a fixed-length grid embedding of size 2x(G^2).
    """
    H, W = img_shape
    cell_h = H // G
    cell_w = W // G
    h_counts = []
    orientations = []

    for i in range(G):
        for j in range(G):
            x_min, x_max = i * cell_h, (i + 1) * cell_h
            y_min, y_max = j * cell_w, (j + 1) * cell_w
            mask = (
                (minutiae[:, 0] >= x_min) & (minutiae[:, 0] < x_max) &
                (minutiae[:, 1] >= y_min) & (minutiae[:, 1] < y_max)
            )
            cell_minutiae = minutiae[mask]
            count = len(cell_minutiae)
            h_counts.append(count)
            if count > 0:
                sin_sum = np.sum(np.sin(cell_minutiae[:, 2]))
                cos_sum = np.sum(np.cos(cell_minutiae[:, 2]))
                orientations.append(np.arctan2(sin_sum, cos_sum))
            else:
                orientations.append(0.0)

    h_counts = np.array(h_counts, dtype=float)
    if h_counts.sum() > 0:
        h_norm = h_counts / h_counts.sum()
    else:
        h_norm = h_counts
    embedding = np.hstack([h_norm, np.array(orientations)])
    return embedding

def simulate_distances(K, count, G, img_shape):
    """
    Generate K synthetic bundle embeddings, fit K-means to find centroids,
    and return Euclidean distances from a new thumbprint to each centroid.
    """
    bundle_embeddings = []
    for _ in range(K):
        minutiae = simulate_minutiae(num_minutiae=count, img_shape=img_shape)
        embed = build_grid_embedding(minutiae, img_shape=img_shape, G=G)
        bundle_embeddings.append(embed)
    bundle_embeddings = np.array(bundle_embeddings)

    kmeans = KMeans(n_clusters=K, random_state=42, n_init=10).fit(bundle_embeddings)
    centroids = kmeans.cluster_centers_

    new_minutiae = simulate_minutiae(num_minutiae=count, img_shape=img_shape)
    new_embedding = build_grid_embedding(new_minutiae, img_shape=img_shape, G=G)

    distances = np.linalg.norm(centroids - new_embedding, axis=1)
    return distances

def run_module_1():
    print("Running Module 1...")
    Ks = [5, 10, 20]
    G_values = [8, 16]
    minutiae_counts = [50, 150]
    img_shapes = [(128, 128), (256, 256)] # Reduced sizes for brevity in simulation

    for img_shape in img_shapes:
        fig, axes = plt.subplots(1, len(Ks), figsize=(5 * len(Ks), 4), sharey=True)
        fig.suptitle(f"Module 1: Distances - Image Size {img_shape[0]}x{img_shape[1]}", fontsize=16)

        for idx, K in enumerate(Ks):
            ax = axes[idx]
            for count in minutiae_counts:
                for G in G_values:
                    dists = simulate_distances(K=K, count=count, G=G, img_shape=img_shape)
                    label = f"Minutiae={count}, G={G}"
                    ax.plot(range(K), dists, marker='o', label=label)

            ax.set_title(f"K = {K} Bundles", fontsize=14)
            ax.set_xlabel("Bundle Index", fontsize=12)
            if idx == 0:
                ax.set_ylabel("Euclidean Distance", fontsize=12)
            ax.grid(True)
            ax.legend(fontsize=9)

        plt.tight_layout(rect=[0, 0, 1, 0.92])
        # plt.show() # Disabled for headless run, save to file instead
        plt.savefig(f'module1_distances_{img_shape[0]}.png')
        plt.close()

# =============================================================================
# 2. Module 2: Simulated Leaf Retrieval via Textual Similarity
# =============================================================================

def simulate_leaf_embeddings(N_b, dim=768):
    emb = np.random.normal(size=(N_b, dim))
    return normalize(emb, axis=1)

def simulate_attribute_embeddings(num_attrs=3, dim=768):
    attr_embeds = np.random.normal(size=(num_attrs, dim))
    return normalize(attr_embeds, axis=1)

def compute_query_embedding(attr_embeds, alpha):
    q = alpha.dot(attr_embeds)
    return q / np.linalg.norm(q)

def run_module_2():
    print("Running Module 2...")
    leaf_counts = [5, 10, 20]
    alpha_sets = [
        np.array([0.33, 0.33, 0.34]),
        np.array([0.5, 0.3, 0.2]),
        np.array([0.7, 0.2, 0.1])
    ]
    num_attrs = 3
    dim = 768
    threshold = 0.80

    for N_b in leaf_counts:
        leaf_embeddings = simulate_leaf_embeddings(N_b, dim=dim)
        fig, axes = plt.subplots(1, len(alpha_sets), figsize=(5 * len(alpha_sets), 4), sharey=True)
        fig.suptitle(f"Module 2: Cosine Similarities (N_b = {N_b} leaves)", fontsize=16)

        for idx, alpha in enumerate(alpha_sets):
            ax = axes[idx]
            attr_embeds = simulate_attribute_embeddings(num_attrs=num_attrs, dim=dim)
            query_embed = compute_query_embedding(attr_embeds, alpha)

            if N_b % 2 == 0:
                noise = 0.01 * np.random.normal(size=(dim,))
                leaf_embeddings[0] = query_embed + noise
                leaf_embeddings = normalize(leaf_embeddings, axis=1)

            sims = cosine_similarity(query_embed.reshape(1, -1), leaf_embeddings).flatten()

            ax.bar(range(N_b), sims, color='skyblue')
            ax.axhline(threshold, color='r', linestyle='--', label=f"Threshold = {threshold:.2f}")
            ax.set_title(f"alpha = {tuple(alpha)}", fontsize=12)
            ax.set_xlabel("Leaf Index", fontsize=10)
            if idx == 0:
                ax.set_ylabel("Cosine Similarity", fontsize=10)
            ax.set_ylim(0, 1)
            ax.grid(axis='y')
            ax.legend(fontsize=8)

        plt.tight_layout(rect=[0, 0, 1, 0.92])
        plt.savefig(f'module2_similarities_{N_b}.png')
        plt.close()

# =============================================================================
# 3. Module 3: Simulated Kandam Classification
# =============================================================================

def simulate_leaf_features_and_labels(num_leaves, LM_dim=512, meter_dim=32, num_kandams=16):
    LM_embeds = np.random.normal(size=(num_leaves, LM_dim))
    Meter_embeds = np.random.normal(size=(num_leaves, meter_dim))
    features = np.hstack([LM_embeds, Meter_embeds])
    labels = np.random.randint(0, 2, size=(num_leaves, num_kandams))
    labels[:, 0] = 1  # Kaṇḍam 1 always present
    return features, labels

def train_and_evaluate_model(features, labels, threshold=0.5, test_size=0.3, random_state=None):
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=test_size, random_state=random_state
    )
    num_kandams = labels.shape[1]
    y_pred_proba = np.zeros_like(y_test, dtype=float)
    y_pred = np.zeros_like(y_test, dtype=int)

    for k in range(num_kandams):
        if len(np.unique(y_train[:, k])) < 2:
            y_pred[:, k] = y_train[0, k]
        else:
            clf = LogisticRegression(max_iter=500)
            clf.fit(X_train, y_train[:, k])
            y_pred_proba[:, k] = clf.predict_proba(X_test)[:, 1]
            y_pred[:, k] = (y_pred_proba[:, k] >= threshold).astype(int)

    f1 = f1_score(y_test.flatten(), y_pred.flatten(), average='micro')
    return f1

def run_module_3():
    print("Running Module 3...")
    training_sizes = [30, 50, 100]
    LM_dims = [128, 256] # Reduced for brevity
    meter_dims = [8, 16]
    thresholds = [0.5, 0.7]
    num_trials = 2
    num_kandams = 16

    results = []

    for LM_dim in LM_dims:
        for meter_dim in meter_dims:
            for size in training_sizes:
                for thresh in thresholds:
                    f1_scores = []
                    for trial in range(num_trials):
                        features, labels = simulate_leaf_features_and_labels(
                            num_leaves=size,
                            LM_dim=LM_dim,
                            meter_dim=meter_dim,
                            num_kandams=num_kandams
                        )
                        f1 = train_and_evaluate_model(
                            features,
                            labels,
                            threshold=thresh,
                            test_size=0.3,
                            random_state=trial
                        )
                        f1_scores.append(f1)

                    results.append({
                        'LM_dim': LM_dim,
                        'Meter_dim': meter_dim,
                        'Train_Size': size,
                        'Threshold': thresh,
                        'Mean_F1': np.mean(f1_scores),
                        'Std_F1': np.std(f1_scores)
                    })

    df_results = pd.DataFrame(results)
    
    plt.figure(figsize=(10, 6))
    markers = ['o', 's', 'D', '^']
    linestyles = ['-', '--', '-.', ':']
    idx = 0

    for LM_dim in LM_dims:
        for meter_dim in meter_dims:
            for thresh in thresholds:
                subset = df_results[
                    (df_results['LM_dim'] == LM_dim) &
                    (df_results['Meter_dim'] == meter_dim) &
                    (df_results['Threshold'] == thresh)
                ]
                subset = subset.sort_values('Train_Size')
                plt.errorbar(
                    subset['Train_Size'],
                    subset['Mean_F1'],
                    yerr=subset['Std_F1'],
                    marker=markers[idx % len(markers)],
                    linestyle=linestyles[idx % len(linestyles)],
                    capsize=4,
                    label=f"LM={LM_dim}, Meter={meter_dim}, Th={thresh}"
                )
                idx += 1

    plt.title("Module 3: Micro-average F1 vs. Training Size")
    plt.xlabel("Number of Leaves (Total Samples)")
    plt.ylabel("Micro-average F1 Score")
    plt.ylim(0.40, 0.7)
    plt.legend(fontsize=8, loc='center left', bbox_to_anchor=(1.02, 0.5), borderaxespad=0)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig('module3_f1_scores.png')
    plt.close()

if __name__ == "__main__":
    run_module_1()
    run_module_2()
    run_module_3()
    print("Simulation complete! Check the generated PNG files.")
