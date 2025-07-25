const express = require('express');
const axios = require('axios');
const { services } = require('../config');

const router = express.Router();

router.get('/', async (req, res) => {
  const healthResults = {};

  await Promise.all(
    Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });

        healthResults[name] = {
          status: 'UP',
          message: response.data || 'OK',
          code: response.status,
        };

        console.log(`✅ ${name.toUpperCase()} service is ONLINE.`);
      } catch (err) {
        const message = err.response?.data || err.message;
        const code = err.response?.status || 500;

        healthResults[name] = {
          status: 'DOWN',
          message,
          code,
        };

        console.log(`❌ ${name.toUpperCase()} service is OFFLINE: ${message}`);
      }
    })
  );

  const indiaTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });

  res.json({
    gateway: {
      status: 'UP',
      time: indiaTime,
    },
    services: healthResults,
  });
});

module.exports = router;
