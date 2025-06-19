const express = require("express");
const router = express.Router();
const motorbikeController = require("../controllers/motorbike.controllers");

// Middleware xử lý upload ảnh với kiểm tra lỗi
const uploadMiddleware = (req, res, next) => {
  motorbikeController.upload.single("image")(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Lấy danh sách xe máy (hỗ trợ tìm kiếm)
router.get("/", motorbikeController.getAllMotorbikes);

// ✅ Sửa lỗi: Thêm route để lấy chi tiết xe theo ID
router.get("/:id", motorbikeController.getMotorbikeById);

// Thêm xe mới (hỗ trợ upload ảnh, kiểm tra lỗi upload)
router.post("/", uploadMiddleware, motorbikeController.addMotorbike);

// Cập nhật thông tin xe (upload ảnh là tùy chọn, có kiểm tra lỗi)
router.put("/:id", uploadMiddleware, motorbikeController.updateMotorbike);

// Xóa xe
router.delete("/:id", motorbikeController.deleteMotorbike);

module.exports = router;
