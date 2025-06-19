const db = require("../config/db");
const { sendRentalAcceptedEmail, sendRentalRejectedEmail } = require("../utils/mailer"); // Thêm dòng này


// ✅ Lấy tất cả thanh toán
exports.getAllPayments = async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.id, 
        r.id AS rental_id,         
        p.amount, 
        p.payment_method, 
        p.content,               
        p.status, 
        p.paid_at,
        p.type,                          -- 👉 THÊM TRƯỜNG NÀY
        u.name AS username,
        m.model AS motorbike_name
      FROM payments p
      JOIN rentals r ON p.rental_id = r.id
      JOIN users u ON r.user_id = u.id
      JOIN motorbikes m ON r.motorbike_id = m.id
      ORDER BY p.paid_at DESC
    `;
    const [results] = await db.query(sql);

    if (results.length === 0) {
      return res.status(404).json({ message: "Chưa có thanh toán nào!" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Lỗi khi lấy tất cả thanh toán:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Tạo thanh toán mới (có xử lý status: pending => paid_at: null)
exports.createPayment = async (req, res) => {
  try {
    const { rental_id, amount, payment_method, content, status, type } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!rental_id || !amount || !payment_method || !content || !status || !type) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }

    // Kiểm tra type hợp lệ
    if (!['rental', 'surcharge'].includes(type)) {
      return res.status(400).json({ message: "Loại thanh toán không hợp lệ!" });
    }

    const sql = `
      INSERT INTO payments (rental_id, amount, payment_method, content, status, type, paid_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const paidAt = status === 'completed' ? new Date() : null;

    const [result] = await db.query(sql, [
      rental_id,
      amount,
      payment_method,
      content,
      status,
      type,
      paidAt
    ]);

    res.json({
      message: "Thanh toán đã được tạo!",
      payment_id: result.insertId,
      payment: {
        id: result.insertId,
        rental_id,
        amount,
        payment_method,
        content,
        status,
        type,
        paid_at: paidAt
      }
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo thanh toán:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Lấy thanh toán theo rental_id
exports.getPaymentsByRental = async (req, res) => {
  try {
    const { rental_id } = req.params;

    if (!rental_id) {
      return res.status(400).json({ message: "Thiếu rental_id!" });
    }

    const sql = `
      SELECT id, rental_id, amount, payment_method, content, status, paid_at 
      FROM payments 
      WHERE rental_id = ?
      ORDER BY paid_at DESC
    `;
    const [results] = await db.query(sql, [rental_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán!" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Lỗi khi lấy thanh toán theo rental_id:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
// ✅ Cập nhật trạng thái thanh toán và liên quan đến đơn thuê + xe
exports.updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["completed", "failed"].includes(status)) {
    return res.status(400).json({ error: "Trạng thái thanh toán không hợp lệ" });
  }

  try {
    // Lấy thông tin thanh toán và đơn thuê liên quan
    const [paymentRows] = await db.query(
      `SELECT p.rental_id, r.user_id, r.motorbike_id, r.start_date, r.end_date,
              u.name AS user_name, u.email,
              m.model AS motorbike_model
       FROM payments p
       JOIN rentals r ON p.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       JOIN motorbikes m ON r.motorbike_id = m.id
       WHERE p.id = ?`,
      [id]
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thanh toán" });
    }

    const payment = paymentRows[0];

    await db.query("START TRANSACTION");

    if (status === "completed") {
      // ✅ Cập nhật trạng thái + thời gian thanh toán
      await db.query("UPDATE payments SET status = ?, paid_at = NOW() WHERE id = ?", [status, id]);

      // ✅ Cập nhật đơn thuê và trạng thái xe
      await db.query("UPDATE rentals SET status = 'ongoing' WHERE id = ?", [payment.rental_id]);
      await db.query("UPDATE motorbikes SET status = 'Rented' WHERE id = ?", [payment.motorbike_id]);

      // ✅ Gửi email xác nhận
      if (payment.email) {
        await sendRentalAcceptedEmail(
          payment.email,
          payment.user_name,
          payment.motorbike_model,
          payment.start_date,
          payment.end_date
        );
      }

    } else if (status === "failed") {
      // ✅ Cập nhật trạng thái + xóa thời gian thanh toán
      await db.query("UPDATE payments SET status = ?, paid_at = NULL WHERE id = ?", [status, id]);

      // ✅ Cập nhật trạng thái đơn thuê là canceled
      await db.query("UPDATE rentals SET status = 'canceled' WHERE id = ?", [payment.rental_id]);

      // ✅ Gửi email từ chối
      if (payment.email) {
        await sendRentalRejectedEmail(
          payment.email,
          payment.user_name,
          payment.motorbike_model,
          payment.start_date,
          payment.end_date
        );
      }
    }

    await db.query("COMMIT");

    res.json({ message: "Cập nhật trạng thái thanh toán thành công!" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("❌ Lỗi cập nhật trạng thái thanh toán:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật trạng thái thanh toán" });
  }
};
