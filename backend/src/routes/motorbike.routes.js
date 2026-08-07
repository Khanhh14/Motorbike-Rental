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

/**
 * @openapi
 * /api/motorbikes:
 *   get:
 *     summary: Lấy danh sách xe máy (Hỗ trợ tìm kiếm, lọc)
 *     tags: [Motorbikes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (Tên xe, biển số...)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Trạng thái xe (available, rented, maintenance)
 *     responses:
 *       200:
 *         description: Lấy danh sách xe thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", motorbikeController.getAllMotorbikes);

/**
 * @openapi
 * /api/motorbikes/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết xe máy theo ID
 *     tags: [Motorbikes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của xe máy
 *     responses:
 *       200:
 *         description: Lấy chi tiết xe thành công
 *       404:
 *         description: Không tìm thấy xe
 */
router.get("/:id", motorbikeController.getMotorbikeById);

/**
 * @openapi
 * /api/motorbikes:
 *   post:
 *     summary: Thêm xe máy mới (có tải lên ảnh)
 *     tags: [Motorbikes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - licensePlate
 *               - pricePerDay
 *             properties:
 *               name:
 *                 type: string
 *                 example: Honda Wave Alpha
 *               licensePlate:
 *                 type: string
 *                 example: 29A1-12345
 *               pricePerDay:
 *                 type: number
 *                 example: 150000
 *               status:
 *                 type: string
 *                 example: available
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh của xe
 *     responses:
 *       201:
 *         description: Thêm xe thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc lỗi upload file
 *       401:
 *         description: Chưa xác thực
 */
router.post("/", uploadMiddleware, motorbikeController.addMotorbike);

/**
 * @openapi
 * /api/motorbikes/{id}:
 *   put:
 *     summary: Cập nhật thông tin xe máy
 *     tags: [Motorbikes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của xe máy cần sửa
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Honda Wave Alpha 2024
 *               licensePlate:
 *                 type: string
 *                 example: 29A1-12345
 *               pricePerDay:
 *                 type: number
 *                 example: 160000
 *               status:
 *                 type: string
 *                 example: available
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh mới (nếu muốn thay đổi)
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy xe
 */
router.put("/:id", uploadMiddleware, motorbikeController.updateMotorbike);

/**
 * @openapi
 * /api/motorbikes/{id}:
 *   delete:
 *     summary: Xóa xe máy
 *     tags: [Motorbikes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của xe máy cần xóa
 *     responses:
 *       200:
 *         description: Xóa xe thành công
 *       404:
 *         description: Không tìm thấy xe
 */
router.delete("/:id", motorbikeController.deleteMotorbike);

module.exports = router;