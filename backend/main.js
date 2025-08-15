/* eslint-disable */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const session = require("express-session");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const app = express();
const server = http.createServer(app);

// ================= Socket.IO =================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// ====== In-memory stores ======
const vehicleLocks = new Map(); // giữ xe tạm thời
// rooms: Map<conversationId, { history:Array, participants:Set }>
const rooms = new Map();

function getRoom(id) {
  if (!rooms.has(id)) {
    rooms.set(id, { history: [], participants: new Set() });
  }
  return rooms.get(id);
}

function lastOf(arr) {
  return arr && arr.length ? arr[arr.length - 1] : null;
}

io.on("connection", function (socket) {
  // ---------- A) LOCK / UNLOCK VEHICLE ----------
  socket.on("lock_vehicle", function (vehicleId) {
    if (!vehicleLocks.has(vehicleId)) {
      vehicleLocks.set(vehicleId, socket.id);
      socket.emit("lock_success", vehicleId);
      socket.broadcast.emit("vehicle_locked", vehicleId);
    } else {
      socket.emit("lock_failed", vehicleId);
    }
  });

  socket.on("unlock_vehicle", function (vehicleId) {
    if (vehicleLocks.get(vehicleId) === socket.id) {
      vehicleLocks.delete(vehicleId);
      socket.broadcast.emit("vehicle_unlocked", vehicleId);
    }
  });

  // ---------- B) CHAT REALTIME ----------
  // Client join phòng: payload { conversationId, isAdmin?, nickname? }
  socket.on(
    "join",
    function (payload) {
      // payload mặc định
      payload = payload || {};
      var conversationId = payload.conversationId;
      var isAdmin = !!payload.isAdmin;
      var nickname = payload.nickname || "Guest";

      if (!conversationId) return;

      socket.data.conversationId = conversationId;
      socket.data.isAdmin = isAdmin;
      socket.data.nickname = nickname;

      var room = getRoom(conversationId);
      room.participants.add(socket.id);
      socket.join(conversationId);

      // gửi lịch sử gần nhất
      socket.emit("history", room.history.slice(-50));

      // thông báo + yêu cầu FE refresh list
      io.to(conversationId).emit("presence", { type: "join", nickname: nickname });
      io.emit("rooms:update");
    }
  );

  // Gửi tin nhắn: payload { text, from }
  socket.on("message", function (payload) {
    payload = payload || {};
    var text = payload.text;
    var from = payload.from;

    var conv = socket.data && socket.data.conversationId;
    if (!conv || !text) return;

    var room = getRoom(conv);
    var msg = { id: uuidv4(), from: from, text: text, ts: Date.now() };

    room.history.push(msg);
    if (room.history.length > 200) {
      room.history.shift();
    }

    io.to(conv).emit("message", msg);
    io.emit("rooms:update"); // cập nhật list ở admin
  });

  // Typing indicator
  socket.on("typing", function (payload) {
    payload = payload || {};
    var from = payload.from;
    var isTyping = !!payload.isTyping;

    var conv = socket.data && socket.data.conversationId;
    if (!conv) return;

    socket.to(conv).emit("typing", { from: from, isTyping: isTyping });
  });

  // Admin: danh sách cuộc trò chuyện
  socket.on("admin:list-conversations", function () {
    if (!(socket.data && socket.data.isAdmin)) return;

    var list = Array.from(rooms.keys())
      .filter(function (id) {
        return id !== "admin-dashboard"; // bỏ phòng hệ thống
      })
      .map(function (id) {
        var room = rooms.get(id);

        var onlineCount = 0;
        var hasCustomer = false;

        room.participants.forEach(function (sid) {
          var s = io.sockets.sockets.get(sid);
          if (s) {
            onlineCount += 1;
            if (!(s.data && s.data.isAdmin)) {
              hasCustomer = true;
            }
          }
        });

        var last = lastOf(room.history);
        return {
          id: id,
          lastTs: (last && last.ts) || 0,
          lastText: (last && last.text) || "",
          onlineCount: onlineCount,
          hasCustomer: hasCustomer,
        };
      })
      .sort(function (a, b) {
        return b.lastTs - a.lastTs;
      });

    socket.emit("admin:conversations", list);
  });

  // ---------- C) CLEANUP ----------
  socket.on("disconnect", function () {
    // giải phóng xe
    for (const [vehicleId, lockerSocketId] of vehicleLocks.entries()) {
      if (lockerSocketId === socket.id) {
        vehicleLocks.delete(vehicleId);
        socket.broadcast.emit("vehicle_unlocked", vehicleId);
      }
    }

    // rời phòng chat
    var conv = socket.data && socket.data.conversationId;
    if (conv && rooms.has(conv)) {
      var room = rooms.get(conv);
      room.participants.delete(socket.id);
      // nếu muốn dọn phòng rỗng:
      // if (room.participants.size === 0 && room.history.length === 0) rooms.delete(conv);
      io.emit("rooms:update");
    }
  });
});

// ================= Middlewares & Routes =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.get("/favicon.ico", function (req, res) {
  return res.status(204).end();
});

// ===== Routes (giữ nguyên của bạn) =====
const authRoutes = require("./src/routes/auth.routes");
const motorbikeRoutes = require("./src/routes/motorbike.routes");
const rentalRoutes = require("./src/routes/rental.routes");
const reviewRoutes = require("./src/routes/review.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const qrRoutes = require("./src/routes/qr.routes");
const statsRoutes = require("./src/routes/stats.routes");
const surchargeRoutes = require("./src/routes/surcharge.routes");
const vehicletype = require("./src/routes/vehicletype.routes");
const captchaRoute = require("./src/routes/captcha.routes");

require("./src/utils/cronJobs");

app.use("/api/auth", authRoutes);
app.use("/api/motorbikes", motorbikeRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/surcharges", surchargeRoutes);
app.use("/api/vehicletype", vehicletype);
app.use("/api/captcha", captchaRoute);

// 404
app.use(function (req, res) {
  res.status(404).json({ error: "Không tìm thấy API" });
});

// Error handler
app.use(function (err, req, res, _next) {
  console.error("Lỗi:", err && err.message ? err.message : err);
  res.status(err && err.status ? err.status : 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Lỗi server!"
        : err && err.message
        ? err.message
        : "Unknown error",
  });
});

// Start
const port = process.env.PORT || 5000;
server.listen(port, function () {
  console.log("Server đang chạy tại: http://localhost:" + port);
});
