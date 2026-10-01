const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controllers");
const validateReview = require("../middleware/validateReview");

/**
 * @openapi
 * /api/reviews:
 *   get:
 *     summary: Lấy tất cả đánh giá trên hệ thống
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Lấy danh sách đánh giá thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", reviewController.getAllReviews);

/**
 * @openapi
 * /api/reviews/featured:
 *   get:
 *     summary: Lấy 3 đánh giá 5 sao nổi bật cho trang chủ
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Lấy danh sách đánh giá nổi bật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   author:
 *                     type: string
 *                     example: "Minh Hoàng"
 *                   motorbike_name:
 *                     type: string
 *                     example: "Honda Vision 2023"
 *                   rating:
 *                     type: integer
 *                     example: 5
 *                   comment:
 *                     type: string
 *                     example: "Xe chạy rất êm, giao xe đúng giờ!"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/featured", reviewController.getFeaturedReviews);

/**
 * @openapi
 * /api/reviews/{motorbike_id}:
 *   get:
 *     summary: Lấy danh sách đánh giá của một xe cụ thể
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: motorbike_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của xe máy cần xem đánh giá
 *     responses:
 *       200:
 *         description: Lấy danh sách đánh giá theo xe thành công
 *       404:
 *         description: Không tìm thấy xe hoặc chưa có đánh giá
 */
router.get("/:motorbike_id", reviewController.getReviewsByMotorbike);

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     summary: Thêm đánh giá mới cho xe
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motorbikeId
 *               - rating
 *               - comment
 *             properties:
 *               motorbikeId:
 *                 type: string
 *                 example: "1"
 *                 description: ID xe được đánh giá
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Số sao đánh giá (từ 1 đến 5)
 *               comment:
 *                 type: string
 *                 example: Xe chạy rất êm, chủ xe nhiệt tình!
 *                 description: Nội dung bình luận
 *     responses:
 *       201:
 *         description: Thêm đánh giá thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       401:
 *         description: Chưa xác thực người dùng
 */
router.post("/", validateReview, reviewController.createReview);

module.exports = router;