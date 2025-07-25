// routes/user.js or inside app.js
const express = require('express');
const router = express.Router();

router.get('/user/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // You already attached `req.user` from JWT middleware
  res.json({
    username: req.user.username,
    role: req.user.role
  });
});


router.get('/user/logout', (req, res) => {
  res.clearCookie('token'); // 🧹 Remove the JWT cookie
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
