
export const evaluateQcm = async () => {
    const res = await fetch('http://localhost:3001/api/qcm/evaluate-qcm', {
        method: 'POST'
    });
    return res.json();
};

export const askOne = async (question) => {
    const res = await fetch('http://localhost:3001/ask-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
    });
    return res.json();
};

export const askFree = async (question) => {
    const res = await fetch('http://localhost:3001/ask-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
    });
    return res.json();
};

export const askRag = async (question) => {
    const res = await fetch('http://localhost:3001/ask-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
    });
    return res.json();
};

