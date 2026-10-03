<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Cột 1: Logo và thông tin liên hệ -->
      <div class="footer-section">
        <div class="footer-logo">
          <img src="@/assets/image/logo.png" alt="Travel Logo" class="logo-img" />
          <h2>Travalizer Phú Yên</h2>
        </div>
        <p class="contact-line">
          <font-awesome-icon :icon="['fas', 'location-dot']" class="contact-icon icon-address" />
          <span>Tuy Hòa - Phú Yên</span>
        </p>
        <p class="contact-line">
          <font-awesome-icon :icon="['fas', 'phone']" class="contact-icon icon-phone" />
          <span>(03) 6335 2990 - (03) 5690 7889</span>
        </p>
        <p class="contact-line">
          <font-awesome-icon :icon="['fas', 'envelope']" class="contact-icon icon-email" />
          <span>busu6226@gmail.com</span>
        </p>
      </div>

      <!-- Cột 2: Về chúng tôi -->
      <div class="footer-section">
        <h3>VỀ CHÚNG TÔI</h3>
        <ul>
          <li><a href="#">Trang chủ</a></li>
          <li><a href="#">Giới thiệu</a></li>
          <li><a href="#">Sản phẩm</a></li>
          <li><a href="#">Tin tức</a></li>
          <li><a href="#">Liên hệ</a></li>
        </ul>
      </div>

      <!-- Cột 3: Điều khoản -->
      <div class="footer-section">
        <h3>ĐIỀU KHOẢN</h3>
        <ul>
          <li><a href="#">Trang chủ</a></li>
          <li><a href="#">Giới thiệu</a></li>
          <li><a href="#">Sản phẩm</a></li>
          <li><a href="#">Tin tức</a></li>
          <li><a href="#">Liên hệ</a></li>
        </ul>
      </div>

      <!-- Cột 4: Chính sách -->
      <div class="footer-section">
        <h3>CHÍNH SÁCH</h3>
        <ul>
          <li><a href="#">Trang chủ</a></li>
          <li><a href="#">Giới thiệu</a></li>
          <li><a href="#">Sản phẩm</a></li>
          <li><a href="#">Tin tức</a></li>
          <li><a href="#">Liên hệ</a></li>
        </ul>
      </div>
    </div>

    <!-- Mạng xã hội -->
    <div class="social-media">
      <h3>THEO DÕI CHÚNG TÔI</h3>
      <div class="social-icons">
        <a href="#" class="social-btn facebook" title="Facebook">
          <font-awesome-icon :icon="['fab', 'facebook']" />
        </a>
        <a href="#" class="social-btn twitter" title="X (Twitter)">
          <font-awesome-icon :icon="['fab', 'x-twitter']" />
        </a>
        <a href="#" class="social-btn youtube" title="YouTube">
          <font-awesome-icon :icon="['fab', 'youtube']" />
        </a>
        <a href="#" class="social-btn instagram" title="Instagram">
          <font-awesome-icon :icon="['fab', 'instagram']" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
/* Tổng quan footer */
.footer {
  background-color: #2c3e50;
  color: white;
  padding: 40px 20px;
  font-size: 14px;
  margin-top: 50px;
}

/* Chia footer thành 4 cột */
.footer-container {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: auto;
  flex-wrap: wrap;
  gap: 20px;
}

/* Căn chỉnh từng phần trong footer */
.footer-section {
  flex: 1;
  min-width: 220px;
  padding: 10px;
}

.footer-section h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #f1c40f;
  letter-spacing: 0.5px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  text-decoration: none;
  color: #ecf0f1;
  transition: all 0.25s ease;
}

.footer-section ul li a:hover {
  color: #f1c40f;
  padding-left: 5px;
}

/* Logo */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.footer-logo h2 {
  font-size: 18px;
  margin: 0;
  font-weight: 700;
}

.logo-img {
  width: 40px;
  height: 40px;
}

/* Dòng thông tin liên hệ */
.contact-line {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #ecf0f1;
}

.contact-icon {
  width: 18px;
  font-size: 15px;
  margin-right: 10px;
  text-align: center;
}

.icon-address {
  color: #e74c3c; /* Đỏ vị trí */
}

.icon-phone {
  color: #2ecc71; /* Xanh lá gọi điện */
}

.icon-email {
  color: #3498db; /* Xanh dương hòm thư */
}

/* Mạng xã hội */
.social-media {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.social-media h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #bdc3c7;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  font-size: 18px;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-3px);
  color: #ffffff;
}

.social-btn.facebook:hover {
  background-color: #1877f2;
}

.social-btn.twitter:hover {
  background-color: #000000;
}

.social-btn.youtube:hover {
  background-color: #ff0000;
}

.social-btn.instagram:hover {
  background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%);
}
</style>