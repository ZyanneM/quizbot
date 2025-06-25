import { useState, useEffect } from 'react';
import { askFree } from '../api.js';

function ChatTab() {
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);          // Pour effet de frappe
    const [isLoading, setIsLoading] = useState(false);    // Pour animation des points dans le bouton
    const [typingText, setTypingText] = useState('');
    const [error, setError] = useState('');
    const [dots, setDots] = useState('');

    // Animation des points pendant chargement du LLM
    useEffect(() => {
        if (!isLoading) return;

        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
        }, 500);

        return () => clearInterval(interval);
    }, [isLoading]);

    const simulateTyping = (text, callback) => {
        if (!text) return;

        setTypingText('');
        setTyping(true);
        let i = -1;

        const interval = setInterval(() => {
            i++;
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
        setIsLoading(true);

        try {
            const res = await askFree(input);
            const text = typeof res.answer === 'string' ? res.answer : '';
            setIsLoading(false);
            simulateTyping(text);
        } catch (err) {
            setError('❌ Erreur lors de la requête.');
            setIsLoading(false);
            setTyping(false);
        }
    };

    return (
        <div>
            <h2>💬 Chat libre avec Gemma 2B</h2>

            <textarea
                rows={4}
                cols={60}
                placeholder="Posez votre question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing || isLoading}
            />
            <br />
            <button onClick={handleAsk} disabled={typing || isLoading}>
                {isLoading ? `Envoi${dots}` : typing ? 'Réponse en cours...' : 'Envoyer'}
            </button>

            <div style={{ marginTop: '2rem' }}>
                {typingText && <p style={{ whiteSpace: 'pre-line' }}>{typingText}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
}

export default ChatTab;
