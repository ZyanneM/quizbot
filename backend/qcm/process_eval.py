import pandas as pd
from sentence_transformers import SentenceTransformer, util

# Charger les données
df = pd.read_csv("documents/eval.csv")

# Fonction pour interpréter la bonne réponse
def get_index(row):
    try:
        # Si l'utilisateur a mis un chiffre (ex: "3")
        return int(row["Bonne réponse"])
    except ValueError:
        # Sinon on cherche la position du texte correspondant dans les choix
        return [row[f"Réponse {i}"] for i in range(1, 5)].index(row["Bonne réponse"]) + 1

# Appliquer la conversion
df['Bonne réponse index'] = df.apply(get_index, axis=1)
df[['Question', 'Bonne réponse index']].to_csv("documents/answers_index.csv", index=False)

# Initialiser le modèle
model = SentenceTransformer('all-MiniLM-L6-v2')

# Comparaison des embeddings
results = []
for _, row in df.iterrows():
    q_embedding = model.encode(row["Question"], convert_to_tensor=True)
    similarities = []
    for i in range(1, 5):
        rep = row[f"Réponse {i}"]
        r_embedding = model.encode(rep, convert_to_tensor=True)
        sim = util.pytorch_cos_sim(q_embedding, r_embedding).item()
        similarities.append(round(sim, 4))
    predicted_index = similarities.index(max(similarities)) + 1
    results.append(similarities + [predicted_index])

# Ajouter les colonnes au dataframe
sim_cols = [f"similarité_{i}" for i in range(1, 5)] + ["index_prédit"]
df_embeddings = df.copy()
df_embeddings[sim_cols] = results

# Enregistrer les résultats
df_embeddings.to_csv("documents/resultats_embedding.csv", index=False)
print("✅ Comparaison d'embeddings enregistrée dans resultats_embedding.csv")
