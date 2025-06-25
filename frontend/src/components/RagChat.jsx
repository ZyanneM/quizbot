import React, { useState } from 'react';
import { askRag } from '../api.js';

export default function RagChat() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        setLoading(true);
        setResponse('');
        try {
            const res = await askRag(input);
            setResponse(res.answer);
        } catch (err) {
            setResponse("❌ Erreur lors de la récupération de la réponse.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
      <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Pose une question sur les cours (PDF ou txt)..."
      />
            <button
                onClick={handleAsk}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                disabled={loading}
            >
                {loading ? "Chargement..." : "Demander au cours"}
            </button>
            <pre className="mt-4 bg-gray-100 p-4 rounded whitespace-pre-wrap">{response}</pre>
        </div>
    );
}
