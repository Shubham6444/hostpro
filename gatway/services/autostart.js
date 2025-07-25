// 👇 Auto-start all microservices on gateway boot
const { startService } = require('../services/controller');

const initialServices = {
  app1: 'app1/index.js',
  app2: 'app2/index.js',
  
};

(async () => {
  for (const [name, file] of Object.entries(initialServices)) {
    try {
      const result = await startService(name, file);
      console.log(`✅ Auto-started ${name}:`, result.message || result.error);
    } catch (err) {
      console.error(`❌ Failed to auto-start ${name}:`, err.message);
    }
  }
})();
