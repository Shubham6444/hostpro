module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_key1',
  services: {
    app1: 'http://localhost:3001',
    app2: 'http://localhost:3002',
    // app3: 'http://localhost:3003',
  },
};
 