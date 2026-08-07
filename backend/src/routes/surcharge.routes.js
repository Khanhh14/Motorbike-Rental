const express = require('express');
const router = express.Router();
const surchargeController = require("../controllers/surcharge.controllers");
const { requireAuth } = require('../middleware/validate.middleware');

/**
 * @openapi
 * /api/surcharges:
 *   post:
 *     summary: Tạo phụ thu mới
 *     tags: [Surcharges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rental_id
 *               - amount
 *               - reason
 *             properties:
 *               rental_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID của đơn thuê xe
 *               amount:
 *                 type: number
 *                 example: 50000
 *                 description: Số tiền phụ thu
 *               reason:
 *                 type: string
 *                 example: Trả xe trễ 2 giờ
 *                 description: Lý do phụ thu
 *     responses:
 *       201:
 *         description: Tạo phụ thu thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post('/', surchargeController.createSurcharge);

/**
 * @openapi
 * /api/surcharges/user:
 *   get:
 *     summary: Lấy danh sách phụ thu của người dùng đang đăng nhập
 *     tags: [Surcharges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách phụ thu của user thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/user', requireAuth, surchargeController.getUserSurcharges);

/**
 * @openapi
 * /api/surcharges:
 *   get:
 *     summary: Lấy danh sách phụ thu (Có thể lọc theo rental_id)
 *     tags: [Surcharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rental_id
 *         schema:
 *           type: integer
 *         description: Lọc phụ thu theo ID đơn thuê xe (VD ?rental_id=1)
 *     responses:
 *       200:
 *         description: Lấy danh sách phụ thu thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/', surchargeController.getSurcharges);

/**
 * @openapi
 * /api/surcharges/{id}:
 *   put:
 *     summary: Cập nhật trạng thái phụ thu
 *     tags: [Surcharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bản ghi phụ thu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: paid
 *                 description: Trạng thái mới (pending, paid, cancelled)
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       404:
 *         description: Không tìm thấy phụ thu
 */
router.put('/:id', surchargeController.updateSurchargeStatus);

module.exports = router;