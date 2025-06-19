<template>
    <div class="review-user-container">
      <h2>Đánh giá của bạn</h2>
  
      <div v-if="loading">Đang tải đánh giá...</div>
      <div v-if="error" class="error">{{ error }}</div>
  
      <div class="review-list" v-if="reviews.length > 0">
        <div class="review-card" v-for="review in reviews" :key="review.id">
          <h3>{{ review.motorbike_name }}</h3>
          <p>⭐ {{ review.rating }}/5</p>
          <p>{{ review.comment }}</p>
          <p class="date">{{ formatDate(review.created_at) }}</p>
        </div>
      </div>
  
      <p v-if="!loading && reviews.length === 0">Bạn chưa đánh giá xe nào.</p>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  
  export default {
    data() {
      return {
        reviews: [], // Danh sách đánh giá của người dùng
        loading: false, // Trạng thái tải dữ liệu
        error: null, // Thông báo lỗi
      };
    },
    methods: {
      // Hàm gọi API để lấy danh sách đánh giá của người dùng
      async fetchUserReviews() {
        this.loading = true;
        try {
          const token = localStorage.getItem("token"); // Lấy token từ localStorage
  
          const res = await axios.get("http://localhost:5000/api/reviews/user-reviews", {
            headers: {
              Authorization: `Bearer ${token}`, // Gửi token trong header
            },
          });
  
          this.reviews = res.data; // Gán dữ liệu đánh giá vào biến reviews
        } catch (err) {
          if (err.response && err.response.status === 404) {
            this.reviews = []; // Không có đánh giá nào
          } else {
            this.error = "Không thể tải đánh giá."; // Lỗi khác
          }
        } finally {
          this.loading = false; // Kết thúc trạng thái tải
        }
      },
      // Hàm định dạng ngày tháng
      formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN");
      },
    },
    mounted() {
      this.fetchUserReviews(); // Gọi hàm lấy đánh giá khi component được mount
    },
  };
  </script>
  
  <style scoped>
  .review-user-container {
    padding: 20px;
  }
  .review-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  .review-card {
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 8px;
    width: 300px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .date {
    color: gray;
    font-size: 13px;
  }
  .error {
    color: red;
  }
  </style>
