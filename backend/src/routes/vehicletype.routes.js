const express = require("express");
const router = express.Router();
const vehicleTypeController = require("../controllers/vehicletype.controllers");

/**
 * @openapi
 * /api/vehicle-types:
 *   get:
 *     summary: Lấy danh sách tất cả các loại xe
 *     tags: [Vehicle Types]
 *     responses:
 *       200:
 *         description: Lấy danh sách loại xe thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", vehicleTypeController.getAllVehicleTypes);

/**
 * @openapi
 * /api/vehicle-types:
 *   post:
 *     summary: Tạo mới một loại xe
 *     tags: [Vehicle Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Xe tay ga
 *                 description: Tên loại xe (Xe tay ga, Xe số, Xe côn tay...)
 *               description:
 *                 type: string
 *                 example: Các dòng xe tay ga dễ lái, tiện lợi trong thành phố
 *                 description: Mô tả chi tiết về loại xe
 *     responses:
 *       201:
 *         description: Tạo loại xe thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post("/", vehicleTypeController.createVehicleType);

/**
 * @openapi
 * /api/vehicle-types/{id}:
 *   put:
 *     summary: Cập nhật thông tin loại xe
 *     tags: [Vehicle Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của loại xe cần chỉnh sửa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Xe tay ga cao cấp
 *               description:
 *                 type: string
 *                 example: Cập nhật mô tả loại xe
 *     responses:
 *       200:
 *         description: Cập nhật loại xe thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy loại xe
 */
router.put("/:id", vehicleTypeController.updateVehicleType);

/**
 * @openapi
 * /api/vehicle-types/{id}:
 *   delete:
 *     summary: Xóa loại xe
 *     tags: [Vehicle Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của loại xe cần xóa
 *     responses:
 *       200:
 *         description: Xóa loại xe thành công
 *       404:
 *         description: Không tìm thấy loại xe
 */
router.delete("/:id", vehicleTypeController.deleteVehicleType);

module.exports = router;