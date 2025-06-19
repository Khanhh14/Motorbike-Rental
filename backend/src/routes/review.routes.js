const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controllers");
const validateReview = require("../middleware/validateReview");

// ✅ Thêm route lấy tất cả đánh giá
router.get("/", reviewController.getAllReviews);

// ✅ Lấy danh sách đánh giá của một xe
router.get("/:motorbike_id", reviewController.getReviewsByMotorbike);

// ✅ Thêm đánh giá mới
router.post("/", validateReview, reviewController.createReview);

module.exports = router;
