const { taoQRThanhToan } = require('../utils/qrcode');

const qrController = {
  async taoQR(req, res) {
    try {
      const { type, soTaiKhoan, tenTaiKhoan, soTien, noiDung, soDienThoai } = req.body;

      if (!type || !soTien || !noiDung) {
        throw new Error('Thiếu thông tin cần thiết để tạo mã QR.');
      }

      let qrBase64;

      switch (type) {
        case 'credit_cash':
          if (!soTaiKhoan || !tenTaiKhoan) {
            throw new Error('Thiếu thông tin tài khoản ngân hàng.');
          }
          qrBase64 = await taoQRThanhToan({
            type,
            soTaiKhoan,
            tenTaiKhoan,
            soTien,
            noiDung
          });
          break;
        case 'momo':
        case 'zalopay':
          if (!soDienThoai) {
            throw new Error('Thiếu số điện thoại ví điện tử.');
          }
          qrBase64 = await taoQRThanhToan({
            type,
            soDienThoai,
            soTien,
            noiDung
          });
          break;
        default:
          throw new Error('Phương thức thanh toán không hợp lệ.');
      }

      return res.json({
        success: true,
        qr: qrBase64
      });
    } catch (error) {
      console.error('Lỗi tạo QR:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo mã QR.'
      });
    }
  }
};

module.exports = qrController;