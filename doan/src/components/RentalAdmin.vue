<template>
  <div class="container">
    <h1 class="title">Quản lý cho thuê</h1>

    <div class="card">
      <div class="search-container">
        <input v-model="search" type="text" placeholder="Tìm kiếm..." class="search-box" />
        <div class="filter-container">
          <select v-model="selectedStatus" class="filter-dropdown">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="ongoing">Đang thuê</option>
            <option value="completed">Hoàn thành</option>
            <option value="canceled">Đã hủy</option>
          </select>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
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
          <tr v-for="rental in paginatedRentals" :key="rental.id">
            <td>{{ rental.id }}</td>
            <td>{{ rental.renter_name }}</td>
            <td>{{ rental.motorbike_model }}</td>
            <td>{{ formatDateTime(rental.start_date) }}</td>
            <td>{{ formatDateTime(rental.end_date) }}</td>
            <td>{{ formatCurrency(rental.total_price) }}</td>
            <td class="status" :class="statusClass(rental.status)">
              {{ getStatusText(rental.status) }}
            </td>
            <td v-if="rental.status === 'pending'" class="action-buttons">
              <button class="btn accept" @click="updateStatus(rental.id, 'ongoing', rental.motorbike_id)">Chấp nhận</button>
              <button class="btn reject" @click="updateStatus(rental.id, 'canceled', rental.motorbike_id)">Từ chối</button>
            </td>
            <td v-else>-</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button :disabled="currentPage === 1" @click="currentPage--">«</button>
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="currentPage++">»</button>
      </div>

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
      return this.rentals.filter((rental) => {
        const name = rental.user_name ? rental.user_name.toLowerCase() : "";
        const model = rental.motorbike_model ? rental.motorbike_model.toLowerCase() : "";
        const searchText = this.search ? this.search.toLowerCase() : "";

        const matchesSearch = name.includes(searchText) || model.includes(searchText);
        const matchesStatus = this.selectedStatus ? rental.status === this.selectedStatus : true;

        return matchesSearch && matchesStatus;
      });
    },
    paginatedRentals() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredRentals.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredRentals.length / this.pageSize) || 1;
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

    formatDateTime(date) {
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    },

    statusClass(status) {
      return {
        pending: status === "pending",
        ongoing: status === "ongoing",
        completed: status === "completed",
        canceled: status === "canceled",
      };
    },

    getStatusText(status) {
      return {
        pending: "Chờ xử lý",
        ongoing: "Đang thuê",
        completed: "Hoàn thành",
        canceled: "Đã hủy",
      }[status];
    },
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
