import React from 'react';

export default function QcmResultModal({ results, onClose }) {
    if (!results || results.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">📊 Résultats du QCM</h2>

                {results.map((r, i) => (
                    <div key={i} className="mb-6 border-b pb-4">
                        <p className="font-semibold text-gray-800 mb-1">
                            {i + 1}. {r.question}
                        </p>
                        <ul className="ml-4">
                            {r.choices.map((choice, idx) => (
                                <li key={idx}>
                                    <span className="font-mono mr-2">{choice.index}.</span>
                                    {choice.text}
                                    <span className="ml-2 text-sm text-gray-600">
                    (similarité : {r.similarites[idx].toFixed(4)})
                  </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-2 text-sm">
                            <strong>Réponse générée :</strong> <em>{r.model_answer}</em>
                        </p>
                        <p>
                            <strong>Prédit :</strong> {r.predicted_index} | <strong>Attendu :</strong> {r.correct_index} | <strong>Résultat :</strong>{' '}
                            {r.is_correct ? <span className="text-green-600 font-bold">✅</span> : <span className="text-red-600 font-bold">❌</span>}
                        </p>
                    </div>
                ))}

                <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Fermer
                </button>
            </div>
        </div>
    );
}
