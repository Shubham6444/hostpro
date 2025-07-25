const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const expressWs = require("express-ws");

// Create HTTP server and attach WebSocket
const app = express();
const server = http.createServer(app);
expressWs(app, server); // ✅ WebSocket support

// Load routes
const { CONFIG } = require("./config/db");
const editorRoutes = require("./routers/editorRoutes");
const adminRoutes = require("./routers/adminRoutes");
const sslRoutes = require("./routers/domain");
const vmRoutes = require("./routers/vmCreate");
const networkRoutes = require("./routers/create-network");
const userRoutes = require("./routers/adminRoutes/vm_mappings");
const sshRouter = require("./routers/ssh2connt");

// Middleware
const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000'];
app.use("/", sshRouter); // ✅ WebSocket SSH router

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
app.use("/editor", editorRoutes);
app.use("/admin", adminRoutes);
app.use(sslRoutes);
app.use(vmRoutes);
app.use("/", networkRoutes);
app.use("/api", userRoutes);
app.use("/api/stats", require("./routers/stats"));

// Static pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Start server with WebSocket support
server.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running at http://localhost:${CONFIG.PORT}`);
});
