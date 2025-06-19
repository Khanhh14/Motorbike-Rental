<template>
    <div class="container">
      <h1 class="title">Quản lý đánh giá</h1>
  
      <div class="card">
        <div class="search-container">
          <input v-model="search" type="text" placeholder="Tìm kiếm..." class="search-box" />
        </div>
  
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người đánh giá</th>
              <th>Xe</th> 
              <th>Điểm</th>
              <th>Nhận xét</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in filteredReviews" :key="review.id">
              <td>{{ review.id }}</td>
              <td>{{ review.username }}</td>
              <td>{{ review.motorbike_name }}</td> 
              <td>{{ review.rating }}</td>
              <td>{{ review.comment }}</td>
            </tr>
          </tbody>
        </table>
  
        <p v-if="loading">Đang tải dữ liệu...</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        reviews: [],
        search: "",
        loading: false,
        error: null,
      };
    },
  
    computed: {
      filteredReviews() {
        return this.reviews.filter((review) => {
          return (
            (review.username?.toLowerCase().includes(this.search.toLowerCase()) || "") ||
            (review.motorbike_name?.toLowerCase().includes(this.search.toLowerCase()) || "") ||
            (review.comment?.toLowerCase().includes(this.search.toLowerCase()) || "")
          );
        });
      },
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
          this.error = "Không thể tải danh sách đánh giá.";
        } finally {
          this.loading = false;
        }
      },
    },
  
    mounted() {
      this.fetchReviews();
    },
  };
  </script>
  
  
  <style scoped>
  @import "@/assets/style/ReviewAdmin.css";
  </style>
  