<template>
  <section class="hero-section">
    <div class="overlay">
      <h1>Travalizer - Thuê xe máy giá rẻ</h1>
      <p>Trang Web cho thuê xe máy dành cho những người du lịch tại Phú Yên</p>
    </div>
  </section>

  <!-- Thêm phần hình ảnh -->
  <section class="rental-locations">
    <h2>ĐIỂM ĐẾN HẤP DẪN Ở PHÚ YÊN</h2>
    <div class="location-container">
      <div class="location">
        <img src="@/assets/image/a1.jpg" alt="Tháp Nghinh Phong" />
        <span>THÁP NGHINH PHONG</span>
      </div>
      <div class="location">
        <img src="@/assets/image/a3.jpg" alt="Gành Đá Đĩa" />
        <span>GÀNH ĐÁ ĐĨA</span>
      </div>
      <div class="location">
        <img src="@/assets/image/a4.jpg" alt="Mũi Điện" />
        <span>MŨI ĐIỆN</span>
      </div>
      <div class="location">
        <img src="@/assets/image/a5.jpg" alt="Tháp Nhạn" />
        <span>THÁP NHẠN</span>
      </div>
      <div class="location">
        <img src="@/assets/image/a6.jpg" alt="Vực Hòm" />
        <span>VỰC HÒM</span>
      </div>
      <div class="location">
        <img src="@/assets/image/a7.jpg" alt="Bãi Xép" />
        <span>BÃI XÉP</span>
      </div>
      <div class="location">
        <img src="@/assets/image/a8.jpg" alt="Nhà Thờ Mằng Lăng" />
        <span>NHÀ THỜ MẰNG LĂNG</span>
      </div>
      <div class="location">
        <img src="@/assets/image/a9.jpg" alt="Hòn Yến" />
        <span>HÒN YẾN</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>

<style scoped>
@import "@/assets/style/home.css";
</style>
