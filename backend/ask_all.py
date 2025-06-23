import pandas as pd
import numpy as np
import json
from langchain.chains import RetrievalQA
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms.ollama import Ollama
from sklearn.metrics.pairwise import cosine_similarity
from langchain.embeddings import HuggingFaceEmbeddings

# 1. Charger le CSV avec les choix
df = pd.read_csv("documents/quiz_patisseries.csv")

# 2. Recharger la base vectorielle
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = Chroma(
    persist_directory="chroma_db_patisseries",
    embedding_function=embedding_model
)

# 3. Initialiser le modèle
llm = Ollama(model="gemma:2b")

# 4. Construire la chaîne RAG
qa = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=db.as_retriever(),
    return_source_documents=True
)

# 5. Parcourir chaque question
results = []

for index, row in df.iterrows():
    question = row["Question"]
    choices = [row["Réponse 1"], row["Réponse 2"], row["Réponse 3"], row["Réponse 4"]]

    # a. Poser la question au modèle
    rag_result = qa.invoke(question)
    model_answer = rag_result["result"].strip()

    # b. Embeddings
    choices_embeddings = embedding_model.embed_documents(choices)
    model_embedding = embedding_model.embed_query(model_answer)

    # c. Similarité cosinus
    sims = cosine_similarity([model_embedding], choices_embeddings)[0]
    predicted_index = int(np.argmax(sims)) + 1  # Index entre 1 et 4

    # d. Identifier l’index réel de la bonne réponse
    try:
        correct_index = choices.index(row["Bonne réponse"]) + 1
    except ValueError:
        correct_index = None

    # e. Résultat booléen
    est_correct = predicted_index == correct_index

    # f. Sauvegarde des résultats
    results.append({
        "question": question,
        "reponse_modele": model_answer,
        "similarites": [round(s, 4) for s in sims],
        "index_pred": predicted_index,
        "bonne_reponse": row["Bonne réponse"],
        "index_bonne_reponse": correct_index,
        "est_correct": est_correct
    })

# 6. Afficher au format JSON exploitable directement
print(json.dumps({ "results": results }, ensure_ascii=False))
