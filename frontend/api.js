const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const app = express();
app.use(express.json());

const DATA_PATH = path.join(__dirname, '../documents/eval.csv');

app.post('/api/qcm/evaluate', (req, res) => {
  const selectedIndices = req.body.questions;

  // Lancer le script Python de traitement
  const py = spawn('python3', ['../backend/qcm/process_eval.py']);

  py.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Erreur lors du traitement du QCM' });
    }

    // Lire le fichier résultant
    fs.readFile(path.join(__dirname, '../documents/resultats_embedding.csv'), 'utf8', (err, data) => {
      if (err) return res.status(500).json({ error: 'Erreur lecture du résultat' });

      const lines = data.trim().split('\n');
      const headers = lines[0].split(',');

      const results = lines.slice(1)
        .map((line, idx) => {
          const cols = line.split(',');
          return {
            index: idx,
            question: cols[headers.indexOf('Question')],
            choices: [1, 2, 3, 4].map(i => ({
              index: i,
              text: cols[headers.indexOf(`Réponse ${i}`)],
              similarity: parseFloat(cols[headers.indexOf(`similarité_${i}`)])
            })),
            predicted_index: parseInt(cols[headers.indexOf('index_prédit')]),
            correct_index: parseInt(cols[headers.indexOf('Bonne réponse index')]),
          };
        })
        .filter((row) => selectedIndices.includes(row.index))
        .map(row => ({ ...row, is_correct: row.predicted_index === row.correct_index }));

      res.json(results);
    });
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ API QCM démarrée sur http://localhost:${PORT}`));