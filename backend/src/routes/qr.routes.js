const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controllers');

/**
 * @openapi
 * /api/qr:
 *   post:
 *     summary: Tạo mã QR thanh toán
 *     tags: [QR Code]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - addInfo
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 300000
 *                 description: Số tiền cần thanh toán
 *               addInfo:
 *                 type: string
 *                 example: Thanh toan don thue xe #123
 *                 description: Nội dung chuyển khoản / thông tin giao dịch
 *               accountNo:
 *                 type: string
 *                 example: "123456789"
 *                 description: Số tài khoản nhận (nếu tùy chỉnh)
 *               accountName:
 *                 type: string
 *                 example: "NGUYEN VAN A"
 *                 description: Tên chủ tài khoản
 *     responses:
 *       200:
 *         description: Tạo mã QR thành công (Trả về link ảnh QR hoặc base64)
 *       400:
 *         description: Thiếu thông tin thanh toán
 *       500:
 *         description: Lỗi máy chủ khi tạo QR
 */
router.post('/', qrController.taoQR);

module.exports = router;