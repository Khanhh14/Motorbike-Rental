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
 * ✅ API cho ADMIN: lấy tất cả đơn thuê
 * (GET /api/rentals)
 */
router.get("/", authMiddleware, rentalController.getRentals);

/**
 * ✅ API cho USER: lấy các đơn thuê của chính họ
 * (GET /api/rentals/user-rentals)
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
 * ✅ API: Lấy chi tiết đơn thuê theo ID (chỉ của user đó)
 */
router.get("/:id", authMiddleware, rentalController.getRentalById);

/**
 * ✅ API: Tạo đơn thuê mới
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
 * ✅ API: Cập nhật trạng thái đơn thuê
 */
if (typeof rentalController.updateRentalStatus === "function") {
  router.put("/:id/status", authMiddleware, rentalController.updateRentalStatus);
}

/**
 * ✅ API: Xóa đơn thuê
 */
if (typeof rentalController.deleteRental === "function") {
  router.delete("/:id", authMiddleware, rentalController.deleteRental);
}

/**
 * ✅ API: Tự động cập nhật trạng thái đơn thuê khi quá hạn
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

module.exports = router;
