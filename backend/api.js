const express = require('express');
const cors = require('cors');
const moment = require('moment-timezone');
const app = express();

app.use(cors());
app.use(express.json());

let inferenceStore = {}; // { [local_ip]: [ { timestamp, data: { person: [ [p, x, y, a, b], ... ] } }, ... ], ... }

app.post('/api/addDevice', (req, res) => {
  const { local_ip } = req.body;

  if (!local_ip || typeof local_ip !== 'string') {
    return res.status(400).json({ error: 'Неверный формат запроса' });
  }

  if (inferenceStore.hasOwnProperty(local_ip)) {
    return res.status(409).json({ error: 'Камера уже существует' });
  }

  inferenceStore[local_ip] = [];
  res.status(200).json({ message: 'Камера успешно добавлена' });
});

app.post('/api/postResult', (req, res) => {
  const { local_ip, ...data } = req.body;

  if (!local_ip || typeof data !== 'object') {
    return res.status(400).json({ error: 'Неверный формат запроса' });
  }

  const timestamp = moment().tz('Europe/Moscow').toISOString();
  const newInference = { timestamp, data };

  if (!inferenceStore[local_ip]) {
    inferenceStore[local_ip] = [];
  }

  inferenceStore[local_ip].push(newInference);

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  inferenceStore[local_ip] = inferenceStore[local_ip].filter(
    inf => now - new Date(inf.timestamp).getTime() <= oneDayMs
  );

  res.sendStatus(200);
});

app.get('/api/getResult', (req, res) => {
  const result = Object.entries(inferenceStore).map(([local_ip, inferences]) => {
    return { local_ip, inferences };
  });
  res.json({ results: result });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту :3000');
});
