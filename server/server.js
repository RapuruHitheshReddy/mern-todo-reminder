const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const connectDB = require('./config/db');
const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/auth');
const checkReminders = require('./reminderChecker');
const { Server } = require('socket.io');

// 🌐 Load environment variables
dotenv.config();

// 🔗 Connect to MongoDB
connectDB();

// 🔐 Passport config
require('./config/passport')(passport);

// 📦 Create app and server
const app = express();
const server = http.createServer(app);

// 📡 Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
global._io = io;

// ⚙️ Middleware
app.use(express.json());

// 🌍 CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// 🛒 MongoStore Session Setup
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  crypto: {
    secret: process.env.SESSION_SECRET || 'fallbackSecret',
  },
  touchAfter: 24 * 3600,
});

store.on('error', (err) => {
  console.log('❌ MongoStore Error:', err);
});

// 🧠 Session Config
const sessionConfig = {
  store,
  name: 'todoSession',
  secret: process.env.SESSION_SECRET || 'fallbackSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// 📁 Routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

// ✅ Add a root route for Render health check
app.get('/', (req, res) => {
  res.send('✅ Server is up and running.');
});

// 🔁 Reminder Checker
setInterval(() => {
  console.log('⏰ Checking reminders at', new Date().toLocaleTimeString());
  checkReminders(io);
}, 1000);

// 📡 WebSocket setup
io.on('connection', (socket) => {
  console.log('📡 New socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
