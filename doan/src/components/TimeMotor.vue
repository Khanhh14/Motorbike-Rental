<template>
  <div class="rental-policy">
    <!-- Header -->
    <div class="header">
      <div style ="text-align: center; margin-top: 50px;"></div>
      <h1>GIÁ THUÊ XE</h1>
      <div class="underline"></div>
    </div>

    <div class="container">
      <!-- Main content -->
      <div class="content">
        <!-- Bảng giá xe -->
        <div class="pricing-section">
          <div class="pricing-card">
            <div class="icon">⏱️</div>
            <h3>Xe Số</h3>
            <div class="price">80.000 VND</div>
            <div class="unit">/Ngày</div>
            <ul>
              <li>❤️ Tiết kiệm nhiên liệu</li>
              <li>❤️ Dễ dàng vận hành</li>
            </ul>
            <button class="order-btn" @click="goToMotorList('xe số')">Đặt xe ngay</button>
          </div>

          <div class="pricing-card">
            <div class="icon">🛵</div>
            <h3>Xe Tay Ga</h3>
            <div class="price">120.000 VND</div>
            <div class="unit">/Ngày</div>
            <ul>
              <li>❤️ Tự động hoàn toàn</li>
              <li>❤️ Thoải mái di chuyển</li>
            </ul>
            <button class="order-btn" @click="goToMotorList('tay ga')">Đặt xe ngay</button>
          </div>

          <div class="pricing-card">
            <div class="icon">🏍️</div>
            <h3>Xe Tay Côn</h3>
            <div class="price">100.000 VND</div>
            <div class="unit">/Ngày</div>
            <ul>
              <li>❤️ Trải nghiệm thể thao</li>
              <li>❤️ Mạnh mẽ & năng động</li>
            </ul>
            <button class="order-btn" @click="goToMotorList('tay côn')">Đặt xe ngay</button>
          </div>
        </div>

        <!-- Thông báo -->
        <div class="box notice">
          <p>💡 Giá thuê xe sẽ được tính kết hợp theo ngày và theo giờ</p>
        </div>

        <!-- 1 ngày thuê -->
        <div class="box">
          <h3>📅 01 ngày thuê</h3>
          <p>Sẽ là 24 tiếng, tính từ giờ, thời điểm bạn nhận xe ngày hôm nay đến đúng giờ đó ngày hôm sau.</p>
        </div>

        <!-- Giờ thuê -->
        <div class="box">
          <h3>🕒 Giờ thuê xe</h3>
          <p>Chỉ được áp dụng khi bạn thuê xe &gt; 1 ngày. Giá theo giờ phát sinh sẽ tùy thuộc vào loại xe bạn thuê:</p>
          <table>
            <thead>
              <tr>
                <th>Loại xe</th>
                <th>Giá theo giờ phát sinh</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>⏱️ Xe số</td>
                <td class="highlight">15k/tiếng phát sinh</td>
              </tr>
              <tr>
                <td>🛵 Xe tay ga</td>
                <td class="highlight">20k/tiếng phát sinh</td>
              </tr>
              <tr>
                <td>🏍️ Xe côn tay</td>
                <td class="highlight">25k/tiếng phát sinh</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Lưu ý -->
        <div class="box warning">
          ⚠️ <strong>Lưu ý:</strong> Nếu số tiền tổng đơn thuê của bạn < 50.000VNĐ Traverlizer sẽ tính tròn là 50.000VNĐ cho đơn thuê xe.
        </div>

        <!-- Ví dụ -->
        <div class="box example">
          <p><strong>📌 Ví dụ: Bạn thuê một xe số Sirius</strong></p>
          <ul>
            <li>Nhận xe: 9h sáng, 21/03/2022</li>
            <li>Trả xe lúc: 3h chiều, 22/03/2022</li>
          </ul>
          <p>
            🧮 Hệ thống của chúng tôi sẽ tính toán như sau: Tổng thời gian bạn thuê xe sẽ là <strong>1 ngày và 6 tiếng</strong>, bạn sẽ thanh toán cho tổng thời gian thuê xe đó bao gồm
            <strong>giá thuê xe 1 ngày là 130k</strong> và <strong>giá thuê xe 06 tiếng phát sinh là 90k</strong>. <br />
            👉 Tổng số tiền thuê xe của bạn sẽ là <strong>220k</strong>.
          </p>
        </div>

        <!-- Hỗ trợ -->
        <div class="box support">
          📞 Cần hỗ trợ thêm? Liên hệ với chúng tôi qua hotline: <strong>(03) 6335 2990</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Policy",
  methods: {
    goToMotorList(typeName) {
      this.$router.push({ name: "motorbikes", query: { type: typeName } });
    },
  },
};
</script>

  
  <style scoped>
  .pricing-section {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding: 40px 20px 20px;
    background-color: #ffffff;
  }
  
  .pricing-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 260px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .pricing-card:hover {
    transform: translateY(-5px);
    border-color: #ff4d4f;
  }
  
  .pricing-card .icon {
    font-size: 36px;
    margin-bottom: 10px;
  }
  
  .pricing-card h3 {
    margin: 0;
    font-size: 20px;
  }
  
  .pricing-card .price {
    color: #ff4d4f;
    font-size: 24px;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .pricing-card .unit {
    color: #777;
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  .pricing-card ul {
    list-style: none;
    padding: 0;
    margin: 0 0 20px;
  }
  
  .pricing-card ul li {
    margin: 8px 0;
    font-size: 14px;
  }
  
  .order-btn {
    background-color: #ff4d4f;
    color: white;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.3s;
  }
  
  .order-btn:hover {
    background-color: #e63b3d;
  }
  
  .rental-policy {
    font-family: Arial, sans-serif;
    background: #fff;
    color: #333;
  }
  
  .header {
    background-color: #0c2c5d;
    color: white;
    text-align: center;
    padding: 40px 20px 30px;
    position: relative;
  }
  
  .header h1 {
    font-size: 32px;
    margin-bottom: 10px;
  }
  
  .header .underline {
    width: 40px;
    height: 4px;
    background-color: orange;
    margin: 0 auto;
    border-radius: 2px;
  }
  
  .container {
    display: flex;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 900px;
  }
  
  .box {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e0e0e0;
  }
  
  .box h3 {
    margin-bottom: 10px;
    font-size: 18px;
  }
  
  .box p {
    margin: 0;
  }
  
  .box table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  .box table th,
  .box table td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  
  .highlight {
    color: #1a73e8;
    font-weight: bold;
  }
  
  .notice {
    background-color: #eaf4ff;
    border-left: 4px solid #2196f3;
  }
  
  .warning {
    background-color: #fffbe6;
    border-left: 4px solid #ffcc00;
    color: #665c00;
  }
  
  .example {
    background-color: #e6f2ff;
    border-left: 4px solid #3399ff;
  }
  
  .example ul {
    margin: 10px 0 0 20px;
  }
  
  .support {
    background-color: #f0f0f0;
    font-size: 14px;
  }
  </style>
  