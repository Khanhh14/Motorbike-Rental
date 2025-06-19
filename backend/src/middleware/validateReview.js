const validateReview = (req, res, next) => {
    const { user_id, motorbike_id, rating, comment } = req.body;
  
    // Kiểm tra trường dữ liệu có hợp lệ không
    if (!user_id || !motorbike_id || !rating || !comment) {
      return res.status(400).json({ message: "Thiếu thông tin đánh giá!" });
    }
  
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Số sao phải từ 1 đến 5!" });
    }
  
    if (comment.trim().length < 5) {
      return res.status(400).json({ message: "Bình luận phải có ít nhất 5 ký tự!" });
    }
  
    next(); // Nếu hợp lệ, chuyển tiếp request đến controller
  };
  
  module.exports = validateReview;
  