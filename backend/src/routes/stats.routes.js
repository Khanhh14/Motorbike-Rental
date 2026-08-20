const express = require('express');
const router = express.Router();
const statsController = require("../controllers/stats.controllers");

/**
 * @openapi
 * /api/stats/landing:
 *   get:
 *     summary: Lấy dữ liệu thống kê hiển thị trang chủ (Số xe, số khách hàng, đánh giá trung bình)
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thống kê landing page thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_bikes:
 *                   type: integer
 *                   example: 50
 *                 total_customers:
 *                   type: integer
 *                   example: 1000
 *                 avg_rating:
 *                   type: number
 *                   example: 4.9
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/landing', statsController.getLandingStats);

/**
 * @openapi
 * /api/stats/summary:
 *   get:
 *     summary: Lấy tổng quan số liệu thống kê (Tổng doanh thu, số đơn, số xe...)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy tổng quan thống kê thành công
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.get('/summary', statsController.getSummary);

/**
 * @openapi
 * /api/stats/revenue-by-month:
 *   get:
 *     summary: Thống kê doanh thu theo các tháng
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm cần thống kê (Ví dụ 2026)
 *     responses:
 *       200:
 *         description: Lấy dữ liệu doanh thu theo tháng thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/revenue-by-month', statsController.getRevenueByMonth);

/**
 * @openapi
 * /api/stats/rentals-by-month:
 *   get:
 *     summary: Thống kê số lượng đơn thuê theo các tháng
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm cần thống kê (Ví dụ 2026)
 *     responses:
 *       200:
 *         description: Lấy dữ liệu đơn thuê theo tháng thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/rentals-by-month', statsController.getRentalsByMonth);

/**
 * @openapi
 * /api/stats/top-motorbikes:
 *   get:
 *     summary: Thống kê danh sách xe máy được thuê nhiều nhất
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Số lượng xe hiển thị tối đa
 *     responses:
 *       200:
 *         description: Lấy danh sách top xe thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/top-motorbikes', statsController.getTopMotorbikes);

module.exports = router;