const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const session = require("express-session");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");            // <-- dùng cho id message

dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ Tạo socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

/* ===========================
   START: SOCKET FEATURES
   - 1) Giữ xe tạm thời (đã có)
   - 2) Chat realtime (mới)
   =========================== */

// --- (1) Giữ xe tạm thời ---
const vehicleLocks = new Map();

// --- (2) Chat realtime (in-memory) ---
/**
 * rooms = Map<conversationId, {
 *   history: Array<{id, from, text, ts}>,
 *   participants: Set<socketId>
 * }>
 */
const rooms = new Map();
function getRoom(id) {
  if (!rooms.has(id)) rooms.set(id, { history: [], participants: new Set() });
  return rooms.get(id);
}

io.on("connection", (socket) => {
  /* --------- A) LOCK/UNLOCK VEHICLE --------- */
  socket.on("lock_vehicle", (vehicleId) => {
    if (!vehicleLocks.has(vehicleId)) {
      vehicleLocks.set(vehicleId, socket.id);
      socket.emit("lock_success", vehicleId);
      socket.broadcast.emit("vehicle_locked", vehicleId);
    } else {
      socket.emit("lock_failed", vehicleId);
    }
  });

  socket.on("unlock_vehicle", (vehicleId) => {
    if (vehicleLocks.get(vehicleId) === socket.id) {
      vehicleLocks.delete(vehicleId);
      socket.broadcast.emit("vehicle_unlocked", vehicleId);
    }
  });

  /* --------- B) CHAT REALTIME --------- */
  // Client gửi khi mở widget / trang admin
  // payload: { conversationId, isAdmin?, nickname? }
  socket.on("join", ({ conversationId, isAdmin = false, nickname = "Guest" } = {}) => {
    if (!conversationId) return;
    socket.data.conversationId = conversationId;
    socket.data.isAdmin = !!isAdmin;
    socket.data.nickname = nickname;

    const room = getRoom(conversationId);
    room.participants.add(socket.id);
    socket.join(conversationId);

    // gửi lại lịch sử (tối đa 50 tin)
    const history = room.history.slice(-50);
    socket.emit("history", history);

    // thông báo hiện diện (nếu cần dùng phía client)
    io.to(conversationId).emit("presence", { type: "join", nickname });
  });

  // Gửi tin nhắn: { text, from }  (from: 'me' | 'admin' ...)
  socket.on("message", ({ text, from } = {}) => {
    const conv = socket.data.conversationId;
    if (!conv || !text) return;

    const msg = { id: uuidv4(), from, text, ts: Date.now() };
    const room = getRoom(conv);

    room.history.push(msg);
    if (room.history.length > 200) room.history.shift(); // hạn chế bộ nhớ

    io.to(conv).emit("message", msg);
  });

  // Typing indicator
  socket.on("typing", ({ from, isTyping } = {}) => {
    const conv = socket.data.conversationId;
    if (!conv) return;
    socket.to(conv).emit("typing", { from, isTyping });
  });

  // Admin: liệt kê các cuộc trò chuyện đang có
  socket.on("admin:list-conversations", () => {
    if (!socket.data.isAdmin) return;
    const list = Array.from(rooms.keys()).map((id) => ({
      id,
      lastTs: rooms.get(id).history.at(-1)?.ts || 0,
      lastText: rooms.get(id).history.at(-1)?.text || "",
    }));
    socket.emit("admin:conversations", list.sort((a, b) => b.lastTs - a.lastTs));
  });

  /* --------- C) CLEANUP khi disconnect --------- */
  socket.on("disconnect", () => {
    // giải phóng xe
    for (const [vehicleId, lockerSocketId] of vehicleLocks.entries()) {
      if (lockerSocketId === socket.id) {
        vehicleLocks.delete(vehicleId);
        socket.broadcast.emit("vehicle_unlocked", vehicleId);
      }
    }

    // rời phòng chat
    const conv = socket.data?.conversationId;
    if (conv && rooms.has(conv)) {
      const room = rooms.get(conv);
      room.participants.delete(socket.id);
      // nếu muốn dọn lịch sử khi không còn ai và không có tin nào, bật dòng dưới
      // if (room.participants.size === 0 && room.history.length === 0) rooms.delete(conv);
    }
  });
});
// --- END SOCKET FEATURES ---

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// session để lưu captcha (hoặc mục đích khác)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // true nếu dùng HTTPS/Proxy thiết lập trust
  })
);

// ✅ Cho phép truy cập thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Cấu hình CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Chặn favicon lỗi
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ✅ Import routes
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

// ✅ Import cron job
require("./src/utils/cronJobs");

// ✅ Gắn routes
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

// ✅ 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Không tìm thấy API" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Lỗi:", err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Lỗi server!" : err.message,
  });
});

// ✅ Khởi động server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`);
});
