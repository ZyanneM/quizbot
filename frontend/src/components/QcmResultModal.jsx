import React from 'react';

export default function QcmResultModal({ results, onClose }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-bold mb-4">Résultats du QCM</h2>
        <button className="absolute top-4 right-6 text-gray-500 hover:text-black" onClick={onClose}>✕</button>
        {results.map((item, idx) => (
          <div key={idx} className="mb-6 border-b pb-4">
            <p className="font-semibold mb-2">{item.question}</p>
            <ul className="space-y-1">
              {item.choices.map((choice) => (
                <li
                  key={choice.index}
                  className={\`p-2 rounded \${item.predicted_index === choice.index
                    ? (item.is_correct ? 'bg-green-100' : 'bg-red-100')
                    : ''}\`}
                >
                  <strong>{choice.index}.</strong> {choice.text} — 
                  <span className="ml-2 text-sm text-gray-600">similarité : {choice.similarity.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-sm">
              <span className={item.is_correct ? 'text-green-600' : 'text-red-600'}>
                Réponse {item.is_correct ? 'correcte' : 'incorrecte'} — prédite : {item.predicted_index}, attendue : {item.correct_index}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}