<template>
  <div class="review-admin-container">
    <!-- Header Page -->
    <div class="page-header">
      <div>
        <h1 class="title">Quản lý đánh giá</h1>
        <p class="subtitle">Theo dõi và quản lý phản hồi từ khách hàng thuê xe</p>
      </div>
    </div>

    <!-- Thống kê nhanh (Stats Bar) -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Tổng số đánh giá</span>
        <span class="stat-value">{{ reviews.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Điểm trung bình</span>
        <span class="stat-value highlight">{{ averageRating }} ★</span>
      </div>
    </div>

    <!-- Card chính chứa Table -->
    <div class="card">
      <!-- Toolbar: Search & Action -->
      <div class="table-toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="search" 
            type="text" 
            placeholder="Tìm theo tên người dùng, xe hoặc nội dung..." 
          />
          <button v-if="search" @click="search = ''" class="clear-btn">&times;</button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu đánh giá...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="state-container error-state">
        <p class="error-text">{{ error }}</p>
        <button @click="fetchReviews" class="btn-retry">Thử lại</button>
      </div>

      <!-- Table Content -->
      <div v-else class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Người đánh giá</th>
              <th>Mẫu xe</th> 
              <th style="width: 140px;">Điểm số</th>
              <th>Nhận xét</th>
              <th style="width: 90px; text-align: center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in filteredReviews" :key="review.id">
              <td class="col-id">#{{ review.id }}</td>
              <td>
                <div class="user-info">
                  <div class="avatar-placeholder">{{ getInitials(review.username) }}</div>
                  <span class="username">{{ review.username || 'Khách hàng' }}</span>
                </div>
              </td>
              <td class="bike-name">{{ review.motorbike_name || 'N/A' }}</td> 
              <td>
                <div class="rating-badge" :class="getRatingClass(review.rating)">
                  <span class="stars">★</span>
                  <span class="score">{{ review.rating }}/5</span>
                </div>
              </td>
              <td class="comment-cell">
                <p class="comment-text" :title="review.comment">{{ review.comment || 'Không có nhận xét' }}</p>
              </td>
              <td style="text-align: center;">
                <button @click="deleteReview(review.id)" class="btn-delete" title="Xóa đánh giá này">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>

            <!-- Empty Search State -->
            <tr v-if="filteredReviews.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <p>Không tìm thấy đánh giá nào phù hợp.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ReviewAdmin",
  data() {
    return {
      reviews: [],
      search: "",
      loading: false,
      error: null,
    };
  },

  computed: {
    // Sửa lại logic lọc chuẩn xác
    filteredReviews() {
      const query = this.search.trim().toLowerCase();
      if (!query) return this.reviews;

      return this.reviews.filter((review) => {
        const username = (review.username || "").toLowerCase();
        const motorbike = (review.motorbike_name || "").toLowerCase();
        const comment = (review.comment || "").toLowerCase();

        return username.includes(query) || motorbike.includes(query) || comment.includes(query);
      });
    },

    // Tính điểm trung bình
    averageRating() {
      if (!this.reviews.length) return "0.0";
      const total = this.reviews.reduce((acc, cur) => acc + Number(cur.rating || 0), 0);
      return (total / this.reviews.length).toFixed(1);
    }
  },

  methods: {
    async fetchReviews() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("http://localhost:5000/api/reviews"); 
        this.reviews = response.data; 
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        this.error = "Không thể tải danh sách đánh giá. Vui lòng kiểm tra lại kết nối Server!";
      } finally {
        this.loading = false;
      }
    },

    async deleteReview(id) {
      if (!confirm(`Bạn có chắc chắn muốn xóa đánh giá #${id} không?`)) return;

      try {
        await axios.delete(`http://localhost:5000/api/reviews/${id}`);
        this.reviews = this.reviews.filter(r => r.id !== id);
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Xóa thất bại! Vui lòng thử lại.");
      }
    },

    getRatingClass(rating) {
      if (rating >= 4) return 'rating-high';
      if (rating >= 3) return 'rating-medium';
      return 'rating-low';
    },

    getInitials(name) {
      if (!name) return 'K';
      return name.charAt(0).toUpperCase();
    }
  },

  mounted() {
    this.fetchReviews();
  },
};
</script>

<style scoped>
@import "@/assets/style/ReviewAdmin.css";
</style>