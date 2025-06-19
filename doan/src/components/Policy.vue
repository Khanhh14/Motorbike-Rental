<template>
  <div class="page-layout">
    <!-- Không còn Sidebar -->

    <!-- Nội dung chính toàn màn hình -->
    <div class="container">
      <section class="intro">
            <div style ="text-align: center; margin-top: 50px;">
        <h1>Quy Trình Thuê Xe Máy Đơn Giản</h1>
        <p>Chỉ với 3 bước đơn giản để bắt đầu hành trình của bạn</p>
            </div>
      </section>

      <section class="steps">
        <div class="step">
          <h2>1. Đăng ký thuê xe máy</h2>
          <ul>
            <li>Chọn gói thuê xe theo nhu cầu</li>
            <li>Nhập thông tin cá nhân</li>
            <li>Chọn thời gian thuê xe</li>
          </ul>
        </div>

        <div class="step">
          <h2>2. Xác nhận thuê xe</h2>
          <ul>
            <li>Kiểm tra email xác nhận</li>
          </ul>
        </div>

        <div class="step">
          <h2>3. Nhận xe tại điểm hẹn</h2>
          <ul>
            <li>Kiểm tra tình trạng xe</li>
            <li>Nhận chìa khóa và mũ bảo hiểm</li>
            <li>Bắt đầu hành trình</li>
          </ul>
        </div>
      </section>

      <section class="benefits">
        <h2>Ưu điểm dịch vụ</h2>
        <div class="benefit-list">
          <div class="benefit">
            <font-awesome-icon :icon="['far', 'credit-card']" style="font-size: 24px; color: #1e90ff;" />
            <h3>Thanh toán linh hoạt</h3>
            <p>Nhiều phương thức thanh toán</p>
          </div>
          <div class="benefit">
            <font-awesome-icon :icon="['fas', 'headset']" style="font-size: 24px; color: #1e90ff;" />
            <h3>Hỗ trợ 24/7</h3>
            <p>Luôn sẵn sàng hỗ trợ bạn</p>
          </div>
          <div class="benefit">
            <font-awesome-icon :icon="['fas', 'shield-halved']" style="font-size: 24px; color: #1e90ff;" />
            <h3>Bảo hiểm toàn diện</h3>
            <p>An tâm trong mọi hành trình</p>
          </div>
          <div class="benefit">
            <font-awesome-icon :icon="['fas', 'motorcycle']" style="font-size: 24px; color: #1e90ff;" />
            <h3>Xe chất lượng cao</h3>
            <p>Xe được bảo dưỡng định kỳ</p>
          </div>
        </div>
      </section>

      <section class="cta">
        <h2>Bắt đầu thuê xe ngay hôm nay</h2>
        <p>Trải nghiệm dịch vụ thuê xe máy chất lượng cao</p>
        <button class="primary" @click="chuyenTrangXeMay">Tìm Xe Ngay</button>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProcedurePage",
  methods: {
    chuyenTrangXeMay() {
      this.$router.push("/motorbikes"); // Thay đường dẫn bằng route thật của bạn
    }
  }
};
</script>

<style scoped>
.page-layout {
  display: flex;
  justify-content: center;
}

.container {
  max-width: 1200px;
  width: 100%;
  padding: 40px 20px;
  background: #f9fbff;
  color: #333;
  font-family: 'Arial', sans-serif;
}

.intro {
  text-align: center;
  margin-bottom: 40px;
}

.intro h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
  margin-bottom: 50px;
}

.step {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-width: 250px;
  max-width: 300px;
}

.step h2 {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: bold;
}

.step ul {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.step ul li {
  margin: 8px 0;
  position: relative;
  padding-left: 20px;
}

.step ul li::before {
  content: '✔';
  position: absolute;
  left: 0;
  color: #1e90ff;
  font-size: 14px;
}

button.primary {
  background-color: #1e90ff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
}

button.secondary {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.benefits {
  text-align: center;
  margin-bottom: 50px;
}

.benefit-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.benefit {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 220px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.benefit h3 {
  font-weight: bold;
}

.cta {
  background: #1e90ff;
  color: white;
  text-align: center;
  padding: 40px 20px;
  border-radius: 10px;
}

.cta h2 {
  font-size: 22px;
  margin-bottom: 10px;
}

.cta p {
  margin-bottom: 20px;
}

.cta button {
  background-color: white;
  color: #1e90ff;
  font-weight: bold;
}
</style>
