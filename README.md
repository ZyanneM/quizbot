# Quiz Chatbot IA 🤖

Un projet Python + React complet avec trois modes d'interaction :
1. **Chat libre** – posez une question libre à l'IA.
2. **QCM intelligent** – sélectionnez un ou plusieurs QCM et observez la comparaison des réponses via embeddings.
3. **Mode Cours (RAG)** – posez une question et obtenez une réponse basée sur vos documents de cours.

---

## 📁 Structure du projet

### Backend
- `backend/qcm/` : traitement de QCM, export fine-tuning, comparaison d'embeddings
- `backend/rag/` : traitement RAG sur documents pédagogiques
- `ask_free.py` : chat libre avec un LLM

### Frontend
- `api.js` : expose les routes API (chat, qcm, rag)
- `src/components/` :
  - `QcmSelector.jsx` : sélection des questions
  - `QcmResultModal.jsx` : affichage des résultats d'embeddings
- `App.jsx` : onglets Chat libre, QCM intelligent, Mode cours (RAG)

---

## 🚀 Lancer le projet

### Backend
```bash
cd backend
# Assurez-vous d'avoir installé les dépendances Python requises
python qcm/process_eval.py
python rag/index_courses.py
```

### Frontend
```bash
cd frontend
npm install
node api.js    # démarre l'API
npm run dev    # démarre l'interface
```

---

## 📄 Fichiers attendus

- `documents/eval.csv` : fichier de QCM
- `documents/cours/` : fichiers `.txt` ou `.pdf` pour le mode RAG

---

## ✅ Objectifs pédagogiques couverts

- ✅ Embeddings avec `sentence-transformers`
- ✅ Export de données pour fine-tuning
- ✅ Chatbot RAG basé sur des documents
- ✅ Chat libre avec un LLM

---

Développé avec ❤️ pour un projet complet d’IA éducative.