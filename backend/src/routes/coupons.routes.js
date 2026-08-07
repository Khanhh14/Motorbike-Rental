const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupons.controllers");
// Nếu có middleware xác thực admin/user, bạn có thể import vào đây (VD: verifyToken, verifyAdmin)

/**
 * @openapi
 * /api/coupons/apply:
 *   post:
 *     summary: Kiểm tra và áp dụng mã giảm giá cho đơn hàng
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - order_amount
 *             properties:
 *               code:
 *                 type: string
 *                 example: "KHUYENMAI20"
 *                 description: Mã giảm giá người dùng nhập
 *               order_amount:
 *                 type: number
 *                 example: 500000
 *                 description: Tổng giá trị đơn hàng trước giảm giá
 *     responses:
 *       200:
 *         description: Áp dụng mã thành công và trả về số tiền được giảm
 *       400:
 *         description: Mã hết hạn, hết lượt dùng hoặc đơn hàng chưa đủ điều kiện
 *       404:
 *         description: Mã giảm giá không tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/apply", couponController.applyCoupon);

/**
 * @openapi
 * /api/coupons:
 *   get:
 *     summary: Lấy danh sách tất cả mã giảm giá (Dành cho Admin)
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: Lấy danh sách mã giảm giá thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", couponController.getAllCoupons);

/**
 * @openapi
 * /api/coupons:
 *   post:
 *     summary: Tạo mới một mã giảm giá (Dành cho Admin)
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount_value
 *               - start_date
 *               - end_date
 *             properties:
 *               code:
 *                 type: string
 *                 example: "HE2026"
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 default: percentage
 *               discount_value:
 *                 type: number
 *                 example: 15
 *               max_discount_amount:
 *                 type: number
 *                 example: 50000
 *               min_order_value:
 *                 type: number
 *                 example: 200000
 *               usage_limit:
 *                 type: integer
 *                 example: 100
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-01T00:00:00Z"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Tạo mã giảm giá thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc mã đã tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/", couponController.createCoupon);

/**
 * @openapi
 * /api/coupons/{id}:
 *   put:
 *     summary: Cập nhật thông tin mã giảm giá (Dành cho Admin)
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của mã giảm giá cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discount_value:
 *                 type: number
 *               max_discount_amount:
 *                 type: number
 *               min_order_value:
 *                 type: number
 *               usage_limit:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/:id", couponController.updateCoupon);

/**
 * @openapi
 * /api/coupons/{id}:
 *   delete:
 *     summary: Xóa mã giảm giá (Dành cho Admin)
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của mã giảm giá cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/:id", couponController.deleteCoupon);

module.exports = router;