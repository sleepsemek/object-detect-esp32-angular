const axios = require('axios');

const URL = 'http://localhost:3000/api/postResult';
const DEVICE_COUNT = 10;
const MAX_PEOPLE_COUNT = 10;
const SEND_INTERVAL = 3000;
const SKIP_PROBABILITY = 0.8;

function getRandomConfidence() {
  return +(Math.random() * 100).toFixed(2);
}

function getRandomBoundingBox() {
  const x = Math.floor(Math.random() * 200);
  const y = Math.floor(Math.random() * 200);
  const width = Math.floor(30 + Math.random() * 50);
  const height = Math.floor(40 + Math.random() * 60);
  return [getRandomConfidence(), x, y, width, height];
}

function simulateDevice(deviceId) {
  const ip = `192.168.1.${deviceId + 10}`;

  setInterval(async () => {
    if (Math.random() < SKIP_PROBABILITY) {
      console.log(`[${ip}] Скип отправки.`);
      return;
    }

    const peopleCount = Math.floor(Math.random() * MAX_PEOPLE_COUNT) + 1;
    const people = [];

    for (let i = 0; i < peopleCount; i++) {
      people.push(getRandomBoundingBox());
    }

    const payload = {
      local_ip: ip,
      person: people
    };

    try {
      const res = await axios.post(URL, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`[${ip}] Sent: ${JSON.stringify(payload)} Status: ${res.status}`);
    } catch (err) {
      console.error(`[${ip}] Error: ${err.message}`);
    }

  }, SEND_INTERVAL);
}

for (let i = 0; i < DEVICE_COUNT; i++) {
  simulateDevice(i);
}
