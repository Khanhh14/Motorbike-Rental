const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controllers");

/**
 * @openapi
 * /api/payments:
 *   get:
 *     summary: Lấy danh sách tất cả giao dịch thanh toán
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thanh toán thành công
 *       401:
 *         description: Chưa xác thực
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", paymentController.getAllPayments);

/**
 * @openapi
 * /api/payments:
 *   post:
 *     summary: Tạo giao dịch thanh toán mới
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rentalId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               rentalId:
 *                 type: string
 *                 example: "123"
 *                 description: ID của đơn thuê xe
 *               amount:
 *                 type: number
 *                 example: 300000
 *                 description: Số tiền thanh toán
 *               paymentMethod:
 *                 type: string
 *                 example: cash
 *                 description: Phương thức thanh toán (cash, vnpay, chuyển khoản...)
 *     responses:
 *       201:
 *         description: Tạo thanh toán thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post("/", paymentController.createPayment);

/**
 * @openapi
 * /api/payments/{rental_id}:
 *   get:
 *     summary: Lấy danh sách thanh toán theo ID đơn thuê xe
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rental_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn thuê xe
 *     responses:
 *       200:
 *         description: Lấy chi tiết thanh toán theo đơn thành công
 *       404:
 *         description: Không tìm thấy giao dịch cho đơn thuê này
 */
router.get("/:rental_id", paymentController.getPaymentsByRental);

/**
 * @openapi
 * /api/payments/{id}:
 *   put:
 *     summary: Cập nhật trạng thái thanh toán
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch thanh toán
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
 *                 example: completed
 *                 description: Trạng thái mới (pending, completed, failed)
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thanh toán thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       404:
 *         description: Không tìm thấy giao dịch thanh toán
 */
router.put("/:id", paymentController.updatePaymentStatus);

module.exports = router;