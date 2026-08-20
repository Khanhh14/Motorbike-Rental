<template>
  <div class="home-page">
    <!-- Hero Section với hiệu ứng parallax -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content">
          
          <h1 class="hero-title">
            Thuê xe máy giá rẻ
            <span class="highlight">Travalizer</span>
          </h1>
          <p class="hero-description">
            Trải nghiệm hành trình khám phá Phú Yên với những chiếc xe máy chất lượng,
            giá cả phải chăng và dịch vụ tận tâm
          </p>
          <div class="hero-actions">
            <button class="btn-primary">
              <span>Đặt xe ngay</span>
              <i class="arrow-icon">→</i>
            </button>
            <button class="btn-secondary">
              <span>Xem xe</span>
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ stats.total_bikes }}+</span>
              <span class="stat-label">Xe máy</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.total_customers }}+</span>
              <span class="stat-label">Khách hàng</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.avg_rating }}⭐</span>
              <span class="stat-label">Đánh giá</span>
            </div>
          </div>
        </div>
      </div>
      <div class="floating-card">
        <div class="card-content">
          <div class="card-icon">🚀</div>
          <div>
            <h4>Giảm 10%</h4>
            <p>Cho đơn hàng đầu tiên</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Điểm đến hấp dẫn -->
    <section class="destinations-section">
      <div class="section-header">
        <div class="header-left">
          <span class="section-tag">ĐIỂM ĐẾN</span>
          <h2 class="section-title">NHỮNG ĐỊA ĐIỂM <span class="highlight">HẤP DẪN</span> Ở PHÚ YÊN</h2>
        </div>
        <p class="section-subtitle">
          Khám phá những điểm đến tuyệt đẹp tại Phú Yên với xe máy chất lượng từ Travalizer
        </p>
      </div>

      <div class="location-grid">
        <div 
          v-for="(item, index) in locations" 
          :key="index" 
          class="location-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="location-image">
            <img :src="item.image" :alt="item.name" />
            <div class="location-overlay">
              <span class="location-number">#{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
          </div>
          <div class="location-info">
            <h3>{{ item.name }}</h3>
            <div class="location-meta">
              <span class="distance"></span>
              <span class="rating"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="view-all-container">
        <button class="btn-view-all">
          Xem tất cả điểm đến
          <i class="arrow-icon">→</i>
        </button>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-container">
        <div class="feature-item">
          <div class="feature-icon">🛵</div>
          <h4>Xe đa dạng</h4>
          <p>Nhiều loại xe phù hợp với mọi nhu cầu</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💰</div>
          <h4>Giá rẻ</h4>
          <p>Giá cả cạnh tranh, không phát sinh</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔧</div>
          <h4>Bảo dưỡng</h4>
          <p>Xe được kiểm tra kỹ lưỡng mỗi ngày</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🤝</div>
          <h4>Hỗ trợ 24/7</h4>
          <p>Đội ngũ hỗ trợ tận tâm</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'HomeView',
  data() {
    return {
      stats: {
        total_bikes: 0,
        total_customers: 0,
        avg_rating: 5.0
      },
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
  },
  methods: {
    async fetchLandingStats() {
      try {
        const response = await axios.get("http://localhost:5000/api/stats/landing");
        if (response.data) {
          this.stats = {
            total_bikes: response.data.total_bikes ?? 0,
            total_customers: response.data.total_customers ?? 0,
            avg_rating: response.data.avg_rating ?? 5.0
          };
        }
      } catch (error) {
        console.error("Lỗi khi tải thông kê trang chủ:", error);
      }
    }
  },
  mounted() {
    this.fetchLandingStats();
  }
};
</script>

<style scoped>
@import "@/assets/style/home.css";
</style>