<template>
  <div class="payment-admin-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="title">Quản lý thanh toán</h1>
        <p class="subtitle">Theo dõi các giao dịch thanh toán và lịch sử dòng tiền</p>
      </div>
    </div>

    <!-- Thẻ thống kê (Stats Grid) -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tổng giao dịch</span>
          <strong class="stat-value">{{ total }}</strong>
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
          <span class="stat-label">Thành công</span>
          <strong class="stat-value">{{ success }}</strong>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đang xử lý</span>
          <strong class="stat-value">{{ processing }}</strong>
        </div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đã hủy / Lỗi</span>
          <strong class="stat-value">{{ cancelled }}</strong>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card">
      <!-- Toolbar Filter -->
      <div class="table-toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm theo Mã đơn thuê hoặc ID..." 
            @input="filterPayments"
          />
        </div>

        <div class="filter-select-wrapper">
          <select v-model="selectedStatus" class="select-filter" @change="filterPayments">
            <option value="">Tất cả trạng thái</option>
            <option value="completed">Đã thanh toán</option>
            <option value="pending">Đang xử lý</option>
            <option value="failed">Đã hủy</option>
          </select>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Mã đơn thuê</th>
              <th>Loại thanh toán</th>
              <th>Số tiền</th>
              <th>Hình thức</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th style="width: 130px; text-align: center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedPayments" :key="item.id">
              <td class="col-id">#{{ item.id }}</td>
              <td class="col-rental">
                <span class="rental-badge">#{{ item.rental_id || 'N/A' }}</span>
              </td>
              <td class="col-type">{{ getTypeText(item.type) }}</td>
              <td class="col-amount">{{ formatCurrency(item.amount) }}</td>
              <td>
                <div class="method-tag" :class="getMethodClass(item.payment_method)">
                  <span class="method-dot"></span>
                  {{ getMethodText(item.payment_method) }}
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(item.status)">
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="col-date">{{ formatDate(item.paid_at) || '—' }}</td>
              <td style="text-align: center;">
                <div v-if="item.status === 'pending'" class="action-buttons">
                  <button class="btn btn-confirm" title="Xác nhận thanh toán" @click="updateStatus(item.id, 'completed')">
                    ✓
                  </button>
                  <button class="btn btn-cancel" title="Hủy thanh toán" @click="updateStatus(item.id, 'failed')">
                    ✕
                  </button>
                </div>
                <span v-else class="no-action">—</span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredPayments.length === 0">
              <td colspan="8" class="empty-cell">
                Chưa có dữ liệu giao dịch nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer / Pagination -->
      <div class="table-footer">
        <p class="records-count">Hiển thị {{ paginatedPayments.length }}/{{ filteredPayments.length }} bản ghi</p>
        
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage('prev')">
            ‹
          </button>
          <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage('next')">
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  name: "PaymentAdmin",
  data() {
    return {
      payments: [],
      filteredPayments: [],
      selectedStatus: "",
      searchQuery: "",
      total: 0,
      success: 0,
      processing: 0,
      cancelled: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  computed: {
    paginatedPayments() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredPayments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredPayments.length / this.pageSize) || 1;
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async fetchPayments() {
      try {
        const response = await axios.get("http://localhost:5000/api/payments");
        this.payments = response.data;
        this.applyStatistics();
        this.filterPayments();
      } catch (err) {
        console.error("Lỗi khi lấy danh sách thanh toán:", err);
      }
    },
    applyStatistics() {
      this.total = this.payments.length;
      this.success = this.payments.filter(p => p.status === "completed").length;
      this.processing = this.payments.filter(p => p.status === "pending").length;
      this.cancelled = this.payments.filter(p => p.status === "failed").length;
    },
    filterPayments() {
      let result = this.payments;

      // Lọc theo Status
      if (this.selectedStatus) {
        result = result.filter(p => p.status === this.selectedStatus);
      }

      // Lọc theo Ô tìm kiếm
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter(p => 
          String(p.id).includes(query) || 
          String(p.rental_id || '').toLowerCase().includes(query)
        );
      }

      this.filteredPayments = result;
      this.currentPage = 1;
    },
    changePage(direction) {
      if (direction === "prev" && this.currentPage > 1) {
        this.currentPage--;
      } else if (direction === "next" && this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    formatCurrency(value) {
      if (!value) return "0 ₫";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },
    formatDate(dateStr) {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    getMethodClass(method) {
      switch (method) {
        case "cash": return "method-cash";
        case "bank":
        case "credit_cash": return "method-bank";
        case "wallet":
        case "momo": return "method-momo";
        default: return "";
      }
    },
    getMethodText(method) {
      switch (method) {
        case "cash": return "Tiền mặt";
        case "bank":
        case "credit_cash": return "Chuyển khoản";
        case "wallet":
        case "momo": return "Ví MoMo";
        default: return method || "Khác";
      }
    },
    getStatusClass(status) {
      switch (status) {
        case "completed": return "status-success";
        case "pending": return "status-pending";
        case "failed": return "status-failed";
        default: return "";
      }
    },
    getStatusText(status) {
      switch (status) {
        case "completed": return "Đã thanh toán";
        case "pending": return "Chờ xử lý";
        case "failed": return "Đã hủy";
        default: return "Không rõ";
      }
    },
    getTypeText(type) {
      switch (type) {
        case "rental": return "Đơn thuê xe";
        case "surcharge": return "Phụ thu";
        default: return type || "Khác";
      }
    },
    async updateStatus(paymentId, newStatus) {
      try {
        const confirmText =
          newStatus === "completed"
            ? "Xác nhận đã nhận thanh toán này?"
            : "Xác nhận hủy thanh toán này?";
        if (!confirm(confirmText)) return;

        await axios.put(`http://localhost:5000/api/payments/${paymentId}`, {
          status: newStatus,
        });
        await this.fetchPayments();
        this.toast.success("Cập nhật trạng thái thành công!");
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        this.toast.error("Cập nhật trạng thái thất bại.");
      }
    }
  },
  mounted() {
    this.fetchPayments();
  }
};
</script>

<style scoped>
@import "@/assets/style/PaymentsAdmin.css";
@import '@/assets/style/Toast.css';
</style>