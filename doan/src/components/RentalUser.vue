<template>
  <div class="rental-user-page">
    <Sidebar />
    <div class="container">
      <h2 class="title">Danh Sách Đơn Thuê</h2>
      <input v-model="search" placeholder="Tìm kiếm..." class="search-box" />

      <table class="rental-table">
        <thead>
          <tr>
            <th>Người thuê</th>
            <th>Tên xe</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>{{ order.renter_name }}</td>
            <td>{{ order.motorbike_model }}</td>
            <td>{{ formatDate(order.start_date) }}</td>
            <td>{{ formatDate(order.end_date) }}</td>
            <td>{{ order.total_price.toLocaleString() }} VND</td>
            <td :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </td>
            <td>
              <button
                v-if="order.status === 'completed'"
                @click="openReviewModal(order)"
              >
                Viết đánh giá
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal Viết Đánh Giá -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="showModal = false">&times;</span>
          <h3>Viết đánh giá cho {{ selectedOrder.motorbike_model }}</h3>

          <label>Đánh giá (1-5 sao):</label>
          <input v-model="review.rating" type="number" min="1" max="5" />

          <label>Bình luận:</label>
          <textarea v-model="review.comment"></textarea>

          <button @click="submitReview">Gửi đánh giá</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Sidebar from "@/components/SideUser.vue";

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      orders: [],
      search: "",
      user_id: localStorage.getItem("user_id"),
      showModal: false,
      selectedOrder: {},
      review: {
        rating: "",
        comment: "",
      },
    };
  },
  computed: {
    filteredOrders() {
      return this.orders.filter((order) =>
        Object.values(order).some((value) =>
          String(value).toLowerCase().includes(this.search.toLowerCase())
        )
      );
    },
  },
  methods: {
    async fetchUserRentals() {
  try {
    const response = await axios.get("http://localhost:5000/api/rentals/user-rentals", {
      withCredentials: true, // Quan trọng nếu dùng cookie để lưu user_id
    });
    this.orders = response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error.response?.status, error.response?.data);
  }
},
    openReviewModal(order) {
      this.selectedOrder = order;
      this.review = { rating: "", comment: "" };
      this.showModal = true;
    },
    
    async submitReview() {
  if (!this.review.rating || !this.review.comment) {
    alert("Vui lòng nhập đủ thông tin đánh giá.");
    return;
  }

  const motorbike_id = this.selectedOrder.motorbike_id;

  if (!motorbike_id) {
    alert("Không thể xác định xe để đánh giá.");
    console.log("selectedOrder hiện tại:", this.selectedOrder);
    return;
  }

  const reviewData = {
    user_id: this.user_id,
    motorbike_id,
    rating: Number(this.review.rating),
    comment: this.review.comment.trim(),
  };

  try {
    const response = await axios.post("http://localhost:5000/api/reviews", reviewData);
    alert("Đánh giá thành công! Cảm ơn bạn đã gửi phản hồi.");
    this.showModal = false;
    this.fetchUserRentals();
  } catch (error) {
    console.error("Lỗi khi gửi đánh giá:", error.response?.status, error.response?.data);
    alert("Gửi đánh giá thất bại. Vui lòng thử lại sau!");
  }
},
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    },
    getStatusClass(status) {
      return {
        completed: "status-completed",
        ongoing: "status-ongoing",
        canceled: "status-canceled",
        pending: "status-pending",
      }[status] || "status-default";
    },
    getStatusText(status) {
      return {
        completed: "Hoàn thành",
        ongoing: "Đang thuê",
        canceled: "Đã hủy",
        pending: "Chờ xác nhận",
      }[status] || "Không xác định";
    },
  },
  mounted() {
    this.fetchUserRentals();
  },
};
</script>

<style scoped>
@import "@/assets/style/RentalUser.css";
</style>
