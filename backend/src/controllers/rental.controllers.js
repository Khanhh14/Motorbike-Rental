const db = require("../config/db");
const cron = require("node-cron");
const { sendRentalAcceptedEmail, sendRentalRejectedEmail } = require("../utils/mailer");

const imageBaseUrl = "http://localhost:5000"; // Hoặc có thể sử dụng URL từ biến môi trường

// Hàm trợ giúp chuẩn hóa URL ảnh cho các xe
const normalizeImageUrl = (value) => {
  if (!value) return null;

  const trimmed = value.toString().trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const withoutLeadingSlash = trimmed.replace(/^\/+/, "");
  if (withoutLeadingSlash.startsWith("uploads/")) {
    return `${imageBaseUrl}/${withoutLeadingSlash}`;
  }

  return `${imageBaseUrl}/uploads/${withoutLeadingSlash}`;
};

exports.getRentals = async (req, res) => {
  try {
    const query = `
      SELECT 
        rentals.id, 
        users.name AS renter_name,
        motorbikes.model AS motorbike_model,
        motorbikes.image_url AS motorbike_image,
        rentals.start_date,
        rentals.end_date,
        rentals.total_price,
        rentals.discount_amount,
        coupons.code AS coupon_code,
        rentals.status
      FROM rentals
      JOIN users ON rentals.user_id = users.id
      JOIN motorbikes ON rentals.motorbike_id = motorbikes.id
      LEFT JOIN coupons ON rentals.coupon_id = coupons.id
    `;

    const [rows] = await db.query(query);
    rows.forEach(row => {
      row.motorbike_image = normalizeImageUrl(row.motorbike_image);
    });
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn thuê:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách đơn thuê" });
  }
};

// 📌 Hàm dùng cho route truyền userId từ cookie/middleware
exports.getUserRentalsById = async (userId) => {
  const query = `
      SELECT rentals.id, 
             users.name AS renter_name, 
             motorbikes.model AS motorbike_model,
             motorbikes.image_url AS motorbike_image,
             motorbikes.id AS motorbike_id,
             rentals.start_date, 
             rentals.end_date, 
             rentals.total_price, 
             rentals.discount_amount,
             coupons.code AS coupon_code,
             rentals.status
      FROM rentals
      JOIN motorbikes ON rentals.motorbike_id = motorbikes.id
      JOIN users ON rentals.user_id = users.id
      LEFT JOIN coupons ON rentals.coupon_id = coupons.id
      WHERE rentals.user_id = ?
      ORDER BY rentals.start_date DESC
    `;
  const [rows] = await db.query(query, [userId]);
  
  rows.forEach(row => {
    row.motorbike_image = normalizeImageUrl(row.motorbike_image);
  });

  return rows;
};

// 🚨 API: GET /api/rentals/user-rentals
exports.getUserRentals = async (req, res) => {
  try {
    const user_id = req.user.id;

    const sql = `
      SELECT 
        r.id, 
        m.id AS motorbike_id,
        m.model AS motorbike_model,
        m.image_url AS motorbike_image,
        r.start_date, 
        r.end_date, 
        r.total_price, 
        r.discount_amount,
        c.code AS coupon_code,
        r.status 
      FROM rentals r
      JOIN motorbikes m ON r.motorbike_id = m.id
      LEFT JOIN coupons c ON r.coupon_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.start_date DESC
    `;

    const [results] = await db.query(sql, [user_id]);

    results.forEach(result => {
      result.motorbike_image = normalizeImageUrl(result.motorbike_image);
    });

    res.status(200).json(results);
    
  } catch (err) {
    console.error("❌ Lỗi khi lấy đơn thuê của người dùng:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Lấy chi tiết đơn thuê theo ID
exports.getRentalById = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT rentals.*, 
              motorbikes.model AS motorbike_model, 
              motorbikes.image_url AS motorbike_image,
              coupons.code AS coupon_code
       FROM rentals
       JOIN motorbikes ON rentals.motorbike_id = motorbikes.id
       LEFT JOIN coupons ON rentals.coupon_id = coupons.id
       WHERE rentals.id = ? AND rentals.user_id = ?`,
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn thuê" });
    }

    rows[0].motorbike_image = normalizeImageUrl(rows[0].motorbike_image);

    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn thuê:", error);
    res.status(500).json({ error: "Lỗi lấy chi tiết đơn thuê" });
  }
};

// ✅ Tạo đơn thuê mới (Tích hợp giảm giá Coupon)
exports.createRental = async ({ body }) => {
  try {
    let { user_id, motorbike_id, start_date, end_date, total_price, coupon_code, name, phone, email } = body;

    // Nếu user_id chưa có (khách vãng lai), yêu cầu thông tin cá nhân
    if (!user_id) {
      if (!name || !phone || !email) {
        throw new Error("Cần nhập đầy đủ thông tin cá nhân để thuê xe");
      }

      const [userResult] = await db.query(
        "INSERT INTO users (name, phone, email, role) VALUES (?, ?, ?, 'guest')",
        [name, phone, email]
      );

      if (!userResult.insertId) {
        throw new Error("Không thể tạo tài khoản guest");
      }

      user_id = userResult.insertId;
    }

    // Kiểm tra xe có khả dụng không
    const [motorbike] = await db.query("SELECT price_per_day, status FROM motorbikes WHERE id = ?", [motorbike_id]);

    if (!motorbike.length) {
      throw new Error("Không tìm thấy xe");
    }

    if (motorbike[0].status === "Rented") {
      throw new Error("Xe hiện đang được thuê");
    }

    // Tính tổng tiền gốc theo ngày
    const price_per_day = motorbike[0].price_per_day;
    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    let originalPrice = days > 0 ? days * price_per_day : 0;

    let appliedCouponId = null;
    let discountAmount = 0;

    // Bắt đầu transaction
    await db.query("START TRANSACTION");

    // Xử lý Coupon nếu được gửi lên
    if (coupon_code) {
      const [coupons] = await db.query(
        `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE FOR UPDATE`,
        [coupon_code]
      );

      if (coupons.length === 0) {
        throw new Error("Mã giảm giá không hợp lệ");
      }

      const coupon = coupons[0];
      const now = new Date();

      if (new Date(coupon.start_date) > now || new Date(coupon.end_date) < now) {
        throw new Error("Mã giảm giá đã hết hạn sử dụng");
      }

      if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        throw new Error("Mã giảm giá đã hết lượt sử dụng");
      }

      if (originalPrice < parseFloat(coupon.min_order_value)) {
        throw new Error(`Đơn hàng tối thiểu ${coupon.min_order_value} VNĐ để áp dụng mã`);
      }

      // Tính tiền giảm
      if (coupon.discount_type === "percentage") {
        discountAmount = (originalPrice * parseFloat(coupon.discount_value)) / 100;
        if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
          discountAmount = parseFloat(coupon.max_discount_amount);
        }
      } else {
        discountAmount = parseFloat(coupon.discount_value);
      }

      if (discountAmount > originalPrice) discountAmount = originalPrice;

      appliedCouponId = coupon.id;

      // Cập nhật số lần mã đã được dùng
      await db.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [coupon.id]);
    }

    // Tính tổng giá thực tế khách phải trả
    const finalTotalPrice = total_price !== undefined ? total_price : (originalPrice - discountAmount);

    // Tạo đơn thuê
    const [rentalResult] = await db.query(
      `INSERT INTO rentals 
      (user_id, motorbike_id, start_date, end_date, total_price, coupon_id, discount_amount, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, motorbike_id, start_date, end_date, finalTotalPrice, appliedCouponId, discountAmount]
    );

    if (!rentalResult.insertId) {
      throw new Error("Lỗi khi tạo đơn thuê");
    }

    // Cập nhật trạng thái xe sang Rented
    await db.query("UPDATE motorbikes SET status = 'Rented' WHERE id = ?", [motorbike_id]);

    // Commit transaction
    await db.query("COMMIT");

    return { rentalId: rentalResult.insertId };
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Lỗi tạo đơn thuê:", error);
    throw error;
  }
};

// ✅ Cập nhật trạng thái đơn thuê (Nếu hủy đơn -> hoàn lại 1 lượt dùng coupon)
exports.updateRentalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "ongoing", "canceled", "completed"].includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }

  try {
    const [rental] = await db.query(
      `SELECT rentals.*, users.name AS user_name, users.email, motorbikes.model AS motorbike_model
       FROM rentals
       JOIN users ON rentals.user_id = users.id
       JOIN motorbikes ON rentals.motorbike_id = motorbikes.id
       WHERE rentals.id = ?`,
      [id]
    );

    if (rental.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn thuê" });
    }

    const currentRental = rental[0];
    const motorbike_id = currentRental.motorbike_id;

    await db.query("START TRANSACTION");

    // Nếu đơn bị chuyển sang 'canceled' và trước đó có dùng coupon, giảm used_count đi 1
    if (status === "canceled" && currentRental.status !== "canceled" && currentRental.coupon_id) {
      await db.query("UPDATE coupons SET used_count = GREATEST(0, used_count - 1) WHERE id = ?", [currentRental.coupon_id]);
    }

    await db.query("UPDATE rentals SET status = ? WHERE id = ?", [status, id]);

    const newMotorbikeStatus = status === "ongoing" || status === "pending" ? "Rented" : "Available";
    await db.query("UPDATE motorbikes SET status = ? WHERE id = ?", [newMotorbikeStatus, motorbike_id]);

    await db.query("COMMIT");

    // Gửi email thông báo
    if (status === "ongoing" && currentRental.email) {
      await sendRentalAcceptedEmail(
        currentRental.email,
        currentRental.user_name,
        currentRental.motorbike_model,
        currentRental.start_date,
        currentRental.end_date
      );
    }

    if (status === "canceled" && currentRental.email) {
      await sendRentalRejectedEmail(
        currentRental.email,
        currentRental.user_name,
        currentRental.motorbike_model,
        currentRental.start_date,
        currentRental.end_date
      );
    }

    res.json({ message: `Cập nhật trạng thái ${status} thành công` });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Lỗi cập nhật trạng thái:", error);
    res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
  }
};

// ✅ Xóa đơn thuê theo ID (Hoàn trả lại lượt dùng coupon nếu có)
exports.deleteRental = async (req, res) => {
  const { id } = req.params;

  try {
    const [rental] = await db.query("SELECT motorbike_id, coupon_id, status FROM rentals WHERE id = ?", [id]);

    if (rental.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn thuê" });
    }

    const { motorbike_id, coupon_id, status } = rental[0];

    await db.query("START TRANSACTION");

    // Nếu xóa đơn chưa bị canceled trước đó mà có coupon thì trả lại lượt dùng
    if (coupon_id && status !== "canceled") {
      await db.query("UPDATE coupons SET used_count = GREATEST(0, used_count - 1) WHERE id = ?", [coupon_id]);
    }

    await db.query("DELETE FROM rentals WHERE id = ?", [id]);
    await db.query("UPDATE motorbikes SET status = 'Available' WHERE id = ?", [motorbike_id]);

    await db.query("COMMIT");

    res.json({ message: "Xóa đơn thuê thành công!" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Lỗi xóa đơn thuê:", error);
    res.status(500).json({ error: "Lỗi xóa đơn thuê" });
  }
};

// ✅ Auto cập nhật trạng thái đơn thuê
const autoUpdateRentalStatus = async () => {
  try {
    const [expiredRentals] = await db.query(
      "SELECT id, motorbike_id FROM rentals WHERE status = 'ongoing' AND end_date <= NOW()"
    );

    if (expiredRentals.length > 0) {
      await db.query("START TRANSACTION");
      await db.query(
        "UPDATE rentals SET status = 'completed' WHERE status = 'ongoing' AND end_date <= NOW()"
      );
      await db.query(
        "UPDATE motorbikes SET status = 'Available' WHERE id IN (?)",
        [expiredRentals.map((r) => r.motorbike_id)]
      );
      await db.query("COMMIT");

      console.log(`Đã cập nhật ${expiredRentals.length} đơn thuê hết hạn.`);
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Lỗi cập nhật trạng thái tự động:", error);
  }
};

cron.schedule("* * * * *", autoUpdateRentalStatus, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});