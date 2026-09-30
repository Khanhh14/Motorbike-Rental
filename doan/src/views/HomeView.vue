<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content">
          <div class="hero-badge">
            <font-awesome-icon :icon="['fas', 'shield-halved']" />
            Dịch vụ cho thuê xe số 1 Phú Yên
          </div>

          <h1 class="hero-title">
            Thuê xe máy giá rẻ <span class="highlight">Travalizer</span>
          </h1>
          <p class="hero-description">
            Tự do vi vu khám phá xứ Nẫu với dàn xe đời mới, giao xe tận nơi tại Ga Tuy Hòa & Sân bay chỉ sau 15 phút.
          </p>

          <div class="hero-actions">
            <button class="btn-primary" @click="$router?.push('/bikes')">
              <span>Đặt xe ngay</span>
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="arrow-icon" />
            </button>
            <button class="btn-secondary">
              <span>Xem bảng giá xe</span>
            </button>
          </div>

          <!-- Thống kê nổi bật -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ stats.total_bikes }}+</span>
              <span class="stat-label">Xe sẵn có</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.total_customers }}+</span>
              <span class="stat-label">Khách hài lòng</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">
                {{ stats.avg_rating }}
                <font-awesome-icon :icon="['fas', 'star']" class="icon-star-rating" />
              </span>
              <span class="stat-label">Đánh giá 5 sao</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quy trình thuê xe siêu nhanh -->
    <section class="how-it-works-section">
      <div class="section-header text-center">
        <span class="section-tag">QUY TRÌNH NHANH CHÓNG</span>
        <h2 class="section-title">THUÊ XE CHỈ VỚI <span class="highlight">3 BƯỚC</span> ĐƠN GIẢN</h2>
      </div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-index">01</div>
          <div class="step-icon">
            <font-awesome-icon :icon="['fas', 'mobile-screen-button']" class="icon-step-1" />
          </div>
          <h3>Chọn xe & Đặt lịch</h3>
          <p>Lựa chọn chiếc xe ưng ý, chọn thời gian và địa điểm nhận xe thuận tiện nhất.</p>
        </div>
        <div class="step-card">
          <div class="step-index">02</div>
          <div class="step-icon">
            <font-awesome-icon :icon="['fas', 'id-card']" class="icon-step-2" />
          </div>
          <h3>Nhận xe tận nơi</h3>
          <p>Nhân viên bàn giao xe tại ga, sân bay hoặc khách sạn. Thủ tục giữ CCCD chỉ 2 phút.</p>
        </div>
        <div class="step-card">
          <div class="step-index">03</div>
          <div class="step-icon">
            <font-awesome-icon :icon="['fas', 'route']" class="icon-step-3" />
          </div>
          <h3>Khám phá Phú Yên</h3>
          <p>Thoải mái tận hưởng kỳ nghỉ với đội ngũ hỗ trợ kỹ thuật và cứu hộ 24/7 trên mọi cung đường.</p>
        </div>
      </div>
    </section>

    <!-- Điểm đến hấp dẫn -->
    <section class="destinations-section">
      <div class="section-header">
        <div class="header-left">
          <span class="section-tag">ĐIỂM ĐẾN PHÚ YÊN</span>
          <h2 class="section-title">CÁC TỌA ĐỘ <span class="highlight">CHECK-IN</span> ĐẸP NHẤT</h2>
        </div>
        <p class="section-subtitle">
          Gợi ý khoảng cách từ trung tâm TP. Tuy Hòa giúp bạn chủ động lịch trình vi vu bằng xe máy.
        </p>
      </div>

      <div class="location-grid">
        <div 
          v-for="(item, index) in locations" 
          :key="index" 
          class="location-card"
        >
          <div class="location-image">
            <img :src="item.image" :alt="item.name" loading="lazy" />
            <div class="location-overlay">
              <span class="location-number">#{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="location-badge">{{ item.tag }}</span>
            </div>
          </div>
          <div class="location-info">
            <h3>{{ item.name }}</h3>
            <div class="location-meta">
              <span class="meta-item">
                <font-awesome-icon :icon="['fas', 'road']" class="meta-icon" /> {{ item.distance }}
              </span>
              <span class="meta-item">
                <font-awesome-icon :icon="['fas', 'clock']" class="meta-icon" /> {{ item.travelTime }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="view-all-container">
        <button class="btn-view-all">
          <span>Xem cẩm nang du lịch Phú Yên</span>
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="arrow-icon" />
        </button>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-container">
        <div class="feature-item">
          <div class="feature-icon icon-bg-blue">
            <font-awesome-icon :icon="['fas', 'motorcycle']" class="icon-bike" />
          </div>
          <h4>Xe đời mới 100%</h4>
          <p>Kiểm tra phanh, lốp, nhớt kỹ lưỡng trước khi bàn giao xe</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon icon-bg-green">
            <font-awesome-icon :icon="['fas', 'sack-dollar']" class="icon-money" />
          </div>
          <h4>Giá rõ ràng, minh bạch</h4>
          <p>Chỉ từ 100k/ngày, không phát sinh phụ phí ẩn</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon icon-bg-orange">
            <font-awesome-icon :icon="['fas', 'truck-fast']" class="icon-truck" />
          </div>
          <h4>Giao xe miễn phí</h4>
          <p>Giao nhận tận nơi tại Ga Tuy Hòa, Bến xe & khách sạn trung tâm</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon icon-bg-purple">
            <font-awesome-icon :icon="['fas', 'headset']" class="icon-support" />
          </div>
          <h4>Hỗ trợ sự cố 24/7</h4>
          <p>Đổi xe mới ngay lập tức nếu gặp sự cố dọc đường</p>
        </div>
      </div>
    </section>

    <!-- Đánh giá khách hàng thực tế -->
    <section class="testimonials-section">
      <div class="section-header text-center">
        <span class="section-tag">ĐÁNH GIÁ THỰC TẾ</span>
        <h2 class="section-title">KHÁCH HÀNG NÓI GÌ VỀ <span class="highlight">TRAVALIZER</span></h2>
      </div>
      <div class="testimonials-grid">
        <div class="testimonial-card" v-for="(review, idx) in reviews" :key="idx">
          <div class="stars">
            <font-awesome-icon :icon="['fas', 'star']" class="icon-star-gold" v-for="s in 5" :key="s" />
          </div>
          <p class="review-text">“{{ review.comment }}”</p>
          <div class="reviewer">
            <div class="reviewer-avatar">{{ review.author.charAt(0) }}</div>
            <div class="reviewer-info">
              <strong>{{ review.author }}</strong>
              <small>{{ review.origin }}</small>
            </div>
          </div>
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
        { 
          name: 'THÁP NGHINH PHONG', 
          image: new URL('@/assets/image/a1.jpg', import.meta.url).href,
          distance: '2.5 km',
          travelTime: '5 phút',
          tag: 'Check-in nổi tiếng'
        },
        { 
          name: 'GÀNH ĐÁ ĐĨA', 
          image: new URL('@/assets/image/a3.jpg', import.meta.url).href,
          distance: '35 km',
          travelTime: '45 phút',
          tag: 'Kỳ quan thiên nhiên'
        },
        { 
          name: 'MŨI ĐIỆN (HẢI ĐĂNG)', 
          image: new URL('@/assets/image/a4.jpg', import.meta.url).href,
          distance: '33 km',
          travelTime: '40 phút',
          tag: 'Đón bình minh'
        },
        { 
          name: 'THÁP NHẠN', 
          image: new URL('@/assets/image/a5.jpg', import.meta.url).href,
          distance: '1.5 km',
          travelTime: '4 phút',
          tag: 'Di tích Chăm Pa'
        },
        { 
          name: 'VỰC HÒM', 
          image: new URL('@/assets/image/a6.jpg', import.meta.url).href,
          distance: '42 km',
          travelTime: '55 phút',
          tag: 'Phượt cắm trại'
        },
        { 
          name: 'BÃI XÉP - HOA VÀNG CỎ XANH', 
          image: new URL('@/assets/image/a7.jpg', import.meta.url).href,
          distance: '14 km',
          travelTime: '20 phút',
          tag: 'Bãi biển đẹp'
        },
        { 
          name: 'NHÀ THỜ MẰNG LĂNG', 
          image: new URL('@/assets/image/a8.jpg', import.meta.url).href,
          distance: '32 km',
          travelTime: '40 phút',
          tag: 'Kiến trúc cổ'
        },
        { 
          name: 'HÒN YẾN', 
          image: new URL('@/assets/image/a9.jpg', import.meta.url).href,
          distance: '20 km',
          travelTime: '25 phút',
          tag: 'Ngắm san hô'
        }
      ],
      reviews: [
        {
          author: 'Minh Hoàng',
          origin: 'Du khách từ Hà Nội',
          comment: 'Xe Vision chạy cực êm, leo dốc Mũi Điện nhẹ nhàng. Anh chủ giao xe đúng giờ tại ga và nhiệt tình hướng dẫn đường đi ăn bánh hỏi cháo lòng ngon.'
        },
        {
          author: 'Ngọc Lan',
          origin: 'Du khách từ TP.HCM',
          comment: 'Thủ tục nhanh gọn, mũ bảo hiểm mới và có kính chống nắng rất chu đáo. Sẽ giới thiệu cho bạn bè khi tới Phú Yên!'
        },
        {
          author: 'Thành Trung',
          origin: 'Phượt thủ',
          comment: 'Thuê 2 chiếc Wave đi Gành Đá Đĩa và Vực Hòm 3 ngày liền không trục trặc gì. Giá thuê quá hợp lý so với chất lượng dịch vụ.'
        }
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