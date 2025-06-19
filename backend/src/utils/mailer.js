const nodemailer = require("nodemailer");

// Hàm format ngày giờ theo kiểu Việt Nam
const formatDateTime = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tạo transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Gửi email khi đơn thuê được chấp nhận
const sendRentalAcceptedEmail = async (to, name, motorbike, startDate, endDate) => {
  const formattedStartDate = formatDateTime(startDate);
  const formattedEndDate = formatDateTime(endDate);

  const mailOptions = {
    from: `"Motorbike Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Đơn thuê đã được chấp nhận",
    html: `
      <p>Chào ${name},</p>
      <p>Đơn thuê xe <strong>${motorbike}</strong> của bạn từ ngày <strong>${formattedStartDate}</strong> đến <strong>${formattedEndDate}</strong> đã được <span style="color: green;"><strong>chấp nhận</strong></span>.</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Gửi email khi đơn thuê bị từ chối
const sendRentalRejectedEmail = async (to, name, motorbike, startDate, endDate) => {
  const formattedStartDate = formatDateTime(startDate);
  const formattedEndDate = formatDateTime(endDate);

  const mailOptions = {
    from: `"Motorbike Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Đơn thuê đã bị từ chối",
    html: `
      <p>Chào ${name},</p>
      <p>Rất tiếc, đơn thuê xe <strong>${motorbike}</strong> của bạn từ ngày <strong>${formattedStartDate}</strong> đến <strong>${formattedEndDate}</strong> đã bị <span style="color: red;"><strong>từ chối</strong></span>.</p>
      <p>Xin lỗi về sự bất tiện này. Nếu bạn có câu hỏi, vui lòng liên hệ với chúng tôi.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Hàm tạo mã xác nhận từ 4 đến 6 chữ số
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // mã 6 chữ số
};

// Gửi email xác nhận quên mật khẩu
const sendPasswordResetCode = async (to, username, code) => {
  const mailOptions = {
    from: `"Motorbike Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Xác nhận đặt lại mật khẩu",
    html: `
      <p>Chào ${username},</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Mã xác nhận của bạn là:</p>
      <h2 style="color: blue;">${code}</h2>
      <p>Vui lòng nhập mã này vào biểu mẫu trên trang đặt lại mật khẩu để tiếp tục.</p>
      <p>Nếu bạn không yêu cầu điều này, bạn có thể bỏ qua email này.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};


// Gửi email khi tạo phụ thu
const sendSurchargeNotificationEmail = async (to, name, rentalId, type, description, amount, createdAt) => {
  const formattedDate = formatDateTime(createdAt);

  const mailOptions = {
    from: `"Motorbike Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Thông báo phụ thu từ đơn thuê xe",
    html: `
      <p>Chào ${name},</p>
      <p>Chúng tôi thông báo rằng đơn thuê xe <strong>#${rentalId}</strong> của bạn đã phát sinh một khoản phụ thu như sau:</p>
      <ul>
        <li><strong>Loại phụ thu:</strong> ${type}</li>
        <li><strong>Mô tả:</strong> ${description}</li>
        <li><strong>Số tiền:</strong> ${Number(amount).toLocaleString()} VND</li>
        <li><strong>Thời gian tạo:</strong> ${formattedDate}</li>
      </ul>
      <p>Vui lòng thanh toán phụ thu trong thời gian sớm nhất để tránh ảnh hưởng đến việc sử dụng dịch vụ.</p>
      <p>Xin cảm ơn!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendRentalAcceptedEmail,
  sendRentalRejectedEmail,
  sendPasswordResetCode,
  generateVerificationCode,
  sendSurchargeNotificationEmail,
};
