import pandas as pd
import json

df = pd.read_csv("documents/eval.csv")

with open("documents/qcm_finetune.jsonl", "w") as f:
    for _, row in df.iterrows():
        prompt = f"{row['Question']}\n1. {row['Réponse 1']}\n2. {row['Réponse 2']}\n3. {row['Réponse 3']}\n4. {row['Réponse 4']}\nRéponds uniquement par le numéro :"
        index = [row[f"Réponse {i}"] for i in range(1, 5)].index(row["Bonne réponse"]) + 1
        json.dump({"prompt": prompt, "completion": f" {index}"}, f)
        f.write("\n")
print("✅ Fichier qcm_finetune.jsonl généré.")