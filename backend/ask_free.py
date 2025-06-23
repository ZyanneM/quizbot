import sys
from langchain_community.llms.ollama import Ollama

question = sys.argv[1]

llm = Ollama(model="gemma:2b")
response = llm.invoke(question)

print(response)
