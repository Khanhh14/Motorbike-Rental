const express = require('express');
const router = express.Router();
const captchaController = require('../controllers/captcha.controllers');

/**
 * @openapi
 * /api/captcha:
 *   get:
 *     summary: Tạo mã Captcha mới
 *     tags: [Captcha]
 *     responses:
 *       200:
 *         description: Lấy mã Captcha thành công (Thường trả về dạng ảnh SVG/Base64 hoặc chuỗi SVG)
 *       500:
 *         description: Lỗi máy chủ khi tạo Captcha
 */
router.get('/', captchaController.getCaptcha);

module.exports = router;