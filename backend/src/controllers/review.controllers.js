const db = require("../config/db");

// ✅ Lấy tất cả đánh giá
exports.getAllReviews = async (req, res) => {
  try {
    const sql = `
      SELECT r.id, u.name AS username, m.model AS motorbike_name, r.rating, r.comment, r.created_at 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN motorbikes m ON r.motorbike_id = m.id
      ORDER BY r.created_at DESC
    `;
    const [results] = await db.query(sql);

    if (results.length === 0) {
      return res.status(404).json({ message: "Chưa có đánh giá nào!" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Lỗi khi lấy tất cả đánh giá:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Thêm đánh giá mới
exports.createReview = async (req, res) => {
  try {
    const { user_id, motorbike_id, rating, comment } = req.body;

    if (!user_id || !motorbike_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }

    const sql = `
      INSERT INTO reviews (user_id, motorbike_id, rating, comment, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;
    const [result] = await db.query(sql, [user_id, motorbike_id, rating, comment]);

    res.json({
      message: "Đánh giá thành công!",
      review_id: result.insertId,
      review: {
        id: result.insertId,
        user_id,
        motorbike_id,
        rating,
        comment,
        created_at: new Date(),
      }
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm đánh giá:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Lấy đánh giá theo xe
exports.getReviewsByMotorbike = async (req, res) => {
  try {
    const { motorbike_id } = req.params;

    if (!motorbike_id) {
      return res.status(400).json({ message: "Thiếu motorbike_id!" });
    }

    const sql = `
      SELECT r.id, u.name AS username, r.rating, r.comment, r.created_at 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.motorbike_id = ? 
      ORDER BY r.created_at DESC
    `;
    const [results] = await db.query(sql, [motorbike_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Chưa có đánh giá nào!" });
    }

    res.json(results);
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
