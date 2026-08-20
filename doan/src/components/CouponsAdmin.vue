<template>
  <div class="coupons-admin-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="title">Quản lý mã giảm giá</h1>
        <p class="subtitle">Tạo, cập nhật và theo dõi hiệu lực các mã khuyến mãi</p>
      </div>
      <button class="btn btn-primary" @click="openModal('create')">
        + Thêm mã mới
      </button>
    </div>

    <!-- Thẻ thống kê (Stats Grid) -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tổng số mã</span>
          <strong class="stat-value">{{ totalCoupons }}</strong>
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
          <span class="stat-label">Đang hoạt động</span>
          <strong class="stat-value">{{ activeCoupons }}</strong>
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
          <span class="stat-label">Đã sử dụng</span>
          <strong class="stat-value">{{ totalUsed }} lượt</strong>
        </div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tắt / Hết hạn</span>
          <strong class="stat-value">{{ inactiveCoupons }}</strong>
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
            placeholder="Tìm theo Mã giảm giá (Code)..." 
            @input="filterCoupons"
          />
        </div>

        <div class="filter-select-wrapper">
          <select v-model="selectedStatus" class="select-filter" @change="filterCoupons">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Khóa / Tắt</option>
          </select>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 60px;">ID</th>
              <th>Mã giảm giá</th>
              <th>Loại giảm</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Lượt dùng</th>
              <th>Hạn sử dụng</th>
              <th>Trạng thái</th>
              <th style="width: 140px; text-align: center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedCoupons" :key="item.id">
              <td class="col-id">#{{ item.id }}</td>
              <td><strong class="code-badge">{{ item.code }}</strong></td>
              <td>{{ item.discount_type === 'percentage' ? 'Phần trăm (%)' : 'Cố định (VNĐ)' }}</td>
              <td class="col-amount">
                <span v-if="item.discount_type === 'percentage'">{{ item.discount_value }}%</span>
                <span v-else>{{ formatCurrency(item.discount_value) }}</span>
              </td>
              <td>{{ formatCurrency(item.min_order_value) }}</td>
              <td>{{ item.used_count || 0 }} / {{ item.usage_limit || '∞' }}</td>
              <td class="col-date">
                {{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}
              </td>
              <td>
                <span class="status-badge" :class="item.is_active ? 'status-success' : 'status-failed'">
                  {{ item.is_active ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>
              <td style="text-align: center;">
                <div class="action-buttons">
                  <button class="btn btn-edit" title="Sửa" @click="openModal('edit', item)">✎</button>
                  <button class="btn btn-cancel" title="Xóa" @click="deleteCoupon(item.id)">✕</button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredCoupons.length === 0">
              <td colspan="9" class="empty-cell">
                Chưa có mã giảm giá nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer / Pagination -->
      <div class="table-footer">
        <p class="records-count">Hiển thị {{ paginatedCoupons.length }}/{{ filteredCoupons.length }} bản ghi</p>
        
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage('prev')">‹</button>
          <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage('next')">›</button>
        </div>
      </div>
    </div>

    <!-- Modal Thêm / Sửa Coupon -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-card">
        <h2>{{ isEdit ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới' }}</h2>
        <form @submit.prevent="saveCoupon">
          <div class="form-group">
            <label>Mã giảm giá (Code):</label>
            <input v-model="formData.code" type="text" required placeholder="VD: HE2026" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Loại giảm giá:</label>
              <select v-model="formData.discount_type">
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Giá trị giảm:</label>
              <input v-model.number="formData.discount_value" type="number" step="0.01" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Giảm tối đa (VNĐ):</label>
              <input v-model.number="formData.max_discount_amount" type="number" placeholder="Bỏ trống nếu không giới hạn" />
            </div>
            <div class="form-group">
              <label>Đơn tối thiểu (VNĐ):</label>
              <input v-model.number="formData.min_order_value" type="number" />
            </div>
          </div>

          <div class="form-group">
            <label>Giới hạn số lần dùng (Bỏ trống = Không giới hạn):</label>
            <input v-model.number="formData.usage_limit" type="number" placeholder="VD: 100" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Ngày bắt đầu:</label>
              <input v-model="formData.start_date" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label>Ngày kết thúc:</label>
              <input v-model="formData.end_date" type="datetime-local" required />
            </div>
          </div>

          <div v-if="isEdit" class="form-group checkbox-group">
            <label>
              <input v-model="formData.is_active" type="checkbox" /> Trạng thái kích hoạt
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  name: "CouponsAdmin",
  data() {
    return {
      coupons: [],
      filteredCoupons: [],
      selectedStatus: "",
      searchQuery: "",
      totalCoupons: 0,
      activeCoupons: 0,
      inactiveCoupons: 0,
      totalUsed: 0,
      currentPage: 1,
      pageSize: 10,
      
      // Modal state
      showModal: false,
      isEdit: false,
      formData: {
        id: null,
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        max_discount_amount: null,
        min_order_value: 0,
        usage_limit: null,
        start_date: "",
        end_date: "",
        is_active: true
      }
    };
  },
  computed: {
    paginatedCoupons() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredCoupons.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredCoupons.length / this.pageSize) || 1;
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async fetchCoupons() {
      try {
        const response = await axios.get("http://localhost:5000/api/coupons");
        this.coupons = response.data;
        this.applyStatistics();
        this.filterCoupons();
      } catch (err) {
        console.error("Lỗi khi lấy danh sách mã giảm giá:", err);
      }
    },
    applyStatistics() {
      this.totalCoupons = this.coupons.length;
      this.activeCoupons = this.coupons.filter(c => Boolean(c.is_active)).length;
      this.inactiveCoupons = this.coupons.filter(c => !c.is_active).length;
      this.totalUsed = this.coupons.reduce((acc, c) => acc + (c.used_count || 0), 0);
    },
    filterCoupons() {
      let result = this.coupons;

      if (this.selectedStatus === "active") {
        result = result.filter(c => Boolean(c.is_active));
      } else if (this.selectedStatus === "inactive") {
        result = result.filter(c => !c.is_active);
      }

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter(c => c.code.toLowerCase().includes(query));
      }

      this.filteredCoupons = result;
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
      if (!dateStr) return "—";
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    formatDatetimeLocal(dateStr) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    openModal(mode, item = null) {
      this.isEdit = mode === 'edit';
      if (this.isEdit && item) {
        this.formData = {
          id: item.id,
          code: item.code || "",
          discount_type: item.discount_type || "percentage",
          discount_value: item.discount_value ?? 0,
          max_discount_amount: item.max_discount_amount ?? null,
          min_order_value: item.min_order_value ?? 0,
          usage_limit: item.usage_limit ?? null,
          start_date: this.formatDatetimeLocal(item.start_date),
          end_date: this.formatDatetimeLocal(item.end_date),
          is_active: Boolean(item.is_active)
        };
      } else {
        this.formData = {
          id: null,
          code: "",
          discount_type: "percentage",
          discount_value: 0,
          max_discount_amount: null,
          min_order_value: 0,
          usage_limit: null,
          start_date: "",
          end_date: "",
          is_active: true
        };
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    preparePayload() {
      return {
        code: this.formData.code.trim().toUpperCase(),
        discount_type: this.formData.discount_type,
        discount_value: Number(this.formData.discount_value) || 0,
        max_discount_amount: this.formData.max_discount_amount !== "" && this.formData.max_discount_amount !== null 
          ? Number(this.formData.max_discount_amount) 
          : null,
        min_order_value: Number(this.formData.min_order_value) || 0,
        usage_limit: this.formData.usage_limit !== "" && this.formData.usage_limit !== null 
          ? Number(this.formData.usage_limit) 
          : null,
        start_date: this.formData.start_date ? new Date(this.formData.start_date).toISOString() : null,
        end_date: this.formData.end_date ? new Date(this.formData.end_date).toISOString() : null,
        is_active: Boolean(this.formData.is_active)
      };
    },
    async saveCoupon() {
      try {
        const payload = this.preparePayload();

        if (this.isEdit) {
          await axios.put(`http://localhost:5000/api/coupons/${this.formData.id}`, payload);
          this.toast.success("Cập nhật mã giảm giá thành công!");
        } else {
          await axios.post("http://localhost:5000/api/coupons", payload);
          this.toast.success("Tạo mã giảm giá thành công!");
        }
        this.closeModal();
        await this.fetchCoupons();
      } catch (error) {
        console.error("Lỗi khi lưu mã giảm giá:", error);
        const serverMessage = error.response?.data?.message || error.response?.data?.error;
        this.toast.error(serverMessage || "Lưu mã giảm giá thất bại.");
      }
    },
    async deleteCoupon(id) {
      if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
      try {
        await axios.delete(`http://localhost:5000/api/coupons/${id}`);
        this.toast.success("Xóa mã giảm giá thành công!");
        await this.fetchCoupons();
      } catch (error) {
        console.error("Lỗi khi xóa mã giảm giá:", error);
        this.toast.error("Xóa mã giảm giá thất bại.");
      }
    }
  },
  mounted() {
    this.fetchCoupons();
  }
};
</script>

<style scoped>
@import "@/assets/style/CouponsAdmin.css";
@import '@/assets/style/Toast.css';
</style>