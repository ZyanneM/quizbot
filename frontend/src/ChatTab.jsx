import { useState } from 'react';
import { askFree } from './api';

function ChatTab() {
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [error, setError] = useState('');

    const simulateTyping = (text, callback) => {
        if (!text) return;

        setTypingText('');
        setTyping(true);
        let i = -1;

        const interval = setInterval(() => {
            i++; // on incrémente d’abord
            if (i < text.length) {
                setTypingText((prev) => prev + text.charAt(i));
            } else {
                clearInterval(interval);
                setTyping(false);
                callback && callback();
            }
        }, 25);
    };


    const handleAsk = async () => {
        if (!input.trim()) return;
        setError('');
        try {
            const res = await askFree(input);
            const text = typeof res.answer === 'string' ? res.answer : '';
            simulateTyping(text);
        } catch (err) {
            setError('❌ Erreur lors de la requête.');
        }
    };

    return (
        <div>
            <h2>💬 Chat libre avec Gemma 2B</h2>

            <textarea
                rows={4}
                cols={60}
                placeholder="Pose ta question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing}
            />
            <br />
            <button onClick={handleAsk} disabled={typing}>
                {typing ? 'Réponse en cours...' : 'Envoyer'}
            </button>

            <div style={{ marginTop: '2rem' }}>
                {typingText && <p style={{ whiteSpace: 'pre-line' }}>{typingText}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
}

export default ChatTab;
