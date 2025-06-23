import sys
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms.ollama import Ollama

question = sys.argv[1]

# Charger la base vectorielle
db = Chroma(persist_directory="chroma_db_cours",
            embedding_function=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2"))

retriever = db.as_retriever(search_kwargs={"k": 3})
llm = Ollama(model="gemma:2b")

# Création de la chaîne RAG avec réponse + documents
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, return_source_documents=True)

# Exécuter la chaîne
result = qa_chain.invoke({"query": question})

# Afficher la réponse
print("🤖 Réponse :\n", result["result"])

# Afficher les sources
sources = result.get("source_documents", [])
print("\n📚 Documents utilisés :")
for i, doc in enumerate(sources):
    print(f"--- Chunk {i+1} ---")
    print(doc.page_content.strip())
    print()
