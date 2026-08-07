<template>
  <div class="rental-admin-container">
    <!-- Header Page -->
    <div class="page-header">
      <div>
        <h1 class="title">Quản lý cho thuê xe</h1>
        <p class="subtitle">Theo dõi, phê duyệt và quản lý các hợp đồng thuê xe máy</p>
      </div>
    </div>

    <!-- Thẻ thống kê nhanh (Stats Bar) -->
    <div class="stats-grid">
      <div class="stat-card orange">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đơn chờ xử lý</span>
          <strong class="stat-value">{{ pendingCount }}</strong>
        </div>
      </div>

      <div class="stat-card blue">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="1" y="3" width="15" height="13" rx="2"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đang thuê</span>
          <strong class="stat-value">{{ ongoingCount }}</strong>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đã hoàn thành</span>
          <strong class="stat-value">{{ completedCount }}</strong>
        </div>
      </div>

      <div class="stat-card purple">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tổng giá trị đơn</span>
          <strong class="stat-value highlight">{{ formatCurrency(totalRevenue) }}</strong>
        </div>
      </div>
    </div>

    <!-- Card chính -->
    <div class="card">
      <!-- Toolbar: Search & Select Filter -->
      <div class="table-toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="search" 
            type="text" 
            placeholder="Tìm theo người thuê, mẫu xe..." 
          />
          <button v-if="search" class="clear-btn" @click="search = ''">&times;</button>
        </div>

        <div class="filter-select-wrapper">
          <select v-model="selectedStatus" class="select-filter">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="ongoing">Đang thuê</option>
            <option value="completed">Hoàn thành</option>
            <option value="canceled">Đã hủy</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && rentals.length === 0" class="state-container">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu cho thuê...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="state-container error-state">
        <p class="error-text">{{ error }}</p>
        <button class="btn-retry" @click="fetchRentals">Thử lại</button>
      </div>

      <!-- Table Content -->
      <div v-else class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Người thuê</th>
              <th>Xe thuê</th>
              <th>Thời gian thuê</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th style="width: 170px; text-align: center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rental in paginatedRentals" :key="rental.id">
              <td class="col-id">#{{ rental.id }}</td>
              <td>
                <div class="renter-info">
                  <div class="avatar-placeholder">{{ getInitials(rental.renter_name || rental.user_name) }}</div>
                  <span class="renter-name">{{ rental.renter_name || rental.user_name || 'Khách hàng' }}</span>
                </div>
              </td>
              <td class="bike-model">
                <span class="bike-badge">{{ rental.motorbike_model || 'N/A' }}</span>
              </td>
              <td>
                <div class="time-range">
                  <span class="time-start"> Từ: {{ formatDateTime(rental.start_date) }}</span>
                  <span class="time-end"> Đến: {{ formatDateTime(rental.end_date) }}</span>
                </div>
              </td>
              <td class="col-price">{{ formatCurrency(rental.total_price) }}</td>
              <td>
                <span class="status-badge" :class="statusClass(rental.status)">
                  <span class="status-dot"></span>
                  {{ getStatusText(rental.status) }}
                </span>
              </td>
              <td style="text-align: center;">
                <div v-if="rental.status === 'pending'" class="action-buttons">
                  <button class="btn-action accept" title="Chấp nhận đơn" @click="updateStatus(rental.id, 'ongoing', rental.motorbike_id)">
                    ✓ Chấp nhận
                  </button>
                  <button class="btn-action reject" title="Từ chối đơn" @click="updateStatus(rental.id, 'canceled', rental.motorbike_id)">
                    ✕ Từ chối
                  </button>
                </div>
                <span v-else class="no-action">—</span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredRentals.length === 0">
              <td colspan="7" class="empty-cell">
                Chưa có hợp đồng cho thuê nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer / Pagination -->
      <div class="table-footer">
        <p class="records-count">Hiển thị {{ paginatedRentals.length }}/{{ filteredRentals.length }} bản ghi</p>

        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
          <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RentalAdmin",
  data() {
    return {
      rentals: [],
      search: "",
      selectedStatus: "",
      loading: false,
      error: null,
      refreshInterval: null,
      currentPage: 1,
      pageSize: 10,
    };
  },

  computed: {
    filteredRentals() {
      const searchText = this.search.trim().toLowerCase();
      const filtered = this.rentals.filter((rental) => {
        const name = (rental.renter_name || rental.user_name || "").toLowerCase();
        const model = (rental.motorbike_model || "").toLowerCase();

        const matchesSearch = name.includes(searchText) || model.includes(searchText);
        const matchesStatus = this.selectedStatus ? rental.status === this.selectedStatus : true;

        return matchesSearch && matchesStatus;
      });

      // Sắp xếp đơn thuê mới nhất lên đầu dựa trên ID giảm dần
      return filtered.sort((a, b) => Number(b.id) - Number(a.id));
    },

    paginatedRentals() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredRentals.slice(start, start + this.pageSize);
    },

    totalPages() {
      return Math.ceil(this.filteredRentals.length / this.pageSize) || 1;
    },

    pendingCount() {
      return this.rentals.filter(r => r.status === 'pending').length;
    },

    ongoingCount() {
      return this.rentals.filter(r => r.status === 'ongoing').length;
    },

    completedCount() {
      return this.rentals.filter(r => r.status === 'completed').length;
    },

    totalRevenue() {
      return this.rentals
        .filter(r => r.status === 'completed' || r.status === 'ongoing')
        .reduce((sum, r) => sum + Number(r.total_price || 0), 0);
    }
  },

  watch: {
    search() {
      this.currentPage = 1;
    },
    selectedStatus() {
      this.currentPage = 1;
    }
  },

  methods: {
    async fetchRentals() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("http://localhost:5000/api/rentals");
        this.rentals = response.data;
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        this.error = "Không thể tải danh sách cho thuê.";
      } finally {
        this.loading = false;
      }
    },

    async updateStatus(id, status, motorbike_id) {
      try {
        await axios.put(`http://localhost:5000/api/rentals/${id}/status`, { status });
        const newMotorbikeStatus = status === "ongoing" ? "Rented" : "Available";
        await this.updateMotorbikeStatus(motorbike_id, newMotorbikeStatus);
        await this.fetchRentals();

        if (status === "ongoing") {
          alert("✅ Đã chấp nhận đơn thuê!");
        } else if (status === "canceled") {
          alert("❌ Đã từ chối đơn thuê!");
        }
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        alert("Không thể cập nhật trạng thái!");
      }
    },

    async updateMotorbikeStatus(motorbike_id, status) {
      if (!motorbike_id) return;
      try {
        await axios.put(`http://localhost:5000/api/motorbikes/${motorbike_id}/status`, { status });
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái xe:", error);
      }
    },

    formatDateTime(dateStr) {
      if (!dateStr) return "—";
      return new Date(dateStr).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatCurrency(amount) {
      if (!amount) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    },

    statusClass(status) {
      return {
        'status-pending': status === "pending",
        'status-ongoing': status === "ongoing",
        'status-completed': status === "completed",
        'status-canceled': status === "canceled",
      };
    },

    getStatusText(status) {
      return {
        pending: "Chờ xử lý",
        ongoing: "Đang thuê",
        completed: "Hoàn thành",
        canceled: "Đã hủy",
      }[status] || "Khác";
    },

    getInitials(name) {
      if (!name) return "K";
      return name.charAt(0).toUpperCase();
    }
  },

  mounted() {
    this.fetchRentals();
    this.refreshInterval = setInterval(() => this.fetchRentals(), 5000);
  },

  beforeUnmount() {
    clearInterval(this.refreshInterval);
  },
};
</script>

<style scoped>
@import "@/assets/style/RentalAdmin.css";
</style>