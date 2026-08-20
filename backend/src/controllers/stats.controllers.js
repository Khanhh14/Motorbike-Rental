const db = require("../config/db");

// 📌 API dành cho Landing Page (Trang chủ): Số lượng xe, Số khách hàng, Đánh giá trung bình
exports.getLandingStats = async (req, res) => {
  try {
    // 1. Tổng số xe máy
    const [[motorbikeStats]] = await db.query(
      `SELECT COUNT(*) AS total_bikes FROM motorbikes`
    );

    // 2. Tổng số khách hàng
    const [[userStats]] = await db.query(
      `SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'`
    );

    // 3. Đánh giá trung bình từ bảng reviews (mặc định 5.0 nếu chưa có review nào)
    const [[ratingStats]] = await db.query(
      `SELECT COALESCE(AVG(rating), 5.0) AS avg_rating FROM reviews`
    );

    res.json({
      total_bikes: motorbikeStats.total_bikes || 0,
      total_customers: userStats.total_customers || 0,
      avg_rating: parseFloat(Number(ratingStats.avg_rating).toFixed(1))
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thống kê landing page:", error);
    res.status(500).json({ error: "Lỗi server khi lấy dữ liệu thống kê" });
  }
};

// 📌 API Thống kê tổng quan cho Admin
exports.getSummary = async (req, res) => {
  try {
    const [[rentalStats]] = await db.query(`SELECT COUNT(*) AS total_rentals FROM rentals`);
    const [[revenueStats]] = await db.query(`SELECT SUM(amount) AS total_revenue FROM payments WHERE status = 'completed'`);
    const [[userStats]] = await db.query(`SELECT COUNT(*) AS total_users FROM users WHERE role = 'customer'`);

    res.json({
      total_rentals: rentalStats.total_rentals || 0,
      total_revenue: revenueStats.total_revenue || 0,
      total_users: userStats.total_users || 0
    });
  } catch (error) {
    console.error("Lỗi getSummary:", error);
    res.status(500).json({ error: "Lỗi khi lấy tổng quan thống kê" });
  }
};

// 📌 Doanh thu theo tháng
exports.getRevenueByMonth = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS total_revenue
      FROM payments
      WHERE status = 'completed'
      GROUP BY month
      ORDER BY month
    `);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi getRevenueByMonth:", error);
    res.status(500).json({ error: "Lỗi khi thống kê doanh thu theo tháng" });
  }
};

// 📌 Lượt thuê theo tháng
exports.getRentalsByMonth = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total_rentals
      FROM rentals
      GROUP BY month
      ORDER BY month
    `);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi getRentalsByMonth:", error);
    res.status(500).json({ error: "Lỗi khi thống kê lượt thuê theo tháng" });
  }
};

// 📌 Top xe được thuê nhiều nhất
exports.getTopMotorbikes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, m.brand, m.model, COUNT(r.id) AS rental_count
      FROM motorbikes m
      JOIN rentals r ON m.id = r.motorbike_id
      GROUP BY m.id, m.brand, m.model
      ORDER BY rental_count DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi getTopMotorbikes:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách xe hàng đầu" });
  }
};