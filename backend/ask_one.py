import sys
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms.ollama import Ollama

# Récupération de la question
question = sys.argv[1]

# Embedding et vecteurs
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = Chroma(persist_directory="chroma_db_patisseries", embedding_function=embedding_model)

# LLM
llm = Ollama(model="gemma:2b")

# Prompt personnalisé
prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
Tu es un expert en pâtisserie. À partir du contexte suivant, réponds à la question de manière concise et précise.

Contexte : {context}
Question : {question}

Réponse :
""",
)

# Construction de la chaîne avec le bon input_key
qa = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=db.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=False,
    chain_type_kwargs={"prompt": prompt},
    input_key="question"  # 👈 Important !
)

# Poser la question
result = qa.invoke({"question": question})
print(result["result"].strip())
