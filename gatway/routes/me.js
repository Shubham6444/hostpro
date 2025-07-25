const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SECRET = 'your_secret_key';

// Middleware: JWT verify
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });
 
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // ✅ attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// GET /api/me
router.get('/me', authenticate, (req, res) => {
  // ⚠️ req.user me JWT payload hoga
  res.json({
    username: req.user.username,
    role: req.user.role,
    // aur jo fields aap token me daalte ho
  });
});

module.exports = router;
