const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const connectDB = require("./config/db");
const todoRoutes = require("./routes/todoRoutes");
const authRoutes = require("./routes/auth");
const checkReminders = require("./reminderChecker");
const { Server } = require("socket.io");

// 🌐 Load env vars
dotenv.config();

// 🔗 MongoDB
connectDB();

// 🔐 Passport strategy
require("./config/passport")(passport);

// 🌍 Define constants
const CLIENT_ORIGIN = "https://mern-todo-reminder-8knm.onrender.com";
const app = express();
const server = http.createServer(app);

// 🌐 CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// 🔄 Body parser
app.use(express.json());

// 🧠 Sessions
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  crypto: { secret: process.env.SESSION_SECRET || "fallbackSecret" },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => console.error("❌ MongoStore Error:", err));

app.use(
  session({
    store,
    name: "todoSession",
    secret: process.env.SESSION_SECRET || "fallbackSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: true, // ✅ Required on HTTPS
      sameSite: "none", // ✅ Allow cross-origin cookies from frontend
    },
  })
);

// 🔐 Auth
app.use(passport.initialize());
app.use(passport.session());

// 📁 Routes
app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);

// ✅ Health route
app.get("/api/health", (req, res) => {
  res.send("✅ Server is up and running.");
});

// 🟢 Serve frontend (production)
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/build");
  app.use(express.static(clientBuildPath));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, "index.html"));
  });
}

// 📡 WebSocket
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

global._io = io;

io.on("connection", (socket) => {
  console.log("📡 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ⏰ Start reminder checker
setInterval(() => {
  console.log("⏰ Checking reminders at", new Date().toLocaleTimeString());
  checkReminders(io);
}, 1000);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
