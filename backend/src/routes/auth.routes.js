const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const validateMiddleware = require("../middleware/validate.middleware");
const { authenticateJWT } = require("../middleware/validate.middleware");

// Route đăng ký tài khoản
router.post("/register", validateMiddleware.validateRegister, authController.register);

// Route đăng nhập (trả về JWT)
router.post("/login", validateMiddleware.validateLogin, authController.login);

// Route lấy thông tin user từ token
router.get("/me", authenticateJWT, authController.getUser);

// Quên mật khẩu - gửi mã xác nhận
router.post("/forgot-password", authController.forgotPassword);

// Xác minh mã xác nhận
router.post("/verify-code", authController.verifyResetCode);

// Đặt lại mật khẩu
router.post("/reset-password", authController.resetPassword);

// Đổi mật khẩu
router.post("/change-password", authenticateJWT, authController.changePassword);


module.exports = router;
