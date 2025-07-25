const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const User = require('../modal/userSchema');

module.exports = async (req, res, next) => {
  const publicRoutes = [
    '/',
    '/health',
    '/auth/login',
    '/auth/signup',
    '/auth/admin/signup',
    '/app1'
  ];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    console.log('❌ No token found');
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    const userInfo = await User.findOne({ username: decoded.username });
    if (!userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { role, status, services } = userInfo;
    const isAdmin = role === 'admin';
    const isUser = role === 'user';
    const isActive = status === 'active';

    // Attach full user object to req
    req.user = {
      _id: userInfo._id,
      username: userInfo.username,
      email: userInfo.email,
      role,
      status,
      services,
      isAdmin,
      isUser,
      isActive,
    };

    const path = req.path.toLowerCase();

    // Service checker
    const hasOtpAccess = services?.includes('otp-service');

    // Role-based access
    if (path.startsWith('/control') && !isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    if (path.startsWith('/app1')) {
      if (!(isActive && hasOtpAccess && (isUser || isAdmin))) {
        return res.status(403).json({
          error: 'Access denied: Only active users or admins with OTP access',
        });
      }
    } 

    next();
  });
};
