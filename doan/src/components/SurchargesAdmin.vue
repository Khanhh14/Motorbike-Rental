<template>
  <div class="surcharge-admin-container">
    <!-- Header Page -->
    <div class="page-header">
      <div>
        <h1 class="title">Quản lý phụ thu</h1>
        <p class="subtitle">Theo dõi và quản lý các chi phí phát sinh (Hư hỏng, Trả xe trễ...)</p>
      </div>
      <button class="btn-primary" @click="showModal = true">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Thêm phụ thu mới
      </button>
    </div>

    <!-- Thẻ thống kê nhanh -->
    <div class="stats-grid">
      <div class="stat-card orange">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Chờ xử lý</span>
          <strong class="stat-value">{{ pendingCount }}</strong>
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
          <span class="stat-label">Đã thanh toán</span>
          <strong class="stat-value">{{ completedCount }}</strong>
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
          <span class="stat-label">Đã hủy</span>
          <strong class="stat-value">{{ canceledCount }}</strong>
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
          <span class="stat-label">Tổng phụ thu phát sinh</span>
          <strong class="stat-value highlight">{{ formatCurrency(totalAmount) }}</strong>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card">
      <!-- Toolbar Filters -->
      <div class="table-toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm theo Mã đơn thuê hoặc Mô tả..." 
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">&times;</button>
        </div>

        <div class="filters-group">
          <select v-model="filterType" class="select-filter">
            <option value="">Tất cả loại phụ thu</option>
            <option value="Hư hỏng">Hư hỏng</option>
            <option value="Trả xe trễ">Trả xe trễ</option>
          </select>

          <select v-model="filterStatus" class="select-filter">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Đã thanh toán</option>
            <option value="canceled">Đã hủy</option>
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
              <th>Loại phụ thu</th>
              <th>Mô tả chi tiết</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th style="width: 150px; text-align: center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredSurcharges" :key="item.id">
              <td class="col-id">#{{ item.id }}</td>
              <td>
                <span class="rental-badge">#{{ item.rental_id || 'N/A' }}</span>
              </td>
              <td>
                <span class="type-tag" :class="getTypeClass(item.type)">
                  {{ item.type }}
                </span>
              </td>
              <td class="description-cell">
                <p class="description-text" :title="item.description">{{ item.description || 'Không có mô tả' }}</p>
              </td>
              <td class="col-amount">{{ formatCurrency(item.amount) }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(item.status)">
                  <span class="status-dot"></span>
                  {{ statusText(item.status) }}
                </span>
              </td>
              <td style="text-align: center;">
                <div v-if="item.status === 'pending'" class="action-buttons">
                  <button class="btn-action accept" title="Xác nhận" @click="confirmSurcharge(item.id)">
                    ✓ Xác nhận
                  </button>
                  <button class="btn-action reject" title="Hủy" @click="cancelSurcharge(item.id)">
                    ✕ Hủy
                  </button>
                </div>
                <span v-else class="no-action">Đã xử lý</span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredSurcharges.length === 0">
              <td colspan="7" class="empty-cell">
                Chưa có dữ liệu phụ thu nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer -->
      <div class="table-footer">
        <p class="records-count">Hiển thị {{ filteredSurcharges.length }} khoản phụ thu</p>
      </div>
    </div>

    <!-- Modal Thêm Phụ Thu -->
    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Thêm khoản phụ thu mới</h3>
            <button class="btn-close" @click="closeModal">&times;</button>
          </div>

          <form @submit.prevent="createSurcharge" class="modal-body">
            <div class="form-group">
              <label>Mã đơn thuê <span class="required">*</span></label>
              <input type="text" v-model="newSurcharge.rental_id" placeholder="Nhập ID đơn thuê (VD: 12)" required />
            </div>

            <div class="form-group">
              <label>Loại phụ thu <span class="required">*</span></label>
              <select v-model="newSurcharge.type" required>
                <option value="" disabled>-- Chọn loại phụ thu --</option>
                <option value="Hư hỏng">Hư hỏng</option>
                <option value="Trả xe trễ">Trả xe trễ</option>
              </select>
            </div>

            <div class="form-group">
              <label>Số tiền (VNĐ) <span class="required">*</span></label>
              <input type="number" v-model="newSurcharge.amount" placeholder="Nhập số tiền phát sinh" required min="0" step="1000" />
            </div>

            <div class="form-group">
              <label>Trạng thái khởi tạo <span class="required">*</span></label>
              <select v-model="newSurcharge.status" required>
                <option value="pending">Chờ xử lý</option>
                <option value="completed">Đã thanh toán</option>
                <option value="canceled">Đã hủy</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Mô tả chi tiết nguyên nhân <span class="required">*</span></label>
              <textarea v-model="newSurcharge.description" rows="3" placeholder="Nhập lý do thu phụ phí..." required></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-secondary">Hủy bỏ</button>
              <button type="submit" class="btn-primary">Lưu thông tin</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  name: "SurchargesAdmin",
  data() {
    return {
      surcharges: [],
      filterType: '',
      filterStatus: '',
      searchQuery: '',
      showModal: false,
      newSurcharge: {
        rental_id: '',
        type: '',
        description: '',
        amount: '',
        status: 'pending'
      }
    };
  },
  computed: {
    filteredSurcharges() {
      const query = this.searchQuery.trim().toLowerCase();

      return this.surcharges.filter(item => {
        const matchesType = !this.filterType || item.type === this.filterType;
        const matchesStatus = !this.filterStatus || item.status === this.filterStatus;
        
        const rentalIdMatch = String(item.rental_id || '').toLowerCase().includes(query);
        const descMatch = String(item.description || '').toLowerCase().includes(query);
        const matchesSearch = !query || rentalIdMatch || descMatch;

        return matchesType && matchesStatus && matchesSearch;
      });
    },

    pendingCount() {
      return this.surcharges.filter(s => s.status === 'pending').length;
    },

    completedCount() {
      return this.surcharges.filter(s => s.status === 'completed').length;
    },

    canceledCount() {
      return this.surcharges.filter(s => s.status === 'canceled').length;
    },

    totalAmount() {
      return this.surcharges
        .filter(s => s.status === 'completed' || s.status === 'pending')
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async fetchSurcharges() {
      try {
        const res = await axios.get('http://localhost:5000/api/surcharges');
        this.surcharges = res.data;
      } catch (error) {
        console.error('Lỗi khi lấy phụ thu:', error);
      }
    },

    async createSurcharge() {
      try {
        const res = await axios.post('http://localhost:5000/api/surcharges', this.newSurcharge);
        this.surcharges.push(res.data);
        this.toast.success('Thêm phụ thu thành công!');
        this.closeModal();
      } catch (error) {
        console.error('Lỗi khi thêm phụ thu:', error.response?.data || error);
        this.toast.error('Thêm phụ thu thất bại!');
      }
    },

    async confirmSurcharge(id) {
      if (confirm("Bạn có chắc muốn xác nhận phụ thu này đã thanh toán?")) {
        try {
          await axios.put(`http://localhost:5000/api/surcharges/${id}`, { status: 'completed' });
          const item = this.surcharges.find(s => s.id === id);
          if (item) item.status = 'completed';
          this.toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
          console.error('Lỗi khi xác nhận phụ thu:', error.response?.data || error);
          this.toast.error('Cập nhật trạng thái thất bại!');
        }
      }
    },

    async cancelSurcharge(id) {
      if (confirm("Bạn có chắc muốn hủy phụ thu này?")) {
        try {
          await axios.put(`http://localhost:5000/api/surcharges/${id}`, { status: 'canceled' });
          const item = this.surcharges.find(s => s.id === id);
          if (item) item.status = 'canceled';
          this.toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
          console.error('Lỗi khi hủy phụ thu:', error.response?.data || error);
          this.toast.error('Cập nhật trạng thái thất bại!');
        }
      }
    },

    closeModal() {
      this.showModal = false;
      this.newSurcharge = {
        rental_id: '',
        type: '',
        description: '',
        amount: '',
        status: 'pending'
      };
    },

    formatCurrency(amount) {
      if (!amount) return "0 ₫";
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },

    statusText(status) {
      switch (status) {
        case 'pending': return 'Chờ xử lý';
        case 'completed': return 'Đã thanh toán';
        case 'canceled': return 'Đã hủy';
        default: return status || 'Khác';
      }
    },

    getStatusClass(status) {
      switch (status) {
        case 'pending': return 'status-pending';
        case 'completed': return 'status-completed';
        case 'canceled': return 'status-canceled';
        default: return '';
      }
    },

    getTypeClass(type) {
      return type === 'Hư hỏng' ? 'type-damage' : 'type-late';
    }
  },
  mounted() {
    this.fetchSurcharges();
  }
};
</script>

<style scoped>
@import "@/assets/style/SurchargesAdmin.css";
@import '@/assets/style/Toast.css';
</style>