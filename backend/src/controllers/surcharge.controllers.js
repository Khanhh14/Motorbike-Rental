const db = require("../config/db");
const { sendSurchargeNotificationEmail } = require("../utils/mailer");

// Tạo phụ thu
exports.createSurcharge = async (req, res) => {
  try {
    const { rental_id, type, description, amount, status } = req.body;

    if (!rental_id || !type || !description || !amount || !status) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
    }

    // Lấy thông tin đơn thuê
    const [rentalRows] = await db.execute('SELECT * FROM rentals WHERE id = ?', [rental_id]);
    if (rentalRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn thuê' });
    }
    const rental = rentalRows[0];

    // Chỉ cho phép tạo phụ thu nếu đơn đã hoàn thành
    if (rental.status !== 'completed') {
      return res.status(400).json({ message: 'Chỉ được tạo phụ thu cho đơn thuê đã hoàn thành' });
    }

    // Thêm phụ thu vào cơ sở dữ liệu
    const [result] = await db.execute(
      'INSERT INTO surcharges (rental_id, type, description, amount, status) VALUES (?, ?, ?, ?, ?)',
      [rental_id, type, description, amount, status]
    );

    const surchargeId = result.insertId;

    // Lấy thông tin phụ thu vừa tạo (bao gồm created_at)
    const [surchargeRows] = await db.execute('SELECT * FROM surcharges WHERE id = ?', [surchargeId]);
    const surcharge = surchargeRows[0];

    // Lấy thông tin người dùng để gửi email
    const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [rental.user_id]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const user = userRows[0];

    // Gửi email thông báo phụ thu
    await sendSurchargeNotificationEmail(
      user.email,
      user.fullname || user.username || 'bạn',
      rental_id,
      type,
      description,
      amount,
      surcharge.created_at
    );

    res.status(201).json({ message: 'Thêm phụ thu thành công', surcharge_id: surchargeId });
  } catch (error) {
    console.error('Lỗi tạo phụ thu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Hiển thị tất cả phụ thu hoặc theo rental_id
exports.getSurcharges = async (req, res) => {
  try {
    const { rental_id } = req.query;

    let query = 'SELECT * FROM surcharges';
    let params = [];

    if (rental_id) {
      query += ' WHERE rental_id = ?';
      params.push(rental_id);
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách phụ thu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy phụ thu của user đang đăng nhập
exports.getUserSurcharges = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc token không hợp lệ' });
    }

    const userId = req.user.id;
    const { rental_id } = req.query;

    let query = `
      SELECT s.* FROM surcharges s
      JOIN rentals r ON s.rental_id = r.id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (rental_id) {
      query += ' AND s.rental_id = ?';
      params.push(rental_id);
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy phụ thu của user:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật trạng thái phụ thu
exports.updateSurchargeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Thiếu trạng thái mới' });
    }

    // Kiểm tra xem phụ thu có tồn tại không
    const [check] = await db.execute('SELECT * FROM surcharges WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phụ thu' });
    }

    // Cập nhật trạng thái
    await db.execute('UPDATE surcharges SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái phụ thu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
