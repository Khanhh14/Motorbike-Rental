const db = require("../config/db");
const cron = require("node-cron");
const { sendRentalAcceptedEmail, sendRentalRejectedEmail } = require("../utils/mailer");

const imageBaseUrl = "http://localhost:5000"; // Hoặc có thể sử dụng URL từ biến môi trường

exports.getRentals = async (req, res) => {
  try {
    const query = `
      SELECT 
        rentals.id, 
        users.name AS renter_name,
        motorbikes.model AS motorbike_model,
        rentals.start_date,
        rentals.end_date,
        rentals.total_price,
        rentals.status
      FROM rentals
      JOIN users ON rentals.user_id = users.id
      JOIN motorbikes ON rentals.motorbike_id = motorbikes.id
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn thuê:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách đơn thuê" });
  }
};


// 📌 Hàm dùng cho route truyền userId từ cookie/middleware
exports.getUserRentalsById = async (userId) => {
  const query = `
      SELECT rentals.id, users.name AS renter_name, motorbikes.model AS motorbike_model,
             motorbikes.id AS motorbike_id,  -- ✅ thêm dòng này
             rentals.start_date, rentals.end_date, rentals.total_price, rentals.status
      FROM rentals
      JOIN motorbikes ON rentals.motorbike_id = motorbikes.id
      JOIN users ON rentals.user_id = users.id
      WHERE rentals.user_id = ?
      ORDER BY rentals.start_date DESC
    `;
  const [rows] = await db.query(query, [userId]);
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
        r.status 
      FROM rentals r
      JOIN motorbikes m ON r.motorbike_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.start_date DESC
    `;

    const [results] = await db.query(sql, [user_id]);

    // ✅ Trả về cả danh sách và tổng số
    results.forEach(result => {
      // Cập nhật lại URL hình ảnh với đường dẫn đầy đủ
      result.motorbike_image = `${imageBaseUrl}/uploads/${result.motorbike_image}`;
    });

    res.status(200).json({
      total: results.length,  // Tổng số xe đã thuê
      rentals: results        // Danh sách đơn thuê
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy đơn thuê của người dùng:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};



// ✅ Lấy chi tiết đơn thuê theo ID
exports.getRentalById = async (req, res) => {
  const user_id = req.user.id; // Lấy user_id từ token/session
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT rentals.*, motorbikes.model AS motorbike_model
       FROM rentals
       JOIN motorbikes ON rentals.motorbike_id = motorbikes.id
       WHERE rentals.id = ? AND rentals.user_id = ?`,
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn thuê" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn thuê:", error);
    res.status(500).json({ error: "Lỗi lấy chi tiết đơn thuê" });
  }
};


// ✅ Tạo đơn thuê mới
// ✅ Tạo đơn thuê mới
exports.createRental = async ({ body }) => {
  try {
    let { user_id, motorbike_id, start_date, end_date, total_price, name, phone, email } = body;

    // Nếu user_id chưa có (khách vãng lai), yêu cầu thông tin cá nhân
    if (!user_id) {
      if (!name || !phone || !email) {
        throw new Error("Cần nhập đầy đủ thông tin cá nhân để thuê xe");
      }

      // Tạo tài khoản guest
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

    // Tính tổng giá nếu chưa được gửi từ frontend
    if (!total_price) {
      const price_per_day = motorbike[0].price_per_day;
      const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
      total_price = days > 0 ? days * price_per_day : 0;
    }

    // Bắt đầu transaction
    await db.query("START TRANSACTION");

    // Tạo đơn thuê
    const [rentalResult] = await db.query(
      "INSERT INTO rentals (user_id, motorbike_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      [user_id, motorbike_id, start_date, end_date, total_price]
    );

    if (!rentalResult.insertId) {
      throw new Error("Lỗi khi tạo đơn thuê");
    }

    // ✅ Cập nhật trạng thái xe sang Rented ngay khi đơn ở trạng thái pending
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



// ✅ Cập nhật trạng thái đơn thuê
exports.updateRentalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending","ongoing", "canceled", "completed"].includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }

  try {
    // Lấy thông tin đơn thuê và người thuê
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

    const motorbike_id = rental[0].motorbike_id;

    await db.query("START TRANSACTION");
    await db.query("UPDATE rentals SET status = ? WHERE id = ?", [status, id]);

    const newMotorbikeStatus = status === "ongoing" || status === "pending" ? "Rented" : "Available";
    await db.query("UPDATE motorbikes SET status = ? WHERE id = ?", [newMotorbikeStatus, motorbike_id]);
    await db.query("COMMIT");

    // ✅ Gửi email nếu trạng thái là "ongoing"
    if (status === "ongoing" && rental[0].email) {
      await sendRentalAcceptedEmail(
        rental[0].email,
        rental[0].user_name,
        rental[0].motorbike_model,
        rental[0].start_date,
        rental[0].end_date
      );
    }

    // ✅ Gửi email nếu trạng thái là "canceled"
    if (status === "canceled" && rental[0].email) {
      await sendRentalRejectedEmail(
        rental[0].email,
        rental[0].user_name,
        rental[0].motorbike_model,
        rental[0].start_date,
        rental[0].end_date
      );
    }

    res.json({ message: `Cập nhật trạng thái ${status} thành công` });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Lỗi cập nhật trạng thái:", error);
    res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
  }
};


// ✅ Xóa đơn thuê theo ID
exports.deleteRental = async (req, res) => {
  const { id } = req.params;

  try {
    const [rental] = await db.query("SELECT motorbike_id FROM rentals WHERE id = ?", [id]);

    if (rental.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn thuê" });
    }

    const motorbike_id = rental[0].motorbike_id;

    await db.query("START TRANSACTION");
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
    const now = new Date(); // Lấy thời gian hiện tại

    // Lấy danh sách đơn thuê đã hết hạn (theo giờ)
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


// Giữ nguyên cron job
cron.schedule("* * * * *", autoUpdateRentalStatus, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

