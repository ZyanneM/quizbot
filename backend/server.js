const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const datasetDir = path.join(__dirname, 'documents');
const scriptDir = path.join(__dirname, 'backend');

// 🔧 Fonction utilitaire pour lancer un script Python
function runPython(scriptName, args = '', callback) {
    const scriptPath = path.resolve(__dirname, scriptName);  // <- utilise path.resolve
    const command = `python3 "${scriptPath}" ${args}`;
    exec(command, callback);
}

// 🔹 GET /datasets – liste tous les fichiers CSV disponibles
app.get('/datasets', (req, res) => {
    fs.readdir(datasetDir, (err, files) => {
        if (err) return res.status(500).send('Erreur de lecture des datasets');
        const csvFiles = files.filter(file => file.endsWith('.csv'));
        res.json(csvFiles);
    });
});

// 🔹 GET /questions/:dataset – retourne les questions d’un CSV donné
app.get('/questions/:dataset', (req, res) => {
    const csvPath = path.join(datasetDir, req.params.dataset);
    const questions = [];

    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
            // 🧠 Ajoute une console.log ici :
            console.log('🔍 Ligne lue :', row);
            const questionKey = Object.keys(row).find(k => k.trim().includes('Question'));
            if (questionKey) {
                questions.push(row[questionKey]);
            }
        })
        .on('end', () => {
            console.log('✅ Questions extraites :', questions);
            res.json(questions);
        })
        .on('error', (err) => {
            console.error('❌ Erreur lecture CSV :', err);
            res.status(500).send('Erreur lecture CSV');
        });
});

// 🔹 POST /qcm/evaluate – appelle le script process_eval.py
app.post('/api/qcm/evaluate', (req, res) => {
    const datasetPath = path.join(__dirname, 'documents', 'eval.csv');
    runPython('qcm/process_eval.py', `"${datasetPath}"`, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Erreur process_eval.py :', stderr || err);
            return res.status(500).send(stderr || err);
        }
        try {
            const json = JSON.parse(stdout);
            res.json(json);
        } catch (e) {
            console.error("❌ Erreur de parsing JSON :", e);
            res.status(500).send('Erreur de parsing JSON');
        }
    });
});

// 🔹 POST /ask-one – pose une question spécifique via RAG
app.post('/ask-one', (req, res) => {
    const question = req.body.question;
    console.log('📤 [ASK-ONE] Question reçue :', question);
    runPython('ask_one.py', `"${question}"`, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Erreur ask_one.py :', stderr || err);
            return res.status(500).send(stderr || err);
        }
        res.send({ answer: stdout.trim() });
    });
});

// 🔹 POST /ask-all – évalue toutes les questions du CSV
app.post('/ask-all', (req, res) => {
    runPython('ask_all.py', '', (err, stdout, stderr) => {
        if (err) return res.status(500).send(stderr);
        try {
            const json = JSON.parse(stdout);
            res.json(json);
        } catch (e) {
            console.error("❌ Erreur de parsing JSON :", e);
            res.status(500).send('Erreur de parsing JSON');
        }
    });
});

// 🔹 POST /ask – question libre hors dataset (chat simple)
app.post('/ask-free', (req, res) => {
    const question = req.body.question;
    console.log('📤 [FREE CHAT] Question :', question);
    runPython('ask_free.py', `"${question}"`, (err, stdout, stderr) => {
        if (err) return res.status(500).send(stderr);
        console.log('📥 Réponse brute Python :', stdout); // <--- AJOUTE ICI
        res.send({ answer: stdout.trim() });
    });
});

// 🔹 POST /ask-rag – question avec contexte cours (RAG)
app.post('/ask-rag', (req, res) => {
    const question = req.body.question;
    console.log('📤 [ASK-RAG] Question reçue :', question);
    runPython('rag/answer_from_docs.py', `"${question}"`, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Erreur RAG :', stderr || err);
            return res.status(500).send(stderr || err);
        }
        res.send({ answer: stdout.trim() });
    });
});

app.post('/api/qcm/evaluate-qcm', (req, res) => {
    const command = 'poetry run python qcm/evaluate_qcm.py';

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Erreur :', error);
            return res.status(500).json({ error: 'Erreur d\'évaluation' });
        }

        try {
            const results = JSON.parse(stdout);
            res.json(results);
        } catch (e) {
            console.error('❌ Erreur parsing JSON :', e);
            res.status(500).json({ error: 'Résultat non lisible' });
        }
    });
});

app.listen(port, () => {
    console.log(`✅ API lancée sur http://localhost:${port}`);
});
