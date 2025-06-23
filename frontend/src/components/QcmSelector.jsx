import React, { useState, useEffect } from 'react';

export default function QcmSelector({ onSubmit }) {
  const [questions, setQuestions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  useEffect(() => {
    fetch('/documents/eval.csv')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n').filter(Boolean);
        const headers = lines[0].split(',');
        const questionCol = headers.indexOf('Question');
        const parsed = lines.slice(1).map((line, idx) => ({
          index: idx,
          text: line.split(',')[questionCol]
        }));
        setQuestions(parsed);
      });
  }, []);

  const toggleSelection = (index) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = () => {
    if (selectedIndices.length === 0) return;
    onSubmit(selectedIndices);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sélectionnez les questions à évaluer</h2>
      <ul className="space-y-2 max-h-[300px] overflow-y-auto border p-2 rounded">
        {questions.map(q => (
          <li key={q.index}>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIndices.includes(q.index)}
                onChange={() => toggleSelection(q.index)}
              />
              <span>{q.text}</span>
            </label>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Évaluer
      </button>
    </div>
  );
}