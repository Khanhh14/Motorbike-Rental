const db = require("../config/db");

// 📌 API dành cho Khách hàng: Kiểm tra & áp dụng mã giảm giá
exports.applyCoupon = async (req, res) => {
  const { code, order_amount } = req.body;

  if (!code || !order_amount) {
    return res.status(400).json({ message: "Vui lòng cung cấp mã giảm giá và giá trị đơn hàng" });
  }

  try {
    const [coupons] = await db.query(
      `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE`,
      [code]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã bị khóa" });
    }

    const coupon = coupons[0];
    const now = new Date();

    // 1. Kiểm tra thời gian hiệu lực
    if (new Date(coupon.start_date) > now || new Date(coupon.end_date) < now) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn hoặc chưa đến đợt áp dụng" });
    }

    // 2. Kiểm tra số lượt sử dụng
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    // 3. Kiểm tra giá trị đơn hàng tối thiểu
    if (order_amount < parseFloat(coupon.min_order_value)) {
      return res.status(400).json({
        message: `Đơn hàng phải tối thiểu ${Number(coupon.min_order_value).toLocaleString()} VNĐ để sử dụng mã này`
      });
    }

    // 4. Tính toán số tiền giảm
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (order_amount * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
        discountAmount = parseFloat(coupon.max_discount_amount);
      }
    } else if (coupon.discount_type === "fixed") {
      discountAmount = parseFloat(coupon.discount_value);
    }

    // Đảm bảo số tiền giảm không vượt quá giá trị đơn hàng
    if (discountAmount > order_amount) {
      discountAmount = order_amount;
    }

    const finalAmount = order_amount - discountAmount;

    return res.json({
      message: "Áp dụng mã giảm giá thành công",
      coupon_id: coupon.id,
      code: coupon.code,
      discount_amount: discountAmount,
      final_amount: finalAmount
    });

  } catch (error) {
    console.error("Lỗi khi kiểm tra mã giảm giá:", error);
    return res.status(500).json({ message: "Lỗi server khi kiểm tra mã giảm giá" });
  }
};

// 📌 API CRUD dành cho Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách coupon:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách mã giảm giá" });
  }
};

exports.createCoupon = async (req, res) => {
  const {
    code,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_value,
    usage_limit,
    start_date,
    end_date
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO coupons 
      (code, discount_type, discount_value, max_discount_amount, min_order_value, usage_limit, start_date, end_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        discount_type || 'percentage',
        discount_value,
        max_discount_amount || null,
        min_order_value || 0,
        usage_limit || null,
        start_date,
        end_date
      ]
    );

    res.status(201).json({ message: "Tạo mã giảm giá thành công", id: result.insertId });
  } catch (error) {
    console.error("Lỗi tạo mã giảm giá:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Mã giảm giá này đã tồn tại" });
    }
    res.status(500).json({ error: "Lỗi khi tạo mã giảm giá" });
  }
};

exports.updateCoupon = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_value,
    usage_limit,
    start_date,
    end_date,
    is_active
  } = req.body;

  try {
    await db.query(
      `UPDATE coupons SET 
        code = ?, discount_type = ?, discount_value = ?, 
        max_discount_amount = ?, min_order_value = ?, usage_limit = ?, 
        start_date = ?, end_date = ?, is_active = ?
      WHERE id = ?`,
      [
        code,
        discount_type,
        discount_value,
        max_discount_amount,
        min_order_value,
        usage_limit,
        start_date,
        end_date,
        is_active,
        id
      ]
    );

    res.json({ message: "Cập nhật mã giảm giá thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật coupon:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật mã giảm giá" });
  }
};

exports.deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM coupons WHERE id = ?", [id]);
    res.json({ message: "Xóa mã giảm giá thành công" });
  } catch (error) {
    console.error("Lỗi xóa coupon:", error);
    res.status(500).json({ error: "Lỗi khi xóa mã giảm giá" });
  }
};