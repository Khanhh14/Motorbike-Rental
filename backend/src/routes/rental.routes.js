const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rental.controllers");
const validateRentalData = require("../middleware/validateRental");
const cookieParser = require("cookie-parser");
const db = require("../config/db"); // Thêm import db nếu chưa có

// Import middleware xác thực từ validate.middleware.js
const { authenticateJWT } = require("../middleware/validate.middleware");
const authMiddleware = authenticateJWT;

// Dùng cookie-parser nếu cần (dù hiện tại đang dùng token)
router.use(cookieParser());

/**
 * @openapi
 * /api/rentals:
 *   get:
 *     summary: Lấy danh sách tất cả đơn thuê (Dành cho Admin)
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn thuê thành công
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.get("/", authMiddleware, rentalController.getRentals);

/**
 * @openapi
 * /api/rentals/user-rentals:
 *   get:
 *     summary: Lấy danh sách đơn thuê của chính người dùng đang đăng nhập
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn thuê thành công
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy đơn thuê nào
 */
router.get("/user-rentals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Chưa xác thực!" });
    }

    const rentals = await rentalController.getUserRentalsById(userId);

    if (!rentals || rentals.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn thuê nào." });
    }

    res.json(rentals);
  } catch (error) {
    console.error("Lỗi khi lấy đơn thuê của user:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/**
 * @openapi
 * /api/rentals/update-status:
 *   put:
 *     summary: Tự động kiểm tra và cập nhật trạng thái các đơn thuê quá hạn
 *     tags: [Rentals]
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái đơn thuê thành công
 *       500:
 *         description: Lỗi server
 */
if (typeof rentalController.checkAndUpdateRentals === "function") {
  router.put("/update-status", rentalController.checkAndUpdateRentals);

  // Tự động cập nhật định kỳ mỗi 60 giây
  setInterval(async () => {
    try {
      await rentalController.checkAndUpdateRentals();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn thuê:", error);
    }
  }, 60000);
}

/**
 * @openapi
 * /api/rentals/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết đơn thuê theo ID
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn thuê
 *     responses:
 *       200:
 *         description: Lấy chi tiết thành công
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy đơn thuê
 */
router.get("/:id", authMiddleware, rentalController.getRentalById);

/**
 * @openapi
 * /api/rentals:
 *   post:
 *     summary: Tạo đơn thuê xe mới
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motorbike_id
 *               - start_date
 *               - end_date
 *               - total_price
 *             properties:
 *               motorbike_id:
 *                 type: string
 *                 example: "12"
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-10T08:00:00Z"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-12T08:00:00Z"
 *               total_price:
 *                 type: number
 *                 example: 300000
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *                 description: Nhập nếu tạo tài khoản khách (Guest)
 *               phone:
 *                 type: string
 *                 example: "0912345678"
 *               email:
 *                 type: string
 *                 example: "guest@example.com"
 *     responses:
 *       201:
 *         description: Tạo đơn thuê thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/", authMiddleware, validateRentalData, async (req, res) => {
  try {
    const { motorbike_id, start_date, end_date, total_price, name, phone, email } = req.body;
    let user_id = req.user?.id;

    if (!user_id) {
      // Người dùng chưa đăng nhập, tạo tài khoản guest
      const [result] = await db.query(
        "INSERT INTO users (name, phone, email, role) VALUES (?, ?, ?, 'guest')",
        [name, phone, email]
      );

      if (!result.insertId) {
        return res.status(500).json({ error: "Không thể tạo tài khoản guest" });
      }

      user_id = result.insertId;
    }

    // Tạo đơn thuê
    const rentalData = { user_id, motorbike_id, start_date, end_date, total_price };
    const rental = await rentalController.createRental({ body: rentalData });

    res.status(201).json({
      message: "Tạo đơn thuê thành công!",
      rentalId: rental.rentalId, // Trả về rentalId trực tiếp
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn thuê:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/**
 * @openapi
 * /api/rentals/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn thuê
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn thuê cần cập nhật
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
 *                 example: "confirmed"
 *                 description: Trạng thái mới (pending, confirmed, completed, cancelled)
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy đơn thuê
 */
if (typeof rentalController.updateRentalStatus === "function") {
  router.put("/:id/status", authMiddleware, rentalController.updateRentalStatus);
}

/**
 * @openapi
 * /api/rentals/{id}:
 *   delete:
 *     summary: Xóa đơn thuê
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đơn thuê cần xóa
 *     responses:
 *       200:
 *         description: Xóa đơn thuê thành công
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy đơn thuê
 */
if (typeof rentalController.deleteRental === "function") {
  router.delete("/:id", authMiddleware, rentalController.deleteRental);
}

module.exports = router;