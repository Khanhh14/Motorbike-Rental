const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const session = require("express-session"); // <-- Thêm express-session
const { Server } = require("socket.io");

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

// --- START: Quản lý giữ xe tạm thời bằng socket.io ---
const vehicleLocks = new Map();

io.on("connection", (socket) => {
  // User muốn giữ (lock) xe
  socket.on("lock_vehicle", (vehicleId) => {
    if (!vehicleLocks.has(vehicleId)) {
      vehicleLocks.set(vehicleId, socket.id);
      socket.emit("lock_success", vehicleId);
      socket.broadcast.emit("vehicle_locked", vehicleId);
    } else {
      socket.emit("lock_failed", vehicleId);
    }
  });

  // User bỏ giữ (unlock) xe
  socket.on("unlock_vehicle", (vehicleId) => {
    if (vehicleLocks.get(vehicleId) === socket.id) {
      vehicleLocks.delete(vehicleId);
      socket.broadcast.emit("vehicle_unlocked", vehicleId);
    }
  });

  // Khi user mất kết nối, tự động giải phóng xe đang giữ
  socket.on("disconnect", () => {
    for (const [vehicleId, lockerSocketId] of vehicleLocks.entries()) {
      if (lockerSocketId === socket.id) {
        vehicleLocks.delete(vehicleId);
        socket.broadcast.emit("vehicle_unlocked", vehicleId);
      }
    }
  });
});
// --- END: Quản lý giữ xe tạm thời ---

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Thêm express-session middleware để lưu captcha trong session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // true nếu bạn dùng HTTPS
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
// Gắn route captcha
app.use("/api/captcha", captchaRoute);

// ✅ Middleware lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Không tìm thấy API" });
});

// ✅ Middleware lỗi chung
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
