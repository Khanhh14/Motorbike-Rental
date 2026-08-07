const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const validateMiddleware = require("../middleware/validate.middleware");
const { authenticateJWT } = require("../middleware/validate.middleware");

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               phone:
 *                 type: string
 *                 example: 0912345678
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc Email đã tồn tại
 */
router.post("/register", validateMiddleware.validateRegister, authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Đăng nhập thành công (Trả về Token)
 *       401:
 *         description: Sai tài khoản hoặc mật khẩu
 */
router.post("/login", validateMiddleware.validateLogin, authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       401:
 *         description: Unauthenticated (Chưa đăng nhập / Token không hợp lệ)
 */
router.get("/me", authenticateJWT, authController.getUser);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu - Gửi mã xác nhận qua Email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Đã gửi mã xác nhận qua email
 *       404:
 *         description: Email không tồn tại trong hệ thống
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @openapi
 * /api/auth/verify-code:
 *   post:
 *     summary: Xác thực mã reset password gửi về email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Mã xác nhận chính xác
 *       400:
 *         description: Mã xác nhận không đúng hoặc đã hết hạn
 */
router.post("/verify-code", authController.verifyResetCode);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Thông tin không hợp lệ
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     summary: Đổi mật khẩu (khi đã đăng nhập)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu cũ không chính xác
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/change-password", authenticateJWT, authController.changePassword);

module.exports = router;