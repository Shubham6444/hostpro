// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../modal/userSchema')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


// Signup route (default role: user)
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return res.json({ message: 'Signup successful' });
  } catch (err) {
    return res.status(500).json({ error: 'Signup failed', detail: err.message });
  }
});

// Admin signup only from Postman or secure client (role = admin)
router.post('/admin/signup', async (req, res) => {
  const { username, password, adminKey } = req.body;
  if (adminKey !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Invalid admin key' });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: 'admin' });
    await newUser.save();

    return res.json({ message: 'Admin signup successful' });
  } catch (err) {
    return res.status(500).json({ error: 'Admin signup failed', detail: err.message });
  }
});
 
// Login route
router.post('/login', async (req, res) => {
  console.log(req.body)
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});
router.post('/logout', (req, res) => {
  res.clearCookie('token'); // or your cookie name
  res.json({ message: 'Logged out' });
});


module.exports = router;
