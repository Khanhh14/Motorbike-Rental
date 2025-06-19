const validateRentalData = (req, res, next) => {
  const { motorbike_id, start_date, end_date, name, phone, email } = req.body;

  // Lấy user_id từ token đã giải mã (req.user được middleware auth gán)
  const user_id = req.user?.id;

  if (user_id) {
    // Người dùng đã đăng nhập, chỉ cần kiểm tra motorbike_id, start_date và end_date
    req.user_id = Number(user_id); // Gán user_id vào req.user_id
    if (!motorbike_id || !start_date || !end_date) {
      return res.status(400).json({ error: "Thiếu dữ liệu đầu vào!" });
    }
  } else {
    // Người dùng chưa đăng nhập, yêu cầu nhập đầy đủ thông tin cá nhân
    if (!motorbike_id || !start_date || !end_date || !name || !phone || !email) {
      return res.status(400).json({ error: "Cần nhập đầy đủ thông tin cá nhân để thuê xe!" });
    }
    req.user_id = null; // Đánh dấu là user guest, sẽ tạo sau trong controller
  }

  // Kiểm tra ngày tháng
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({ error: "Ngày bắt đầu hoặc ngày kết thúc không hợp lệ!" });
  }

  if (startDate >= endDate) {
    return res.status(400).json({ error: "Ngày kết thúc phải lớn hơn ngày bắt đầu!" });
  }

  next();
};

module.exports = validateRentalData;
