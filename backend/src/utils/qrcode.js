const QRCode = require('qrcode');

/**
 * Tạo QR code base64 cho ngân hàng, momo hoặc zalo
 * @param {Object} options
 * @param {'credit_cash'|'momo'|'zalopay'} options.type Loại QR
 * @param {string} [options.soTaiKhoan] Số tài khoản ngân hàng
 * @param {string} [options.tenTaiKhoan] Tên tài khoản
 * @param {number} [options.soTien] Số tiền
 * @param {string} [options.noiDung] Nội dung chuyển khoản
 * @param {string} [options.soDienThoai] Số điện thoại momo / zalo
 * @returns {Promise<string>} Dữ liệu QR code dạng base64
 */
async function taoQRThanhToan({ type, soTaiKhoan, tenTaiKhoan, soTien, noiDung, soDienThoai }) {
  try {
    let payload = '';

    switch (type) {
      case 'credit_cash': {
        if (!soTaiKhoan || !tenTaiKhoan || !soTien || !noiDung) {
          throw new Error('Thiếu thông tin ngân hàng');
        }

        const bankId = 'vcb'; // mã ngân hàng viết thường
        const encodedNoiDung = encodeURIComponent(noiDung);
        const encodedTen = encodeURIComponent(tenTaiKhoan);

        // Dùng ảnh QR trực tiếp từ vietqr.io
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${soTaiKhoan}-compact2.png?amount=${soTien}&addInfo=${encodedNoiDung}&accountName=${encodedTen}`;
        return qrUrl; // không dùng QRCode.toDataURL nữa
      }

      case 'momo': {
        if (!soDienThoai || !soTien || !noiDung) {
          throw new Error('Thiếu thông tin Momo');
        }

        payload = `2|99|${soDienThoai}|||0|0|${soTien}|${noiDung}`;
        break;
      }

      case 'zalopay': {
        if (!soDienThoai) {
          throw new Error('Thiếu số điện thoại ZaloPay');
        }

        payload = `https://zalopay.vn/payapp?phone=${soDienThoai}`;
        break;
      }

      default:
        throw new Error('Loại QR không hợp lệ');
    }

    // Với Momo và ZaloPay: tạo ảnh QR
    const qrBase64 = await QRCode.toDataURL(payload);
    return qrBase64;
  } catch (error) {
    console.error('Lỗi tạo mã QR:', error);
    throw error; // trả lỗi gốc thay vì lỗi mới
  }
}

module.exports = {
  taoQRThanhToan
};
