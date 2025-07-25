const jwt = require("jsonwebtoken");

const PUBLIC_ROUTES = [
  "/",
  "/health",
  "/auth/login",
  "/auth/signup",
  "/auth/admin/signup",
  "/app1",
  "/ssh",
];

const JWT_SECRET = "your_super_secret_key1"; // 🔐 You should move this to .env

module.exports = function requireAuth(req, res, next) {
  try {
    // ✅ Allow public routes without auth
    if (PUBLIC_ROUTES.includes(req.path)) {
      return next();
    }

    // ✅ Get token from cookie or header
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({ error: "Authentication token required" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Attach decoded user to request
    req.user = decoded;

    return next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

