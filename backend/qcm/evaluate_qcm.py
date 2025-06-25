import pandas as pd
import numpy as np
import json
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms.ollama import Ollama
from sklearn.metrics.pairwise import cosine_similarity

# === Paramètres ===
CSV_PATH = "documents/eval.csv"
VECTOR_DB_PATH = "chroma_db"
OUTPUT_CSV = "documents/qcm_resultats.csv"

# === 1. Chargement du QCM ===
df = pd.read_csv(CSV_PATH)

# === 2. Chargement des embeddings + vecteurs ===
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = Chroma(persist_directory=VECTOR_DB_PATH, embedding_function=embedding_model)

# === 3. Initialisation du LLM + chaîne RAG ===
llm = Ollama(model="gemma:2b")
qa = RetrievalQA.from_chain_type(llm=llm, retriever=db.as_retriever(), return_source_documents=False)

# === 4. Traitement ===
results = []

for index, row in df.iterrows():
    question = row["Question"]
    choices = [row[f"Réponse {i}"] for i in range(1, 5)]
    bonne_reponse = str(row["Bonne réponse"]).strip()

    # Prompt plus précis
    prompt = (
            f"Voici une question à choix multiples. "
            f"Question : {question}\n"
            f"Choix :\n"
            + "\n".join([f"{i+1}. {choice}" for i, choice in enumerate(choices)]) +
            "\nRéponds uniquement en reprenant la phrase exacte correspondant à la meilleure réponse."
    )

    try:
        # a. Appel LLM
        model_answer = qa.invoke(prompt)["result"].strip()

        # b. Embeddings
        choix_embeddings = embedding_model.embed_documents(choices)
        reponse_embedding = embedding_model.embed_query(model_answer)
        sims = cosine_similarity([reponse_embedding], choix_embeddings)[0]

        # c. Index prédiction
        predicted_index = int(np.argmax(sims)) + 1
        correct_index = int(bonne_reponse)

        # d. Format résultat
        results.append({
            "index": index,
            "question": question,
            "model_answer": model_answer,
            "predicted_index": predicted_index,
            "correct_index": correct_index,
            "is_correct": predicted_index == correct_index,
            "similarites": [round(s, 4) for s in sims],
            "choices": [{"index": i+1, "text": text} for i, text in enumerate(choices)]
        })

    except Exception as e:
        print(f"[❌] Erreur à la question {index} : {e}")

# === 5. Export CSV + retour JSON
df_result = pd.DataFrame([{
    "index": r["index"],
    "question": r["question"],
    "reponse_modele": r["model_answer"],
    "index_prediction": r["predicted_index"],
    "index_bonne_reponse": r["correct_index"],
    "est_correct": r["is_correct"]
} for r in results])

df_result.to_csv(OUTPUT_CSV, index=False, encoding='utf-8-sig')

# Impression JSON pour l'API
print(json.dumps({ "results": results }, ensure_ascii=False, indent=2))

# === 6. Export CSV (résumé des résultats)
df_result = pd.DataFrame([{
    "index": r["index"],
    "question": r["question"],
    "reponse_modele": r["model_answer"],
    "index_prediction": r["predicted_index"],
    "index_bonne_reponse": r["correct_index"],
    "est_correct": r["is_correct"],
    "similarites": r["similarites"]
} for r in results])

df_result.to_csv("documents/qcm_resultats.csv", index=False, encoding='utf-8-sig')

