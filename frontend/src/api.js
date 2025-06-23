export const fetchDatasets = async () => {
    const res = await fetch('http://localhost:3001/datasets');
    return res.json();
};

export const fetchQuestions = async (dataset) => {
    const res = await fetch(`http://localhost:3001/questions/${dataset}`);
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

export const askAll = async () => {
    const res = await fetch('http://localhost:3001/ask-all', {
        method: 'POST'
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
