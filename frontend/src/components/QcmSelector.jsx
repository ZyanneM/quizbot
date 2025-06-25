import React, { useEffect, useState } from 'react';
import {evaluateQcm} from "../api.js";

export default function QcmSelector({ onSubmitAll, setResults, setShowModal }) {
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/questions/eval.csv')
            .then(res => res.json())
            .then(data => setQuestions(data))
            .catch(err => console.error('❌ Erreur chargement questions QCM:', err));
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Questions du QCM</h2>

            <ul className="space-y-2 max-h-[300px] overflow-y-auto border p-2 rounded mb-4">
                {questions.map((q, i) => (
                    <li key={i} className="text-sm text-gray-800">
                        {i + 1}. {q}
                    </li>
                ))}
            </ul>

            <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={onSubmitAll}
            >
                🧠 Évaluer tout le QCM (LLM)
            </button>
        </div>
    );
}
