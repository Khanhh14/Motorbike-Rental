const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { sendPasswordResetCode, generateVerificationCode } = require("../utils/mailer"); // import từ file email.js

dotenv.config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Lưu tạm mã xác nhận trong RAM
const verificationCodes = {}; // { email: code }

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token, truy cập bị từ chối!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token không hợp lệ!" });
  }
};

const register = async (req, res) => {
  const { name, email, phone, password, captchaInput } = req.body;

  // Kiểm tra mã captcha người dùng nhập có khớp với session không
  if (
    !req.session.captcha ||
    captchaInput.trim().toLowerCase() !== req.session.captcha.toLowerCase()
  ) {
    return res.status(400).json({
      field: "captchaInput",
      message: "Mã captcha không chính xác!"
    });
  }

  // Xoá captcha khỏi session sau khi kiểm tra thành công (để tránh reuse)
  req.session.captcha = null;

  try {
    const [existingUsers] = await connection.query(
      "SELECT name, email, phone FROM users WHERE name = ? OR email = ? OR phone = ?",
      [name, email, phone]
    );

    if (existingUsers.length > 0) {
      for (const user of existingUsers) {
        if (user.name === name) {
          return res.status(400).json({ field: "name", message: "Tên đăng nhập đã tồn tại!" });
        }
        if (user.email === email) {
          return res.status(400).json({ field: "email", message: "Email đã được sử dụng!" });
        }
        if (user.phone === phone) {
          return res.status(400).json({ field: "phone", message: "Số điện thoại đã được sử dụng!" });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, hashedPassword, "customer"]
    );

    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server!" });
  }
};


const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    const [rows] = await connection.query(
      "SELECT id, name, email, phone, password, role FROM users WHERE name = ?", 
      [name]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng!" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng!" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role, 
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "Không tìm thấy ID user!" });
    }

    const [rows] = await connection.query(
      "SELECT id, name, email, phone, role FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user!" });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

// Gửi mã xác nhận đặt lại mật khẩu
const forgotPassword = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên đăng nhập và email!" });
  }

  try {
    const [rows] = await connection.query(
      "SELECT id, name, email FROM users WHERE name = ? AND email = ?",
      [name, email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tên đăng nhập hoặc email không đúng!" });
    }

    const user = rows[0];
    const code = generateVerificationCode();

    verificationCodes[user.email] = code;

    await sendPasswordResetCode(user.email, user.name, code);

    return res.status(200).json({ message: "Mã xác nhận đã được gửi qua email!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

// Kiểm tra mã xác nhận
const verifyResetCode = (req, res) => {
  const { email, code } = req.body;

  const savedCode = verificationCodes[email];
  if (!savedCode || savedCode !== code) {
    return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn!" });
  }

  return res.status(200).json({ message: "Mã xác nhận hợp lệ!" });
};


const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    // Kiểm tra mã xác nhận
    const savedCode = verificationCodes[email];
    if (!savedCode || savedCode !== code) {
      return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn!" });
    }

    // Mã đúng => mã hóa mật khẩu mới và cập nhật
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await connection.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    // Xóa mã khỏi bộ nhớ sau khi sử dụng
    delete verificationCodes[email];

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server!" });
  }
};


const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới!" });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "Mật khẩu mới và xác nhận mật khẩu không khớp!" });
  }

  try {
    const [rows] = await connection.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    return res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

module.exports = {
  register,
  login,
  getUser,
  authenticateJWT,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,    // <-- thêm dòng này

};
