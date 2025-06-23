import React, { useState } from 'react';
import QcmSelector from './components/QcmSelector';
import QcmResultModal from './components/QcmResultModal';

function App() {
  const [tab, setTab] = useState('chat');
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [ragInput, setRagInput] = useState('');
  const [ragResponse, setRagResponse] = useState('');

  const handleQcmSubmit = (selectedIndices) => {
    fetch('/api/qcm/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: selectedIndices })
    })
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setShowModal(true);
      });
  };

  const handleChatSubmit = () => {
    fetch(`/api/chat?question=${encodeURIComponent(chatInput)}`)
      .then(res => res.text())
      .then(text => setChatResponse(text));
  };

  const handleRagSubmit = () => {
    fetch(`/api/rag?question=${encodeURIComponent(ragInput)}`)
      .then(res => res.text())
      .then(text => setRagResponse(text));
  };

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Chatbot IA</h1>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('chat')} className={tab === 'chat' ? 'font-bold underline' : ''}>💬 Chat libre</button>
        <button onClick={() => setTab('qcm')} className={tab === 'qcm' ? 'font-bold underline' : ''}>🧪 QCM intelligent</button>
        <button onClick={() => setTab('rag')} className={tab === 'rag' ? 'font-bold underline' : ''}>📚 Mode cours (RAG)</button>
      </div>

      {tab === 'chat' && (
        <div>
          <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} className="w-full p-2 border rounded" rows={4} />
          <button onClick={handleChatSubmit} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Envoyer</button>
          <pre className="mt-4 bg-gray-100 p-4 rounded">{chatResponse}</pre>
        </div>
      )}

      {tab === 'qcm' && (
        <>
          <QcmSelector onSubmit={handleQcmSubmit} />
          <QcmResultModal results={results} onClose={() => setShowModal(false)} />
        </>
      )}

      {tab === 'rag' && (
        <div>
          <textarea value={ragInput} onChange={e => setRagInput(e.target.value)} className="w-full p-2 border rounded" rows={4} />
          <button onClick={handleRagSubmit} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">Demander au cours</button>
          <pre className="mt-4 bg-gray-100 p-4 rounded">{ragResponse}</pre>
        </div>
      )}
    </div>
  );
}

export default App;