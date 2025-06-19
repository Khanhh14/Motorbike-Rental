<template>
    <footer class="footer">
      <div class="footer-container">
        <!-- Cột 1: Logo và thông tin liên hệ -->
        <div class="footer-section">
          <div class="footer-logo">
            <img src="@/assets/image/logo.png" alt="Travel Logo" class="logo-img" />
            <h2>Travalizer Phú Yên</h2>
          </div>
          <p>🏢 Tuy Hòa - Phú Yên</p>
          <p>📞 (03) 6335 2990 - (03) 5690 7889</p>
          <p>📧 busu6226@gmail.com</p>
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
        <h3>THEO DÕI</h3>
        <div class="social-icons">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-youtube"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
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
  margin-top: 50px; /* Tạo khoảng cách giữa Footer và phần nội dung trên */
}

/* Chia footer thành 4 cột */
.footer-container {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: auto;
  flex-wrap: wrap;
}

/* Căn chỉnh từng phần trong footer */
.footer-section {
  flex: 1;
  min-width: 200px;
  padding: 10px;
}

.footer-section h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 6px;
}

.footer-section ul li a {
  text-decoration: none;
  color: white;
}

.footer-section ul li a:hover {
  color: #f1c40f;
}

/* Logo */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 40px;
  height: 40px;
}

/* Mạng xã hội */
.social-media {
  text-align: center;
  margin-top: 20px;
}

.social-icons a {
  font-size: 24px;
  color: white;
  margin: 0 10px;
}

.social-icons a:hover {
  color: #f1c40f;
}

  </style>
  