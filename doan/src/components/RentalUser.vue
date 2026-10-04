<template>
  <div class="rental-user-page">
    <!-- Sidebar -->
    <div class="sidebar-wrapper">
      <Sidebar />
    </div>

    <!-- Main Content Zone -->
    <main class="main-container">
      <!-- Header Zone -->
      <div class="page-header">
        <div>
          <h2 class="title">Danh Sách Đơn Thuê</h2>
          <p class="subtitle">Quản lý các đơn hàng và lịch sử thuê xe của bạn</p>
        </div>
        <div class="search-wrapper">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-icon" />
          <input 
            v-model="search" 
            placeholder="Tìm theo tên xe, người thuê..." 
            class="search-box" 
          />
        </div>
      </div>

      <!-- Table Container -->
      <div class="table-card">
        <table class="rental-table">
          <thead>
            <tr>
              <th>Người thuê</th>
              <th>Tên xe</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <!-- Click dòng để xem chi tiết đơn thuê -->
            <tr 
              v-for="order in filteredOrders" 
              :key="order.id"
              class="clickable-row"
              @click="openDetailModal(order)"
            >
              <td class="font-medium">
                {{ order.renter_name || order.full_name || order.user_name || order.customer_name || 'Khách hàng' }}
              </td>
              <td class="font-semibold text-dark">{{ order.motorbike_model || order.motorbike_name }}</td>
              <td>{{ formatDate(order.start_date) }}</td>
              <td>{{ formatDate(order.end_date) }}</td>
              <td class="font-semibold highlight-price">
                {{ formatPrice(order.total_price) }}
              </td>
              <td>
                <span :class="['badge', getStatusClass(order.status)]">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="text-center">
                <button
                  v-if="order.status === 'completed'"
                  class="btn-review"
                  @click.stop="openReviewModal(order)"
                >
                  <font-awesome-icon :icon="['fas', 'star']" class="btn-icon" />
                  Đánh giá
                </button>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="7" class="empty-state">
                Không tìm thấy đơn thuê nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Xem Chi Tiết Đơn Thuê -->
      <ModalDetailRental
        :rental="selectedDetailOrder"
        :backend-url="BACKEND_URL"
        @close="selectedDetailOrder = null"
      />

      <!-- Modal Viết Đánh Giá -->
      <transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-card">
            <button class="modal-close" @click="showModal = false" title="Đóng">
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
            
            <div class="modal-header">
              <h3>Đánh giá chuyến đi</h3>
              <p class="modal-subtitle">{{ selectedOrder.motorbike_model || selectedOrder.motorbike_name }}</p>
            </div>

            <div class="modal-body">
              <!-- Star Rating Component -->
              <div class="form-group text-center">
                <label class="rating-label">Mức độ hài lòng của bạn</label>
                <div class="star-rating center-stars">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star-item"
                    :class="{ 
                      'active': star <= (hoverRating || review.rating),
                      'hovered': star <= hoverRating 
                    }"
                    @click="setRating(star)"
                    @mouseover="hoverRating = star"
                    @mouseleave="hoverRating = 0"
                  >
                    <font-awesome-icon :icon="['fas', 'star']" />
                  </span>
                </div>
                <span class="rating-text" v-if="review.rating || hoverRating">
                  {{ ratingLabels[(hoverRating || review.rating) - 1] }}
                </span>
              </div>

              <!-- Comment Input -->
              <div class="form-group">
                <label class="comment-label">Bình luận của bạn:</label>
                <textarea 
                  v-model="review.comment" 
                  rows="4"
                  placeholder="Chia sẻ trải nghiệm của bạn về chiếc xe này..."
                  class="form-textarea"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="showModal = false">Hủy</button>
              <button class="btn-submit" @click="submitReview">Gửi đánh giá</button>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import Sidebar from "@/components/SideUser.vue";
import ModalDetailRental from "@/components/ModalDetailRental.vue";

export default {
  name: "RentalUser",
  components: {
    Sidebar,
    ModalDetailRental,
  },
  data() {
    return {
      BACKEND_URL: "http://localhost:5000",
      orders: [],
      search: "",
      user_id: localStorage.getItem("user_id"),
      
      // State cho Modal Chi tiết
      selectedDetailOrder: null,

      // State cho Modal Đánh giá
      showModal: false,
      selectedOrder: {},
      hoverRating: 0,
      review: {
        rating: 0,
        comment: "",
      },
      ratingLabels: ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tuyệt vời"],
    };
  },
  computed: {
    filteredOrders() {
      return this.orders.filter((order) =>
        Object.values(order).some((value) =>
          String(value || "").toLowerCase().includes(this.search.toLowerCase())
        )
      );
    },
  },
  methods: {
    async fetchUserRentals() {
      try {
        const response = await axios.get("http://localhost:5000/api/rentals/user-rentals", {
          withCredentials: true,
        });
        this.orders = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.response?.status, error.response?.data);
      }
    },
    openDetailModal(order) {
      this.selectedDetailOrder = order;
    },
    openReviewModal(order) {
      this.selectedOrder = order;
      this.review = { rating: 0, comment: "" };
      this.hoverRating = 0;
      this.showModal = true;
    },
    setRating(star) {
      this.review.rating = star;
    },
    async submitReview() {
      if (!this.review.rating) {
        alert("Vui lòng chọn số sao đánh giá!");
        return;
      }
      if (!this.review.comment.trim()) {
        alert("Vui lòng nhập nội dung bình luận!");
        return;
      }

      const motorbike_id = this.selectedOrder.motorbike_id || this.selectedOrder.motorbike?.id;

      if (!motorbike_id) {
        alert("Không thể xác định ID xe để gửi đánh giá.");
        return;
      }

      const reviewData = {
        user_id: this.user_id,
        motorbike_id,
        rating: Number(this.review.rating),
        comment: this.review.comment.trim(),
      };

      try {
        await axios.post("http://localhost:5000/api/reviews", reviewData);
        alert("Đánh giá thành công! Cảm ơn bạn đã gửi phản hồi.");
        this.showModal = false;
        this.fetchUserRentals();
      } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error.response?.status, error.response?.data);
        alert("Gửi đánh giá thất bại. Vui lòng kiểm tra lại kết nối hoặc tài khoản!");
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "---";
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    },
    formatPrice(val) {
      if (val === undefined || val === null) return "0 VND";
      return Number(val).toLocaleString("vi-VN") + " VND";
    },
    getStatusClass(status) {
      return {
        completed: "badge-completed",
        ongoing: "badge-ongoing",
        canceled: "badge-canceled",
        pending: "badge-pending",
      }[status] || "badge-default";
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

/* Icon tìm kiếm */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 15px;
}

.search-box {
  padding-left: 36px !important;
}

/* Icon nút đánh giá */
.btn-review {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-icon {
  color: #facc15;
  font-size: 14px;
}

/* Icon đánh giá sao trong modal */
.star-rating {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 10px 0;
}

.star-item {
  font-size: 26px;
  color: #cbd5e1;
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease;
}

.star-item:hover,
.star-item.hovered,
.star-item.active {
  color: #facc15;
}

.star-item:hover {
  transform: scale(1.15);
}

/* Nút đóng modal */
.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>