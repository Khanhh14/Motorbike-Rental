<template>
  <section class="hero-section">
    <div class="overlay">
      <h1>Travalizer - Thuê xe máy giá rẻ</h1>
      <p>Trang Web cho thuê xe máy dành cho những người du lịch tại Phú Yên</p>
    </div>
  </section>

  <section class="rental-locations">
    <h2>ĐIỂM ĐẾN HẤP DẪN Ở PHÚ YÊN</h2>
    <div class="location-container">
      <div 
        v-for="(item, index) in locations" 
        :key="index" 
        class="location"
      >
        <img :src="item.image" :alt="item.name" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      locations: [
        { name: 'THÁP NGHINH PHONG', image: new URL('@/assets/image/a1.jpg', import.meta.url).href },
        { name: 'GÀNH ĐÁ ĐĨA', image: new URL('@/assets/image/a3.jpg', import.meta.url).href },
        { name: 'MŨI ĐIỆN', image: new URL('@/assets/image/a4.jpg', import.meta.url).href },
        { name: 'THÁP NHẠN', image: new URL('@/assets/image/a5.jpg', import.meta.url).href },
        { name: 'VỰC HÒM', image: new URL('@/assets/image/a6.jpg', import.meta.url).href },
        { name: 'BÃI XÉP', image: new URL('@/assets/image/a7.jpg', import.meta.url).href },
        { name: 'NHÀ THỜ MẰNG LĂNG', image: new URL('@/assets/image/a8.jpg', import.meta.url).href },
        { name: 'HÒN YẾN', image: new URL('@/assets/image/a9.jpg', import.meta.url).href }
      ]
    };
  }
};
</script>

<style scoped>
@import "@/assets/style/home.css";
</style>