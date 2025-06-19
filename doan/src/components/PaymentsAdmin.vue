<template>
  <div class="container">
    <h2>Quản lý thanh toán</h2>

    <div class="stats">
      <div class="card"><p>Tổng giao dịch</p><strong class="blue">{{ total }}</strong></div>
      <div class="card"><p>Giao dịch thành công</p><strong class="green">{{ success }}</strong></div>
      <div class="card"><p>Đang xử lý</p><strong class="orange">{{ processing }}</strong></div>
      <div class="card"><p>Đã hủy</p><strong class="red">{{ cancelled }}</strong></div>
    </div>

    <div class="filters">
      <select v-model="selectedStatus" @change="filterPayments">
        <option value="">Tất cả trạng thái</option>
        <option value="completed">Đã thanh toán</option>
        <option value="pending">Đang xử lý</option>
        <option value="failed">Đã hủy</option>
      </select>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Mã Đơn Thuê</th>
          <th>Loại thanh toán</th>
          <th>Tổng tiền</th>
          <th>Hình thức</th>
          <th>Trạng thái</th>
          <th>Ngày thanh toán</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in paginatedPayments" :key="index">
          <td>{{ item.id }}</td>
          <td>{{ item.rental_id || 'N/A' }}</td>
          <td>{{ getTypeText(item.type) }}</td>
          <td>{{ formatCurrency(item.amount) }}</td>
          <td>
            <span class="icon" :class="getMethodClass(item.payment_method)"></span>
            {{ getMethodText(item.payment_method) }}
          </td>
          <td>
            <span :class="'status ' + getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </span>
          </td>
          <td>{{ formatDate(item.paid_at) || '—' }}</td>
          <td>
            <template v-if="item.status === 'pending'">
              <button class="btn confirm" @click="updateStatus(item.id, 'completed')">Xác nhận</button>
              <button class="btn cancel" @click="updateStatus(item.id, 'failed')">Hủy</button>
            </template>
            <template v-else>
              <span>—</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>Hiển thị {{ filteredPayments.length }} bản ghi</p>
      <div class="pagination">
        <button :disabled="currentPage === 1" @click="changePage('prev')">&lt;</button>
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage('next')">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  data() {
    return {
      payments: [],
      filteredPayments: [],
      selectedStatus: "",
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
      return Math.ceil(this.filteredPayments.length / this.pageSize);
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
      if (this.selectedStatus === "") {
        this.filteredPayments = this.payments;
      } else {
        this.filteredPayments = this.payments.filter(p => p.status === this.selectedStatus);
      }
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
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },
    formatDate(dateStr) {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    },
    getMethodClass(method) {
      switch (method) {
        case "cash":
          return "cash";
        case "bank":
        case "credit_cash":
          return "bank";
        case "wallet":
        case "momo":
          return "wallet";
        default:
          return "";
      }
    },
    getMethodText(method) {
      switch (method) {
        case "cash":
          return "Tiền mặt";
        case "bank":
        case "credit_cash":
          return "Ngân Hàng";
        case "wallet":
        case "momo":
          return "MOMO";
        default:
          return method;
      }
    },
    getStatusClass(status) {
      switch (status) {
        case "completed":
          return "success";
        case "pending":
          return "pending";
        case "failed":
          return "cancelled";
        default:
          return "";
      }
    },
    getStatusText(status) {
      switch (status) {
        case "completed":
          return "Đã thanh toán";
        case "pending":
          return "Chờ xử lý";
        case "failed":
          return "Đã hủy";
        default:
          return "Không rõ";
      }
    },
    getTypeText(type) {
      switch (type) {
        case "rental":
          return "Đơn thuê";
        case "surcharge":
          return "Phụ thu";
        default:
          return "Không rõ";
      }
    },
    async updateStatus(paymentId, newStatus) {
      try {
        const confirmText =
          newStatus === "completed"
            ? "Xác nhận thanh toán này?"
            : "Hủy thanh toán này?";
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
