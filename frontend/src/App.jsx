import React, { useState } from 'react';
import QcmSelector from './components/QcmSelector';
import QcmResultModal from './components/QcmResultModal';
import RagChat from './components/RagChat';
import ChatTab from './components/ChatTab.jsx';
import {
    askOne,
    askFree,
    askRag,
    evaluateQcm
} from './api';
import dragonMeditatif from './assets/dragon.png'; // chemin vers ton image

function App() {
    const [tab, setTab] = useState('chat');
    const [results, setResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleQcmSubmit = () => {
        setIsLoading(true);
        evaluateQcm()
            .then(data => {
                console.log("🧠 Résultats :", data);
                setResults(data.results);
                setShowModal(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: '#fff',
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <img src={dragonMeditatif} alt="Dragon IA" style={{ width: '120px', height: "160px", marginRight: '1rem' }} className="levitating"/>
                    <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>Chatbot IA</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button onClick={() => setTab('chat')} style={tab === 'chat' ? { fontWeight: 'bold', textDecoration: 'underline' } : {}}>💬 Chat libre</button>
                    <button onClick={() => setTab('qcm')} style={tab === 'qcm' ? { fontWeight: 'bold', textDecoration: 'underline' } : {}}>🧪 QCM intelligent</button>
                    <button onClick={() => setTab('rag')} style={tab === 'rag' ? { fontWeight: 'bold', textDecoration: 'underline' } : {}}>📚 Mode cours (RAG)</button>
                </div>

                {tab === 'chat' && <ChatTab />}

                {tab === 'qcm' && (
                    <>
                        <QcmSelector
                            onSubmitAll={handleQcmSubmit}
                            setResults={setResults}
                            setShowModal={setShowModal}
                        />
                        {isLoading && (
                            <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                                ⏳ Évaluation en cours
                                <span style={{ fontWeight: 'bold' }} className="dots-loading">...</span>
                            </div>
                        )}
                        <QcmResultModal results={results} onClose={() => setShowModal(false)} visible={showModal} />
                    </>
                )}

                {tab === 'rag' && <RagChat />}
            </div>

            {/* Animation CSS inline */}
            <style>{`
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
        .dots-loading::after {
          display: inline-block;
          animation: dots 1.2s steps(4, end) infinite;
          content: '';
        }
      `}</style>
        </div>
    );
}

export default App;
