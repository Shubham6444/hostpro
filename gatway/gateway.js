
// ✅ Load Environment Variables
require('dotenv').config();

// ✅ Core Modules & Middleware
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
// const initialServices = require('./services/autostart');

// ✅ Custom Modules
const connectDB = require('./config/db');
const setupProxyRoutes = require('./services/proxy');
const { checkAllServices } = require('./services/healthMonitor');
const setupTerminal = require('./routes/terminal');

const loginRoute = require('./routes/login');
const healthRoute = require('./routes/health');
const controlRoutes = require('./routes/control');
const editorRoutes = require('./routes/editorRoutes');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');

// ✅ Initialize App & Server
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.GATEWAY_PORT || 3000;

// ✅ Proxy Setup BEFORE Body Parsing
setupProxyRoutes(app);

// ✅ Middleware

app.use(express.static('public'));
app.use(cors({ origin: 'https://remixorbit.in/', methods: ["GET", "POST"], credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// ✅ Static Frontend Routes
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use("/app1", express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ✅ Apply Auth Middleware (after public routes)
app.use(authMiddleware);

// ✅ API Routes
app.use('/auth', loginRoute);
app.use('/health', healthRoute);
app.use('/control', controlRoutes);
app.use('/editor', editorRoutes);
app.use('/api', userRoutes);
// app.use('/api/admin', adminRoutes);

// ✅ MongoDB Connection
// (async () => {
//   try {
//     await connectDB();
//   } catch (err) {
//     console.error('❌ Failed to connect to MongoDB:', err.message);
//     process.exit(1);
//   }
// })();
(async () => {
  try {
    await connectDB();
  } catch (err) { 
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(0);
  }

  // 👇 Start all services here
  // for (const [name, file] of Object.entries(initialServices)) {
  //   try {
  //     const result = await startService(name, file);
  //     console.log(`✅ Auto-started ${name}:`, result.message || result.error);
  //   } catch (err) {
  //     console.error(`❌ Failed to auto-start ${name}:`, err.message);
  //   }
  // }
})();

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  socket.emit('welcome', { msg: '📡 Connected to API Gateway' });

  checkAllServices({ emit: (event, data) => socket.emit(event, data) });
  setupTerminal(io);

  const interval = setInterval(() => {
    checkAllServices(io);
  }, 10000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`🚪 API Gateway running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
});

// ✅ Error Handling
process.on('uncaughtException', (err) => {
  console.error('❗ Uncaught Exception:', err);
  process.exit(1);
});

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❗ Unhandled Rejection:', reason);
//   process.exit(1);
// }); 

process.on('unhandledRejection', (reason, promise) => {
  console.error('❗ Unhandled Rejection:', reason);
  // Optional: shut down or log properly
});

