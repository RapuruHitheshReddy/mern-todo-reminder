const express = require('express');
const http = require('http');
const path = require('path');
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

// 🌍 Dynamic environment setup
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_ORIGIN = isProduction
  ? process.env.PROD_ORIGIN
  : process.env.CLIENT_ORIGIN;

// 📦 Create app and server
const app = express();
const server = http.createServer(app);

// 🌍 CORS config
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === CLIENT_ORIGIN) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// 🔄 Body parsing
app.use(express.json());

// 🧠 Session Setup
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  crypto: {
    secret: process.env.SESSION_SECRET || 'fallbackSecret',
  },
  touchAfter: 24 * 3600,
});
store.on('error', (err) => console.error('❌ MongoStore Error:', err));

const sessionConfig = {
  store,
  name: 'todoSession',
  secret: process.env.SESSION_SECRET || 'fallbackSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// 📁 API Routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.send('✅ Server is up and running.');
});

// 🟢 Serve frontend in production
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 📡 WebSocket setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});
global._io = io;

io.on('connection', (socket) => {
  console.log('📡 New socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// 🔁 Reminder checker
setInterval(() => {
  console.log('⏰ Checking reminders at', new Date().toLocaleTimeString());
  checkReminders(io);
}, 1000);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
