import os
import shutil
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

COURSES_DIR = "documents/cours/"
CHROMA_DIR = "chroma_db_cours"

# Supprimer l'ancien index
if os.path.exists(CHROMA_DIR):
    print("🗑️ Suppression de l'ancien index Chroma...")
    shutil.rmtree(CHROMA_DIR)

# Charger tous les .txt et .pdf
docs = []
files_loaded = 0
for filename in os.listdir(COURSES_DIR):
    path = os.path.join(COURSES_DIR, filename)
    if filename.endswith(".txt"):
        print(f"📄 TXT : {filename}")
        docs += TextLoader(path).load()
        files_loaded += 1
    elif filename.endswith(".pdf"):
        print(f"📄 PDF : {filename}")
        docs += PyPDFLoader(path).load()
        files_loaded += 1

if not docs:
    raise ValueError("❌ Aucun document texte ou PDF trouvé.")

print(f"📚 {files_loaded} fichier(s) chargé(s), {len(docs)} document(s) extraits")

# Découpage
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = splitter.split_documents(docs)
print(f"🔍 {len(chunks)} chunk(s) générés pour l'indexation")

# Embeddings + Chroma
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma.from_documents(chunks, embedding=embeddings, persist_directory=CHROMA_DIR)
db.persist()

print("✅ Index Chroma généré avec PDF et TXT")
