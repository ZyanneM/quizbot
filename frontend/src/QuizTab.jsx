import { useEffect, useState } from 'react';
import { fetchDatasets, fetchQuestions, askOne, askAll } from './api';

function QuizTab() {
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState('');
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [answers, setAnswers] = useState(null);

    useEffect(() => {
        fetchDatasets().then(setDatasets).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedDataset) {
            fetchQuestions(selectedDataset).then(setQuestions).catch(console.error);
        }
    }, [selectedDataset]);

    const handleAskSelected = async () => {
        const newAnswers = {};
        for (const question of selectedQuestions) {
            const res = await askOne(question);
            newAnswers[question] = res.answer || res.error;
        }
        setAnswers(newAnswers);
    };

    const handleAskAll = async () => {
        const res = await askAll();
        if (Array.isArray(res.results)) {
            setAnswers(res.results);
        } else {
            console.error("❌ Format inattendu de réponse :", res);
        }
    };

    return (
        <div>
            <h2>📘 Quiz basé sur un Dataset</h2>

            <label>Choisir un dataset :</label>
            <select value={selectedDataset} onChange={(e) => setSelectedDataset(e.target.value)}>
                <option value="">-- Choisir --</option>
                {datasets.map((ds, idx) => (
                    <option key={idx} value={ds}>{ds}</option>
                ))}
            </select>

            {questions.length > 0 && (
                <>
                    <label style={{ display: 'block', marginTop: '1rem' }}>Choisis tes questions :</label>
                    <select
                        multiple
                        value={selectedQuestions}
                        onChange={(e) =>
                            setSelectedQuestions(Array.from(e.target.selectedOptions).map((o) => o.value))
                        }
                        size={Math.min(questions.length, 10)}
                    >
                        {questions.map((q, idx) => (
                            <option key={idx} value={q}>{q}</option>
                        ))}
                    </select>

                    <br />
                    <button onClick={handleAskSelected}>Répondre aux sélectionnées</button>
                    <button onClick={handleAskAll} style={{ marginLeft: '1rem' }}>Répondre à toutes</button>
                </>
            )}

            <div style={{ marginTop: '2rem' }}>
                {Array.isArray(answers) ? (
                    <>
                        <h3>📊 Résultats globaux</h3>
                        <table style={{ borderCollapse: 'collapse', width: '100%', background: '#e7ffe7' }}>
                            <thead>
                            <tr>
                                <th>Question</th>
                                <th>Réponse modèle</th>
                                <th>Index prédit</th>
                                <th>Bonne réponse</th>
                                <th>Index attendu</th>
                                <th>Évaluation</th>
                            </tr>
                            </thead>
                            <tbody>
                            {answers.map((r, idx) => (
                                <tr key={idx}>
                                    <td>{r.question}</td>
                                    <td>{r.reponse_modele}</td>
                                    <td>{r.index_pred}</td>
                                    <td>{r.bonne_reponse}</td>
                                    <td>{r.index_bonne_reponse}</td>
                                    <td>{r.est_correct ? '🟢' : '🔴'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                ) : answers && typeof answers === 'object' ? (
                    Object.entries(answers).map(([question, answer], idx) => (
                        <div key={idx} style={{ marginBottom: '1.5rem' }}>
                            <strong>❓ {question}</strong>
                            <p>🤖 {answer}</p>
                        </div>
                    ))
                ) : null}
            </div>
        </div>
    );
}

export default QuizTab;
