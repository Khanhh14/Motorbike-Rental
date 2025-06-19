// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const validateRegister = (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { name, password } = req.body;

  if (!name?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu!" });
  }

  next();
};

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(); // Không có token, tiếp tục xử lý như người dùng chưa đăng nhập
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token không hợp lệ!" });
    }

    req.user = user; // Gán thông tin người dùng vào req.user
    next();
  });
};

// Middleware yêu cầu phải đăng nhập, nếu không có token hoặc token không hợp lệ sẽ trả về lỗi
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn cần đăng nhập để truy cập." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ." });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  validateRegister,
  validateLogin,
  authenticateJWT,
  requireAuth,
};
