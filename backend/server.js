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
            if (row['Question']) {
                questions.push(row['Question']);
            }
        })
        .on('end', () => res.json(questions))
        .on('error', (err) => {
            console.error('❌ Erreur lecture CSV :', err);
            res.status(500).send('Erreur lecture CSV');
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

app.listen(port, () => {
    console.log(`✅ API lancée sur http://localhost:${port}`);
});
