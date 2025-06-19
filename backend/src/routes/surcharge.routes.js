const express = require('express');
const router = express.Router();
const surchargeController = require("../controllers/surcharge.controllers");
const { requireAuth } = require('../middleware/validate.middleware');



// POST /api/surcharges – Tạo phụ thu
router.post('/', surchargeController.createSurcharge);

// GET /api/surcharges?rental_id=1 – Hiển thị phụ thu
router.get('/', surchargeController.getSurcharges);

// Thêm route PUT để cập nhật trạng thái
router.put('/:id', surchargeController.updateSurchargeStatus);

// GET /api/surcharges/user – Hiển thị phụ thu của user đang đăng nhập
router.get('/user', requireAuth, surchargeController.getUserSurcharges);


module.exports = router;
