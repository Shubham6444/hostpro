const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const User = require('../modal/userSchema');

module.exports = async (req, res, next) => {
  // const path = req.originalUrl || req.url;
  const path = (req.originalUrl || req.url).toLowerCase();
  const lowerPath = req.path.toLowerCase();

console.log(owerPath)
  // ✅ Publicly accessible routes
  const publicRoutes = [
    '/auth/login',
    '/',
    '/health',
    '/auth/signup',
    '/auth/admin/signup',
    '/app1'
  ];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // ✅ Extract token from cookies or Authorization header
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    console.log('❌ No token found');
    return res.status(401).json({ error: 'No token provided' });
  }

  // ✅ Verify token and fetch user
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

    // 🧪 Debug logs
    console.log(`[AUTH] User: ${decoded.username}`);
    console.log(`[AUTH] Role: ${role}, Status: ${status}`);
    console.log(`[AUTH] Services:`, services);

    // ✅ Strict OTP Access Check
    const parsedServices = Array.isArray(services) ? services : [];
    const hasOtpAccess = parsedServices.includes('otp-service');

    // ✅ Attach enhanced user to req
    req.user = {
      username: decoded.username,
      role,
      status,
      services: parsedServices,
      isAdmin: role === 'admin',
      isUser: role === 'user',
      isActive: status === 'active',
      hasOtpAccess
    };

    // ✅ Admin-only area
    if (lowerPath.startsWith('/control') && !req.user.isAdmin) {
      console.log('❌ Access denied: Admin only');
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    // ✅ App2 protected route
    if (lowerPath.startsWith('/app24')) {
      const { isActive, hasOtpAccess, isUser, isAdmin } = req.user;

      console.log(`[AUTH] hasOtpAccess: ${hasOtpAccess}`);

      if (!(isActive && hasOtpAccess && (isUser || isAdmin))) {
        console.log('❌ Access denied for /app2');
        return res.status(403).json({
          error: 'Access denied: Only active users or admins with OTP access'
        });
      } else {
        console.log('✅ Access granted to /app2');
      }
    }

    // ✅ All checks passed
    next();
  });
};
