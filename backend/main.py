from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import CSVLoader

import shutil
import os

DOCUMENTS_PATH = "documents/quiz_patisseries.csv"
CHROMA_DB_DIR = "chroma_db_patisseries"

# 1. Charger les documents depuis un CSV
loader = CSVLoader(file_path=DOCUMENTS_PATH)
docs = loader.load()

if not docs:
    raise ValueError("❌ Aucun document chargé depuis le fichier CSV")

print(f"📄 {len(docs)} documents chargés")

# 2. Séparer les documents (utile si chaque ligne est longue ou multiple questions)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\n\n", "\n", ".", "?"]
)
documents = text_splitter.split_documents(docs)

for i, doc in enumerate(documents):
    print(f"Chunk {i} : {doc.page_content[:200]}")

# 3. Supprimer l’ancienne base Chroma si elle existe
if os.path.exists(CHROMA_DB_DIR):
    shutil.rmtree(CHROMA_DB_DIR)
    print(f"🧹 Ancienne base supprimée dans {CHROMA_DB_DIR}")

# 4. Encoder les documents avec un modèle HuggingFace
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 5. Créer la nouvelle base vectorielle
db = Chroma.from_documents(
    documents=documents,
    embedding=embedding_model,
    persist_directory=CHROMA_DB_DIR
)

db.persist()
print(f"✅ Nouvelle Chroma DB initialisée dans {CHROMA_DB_DIR}")
