// routes/control.js
const express = require('express');
const { startService, stopService } = require('../services/controller');
const router = express.Router();

const [,, cmd, name, file] = process.argv;

if (cmd === 'start') {
  startService(name, file || `${name}/index.js`).then(console.log).catch(console.error);
} else if (cmd === 'stop') {
  console.log(stopService(name));
}

// 🔁 Map service name to relative file path (inside microservices/)
const serviceMap = {
  app1: 'app1/index.js',
  app2: 'app2/index.js',
  orders: 'orders/index.js'
};

router.post('/start/:name', async (req, res) => {
  const name = req.params.name;
  if (!serviceMap[name]) {
    return res.status(404).json({ error: 'Unknown service' });
  }

  try {
    const result = await startService(name, serviceMap[name]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start service', details: err.message });
  }
});

router.post('/stop/:name', (req, res) => {
  const name = req.params.name;
  const result = stopService(name);
  res.json(result);
});

module.exports = router;
