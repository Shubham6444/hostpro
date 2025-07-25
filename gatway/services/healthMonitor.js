const axios = require('axios');
const { services } = require('../config');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first'); // Force IPv4 resolution

const lastStatus = {};

// 🔍 Check individual service
async function checkService(name, url) {
  try {
    const healthUrl = `${url}/health`;
    const res = await axios.get(healthUrl, { timeout: 3000 });

    const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);

    if (lastStatus[name] !== 'UP') {
      logStatus(`✅ ${name.toUpperCase()} service is now ONLINE.`);
    }

    lastStatus[name] = 'UP';

    return [name, {
      status: 'UP',
      message: data,
      code: res.status,
    }];
  } catch (err) {
    if (lastStatus[name] !== 'DOWN') {
      logStatus(`❌ ${name.toUpperCase()} service is OFFLINE.`);
    }

    lastStatus[name] = 'DOWN';

   const status = err.response?.status || 500;

let message = err.message;
if (err.response?.data) {
  if (typeof err.response.data === 'object') {
    message = JSON.stringify(err.response.data);
  } else {
    message = err.response.data;
  }
}

return [name, {
  status: 'DOWN',
  message,
  code: status,
}];

  }
}

// 🔁 Check all services in parallel
async function checkAllServices(io) {
  const checks = await Promise.all(
    Object.entries(services).map(([name, url]) => checkService(name, url))
  );

  const status = Object.fromEntries(checks);

  const payload = {
    gateway: {
      status: 'UP',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    },
    services: status,
  };

  if (io && typeof io.emit === 'function') {
    io.emit('service-status', payload);
  }

  return payload;
}

// 🕓 Timestamped log
function logStatus(message) {
  console.log(`[${new Date().toLocaleTimeString('en-IN')}] ${message}`);
}

module.exports = {
  checkAllServices,
};
