<template>
  <div class="lookup-page">
    <!-- Hero Section / Title -->
    <div class="hero-header">
      <div class="header-content">
        <span class="sub-title">Tra cứu thông tin</span>
        <h1 class="title">Tra cứu phụ thu phát sinh</h1>
        <p class="description">
          Nhập mã đơn thuê xe của bạn để kiểm tra chi tiết các khoản phụ thu (nếu có) và thực hiện thanh toán trực tuyến nhanh chóng.
        </p>
      </div>

      <!-- Search Box Card -->
      <div class="search-card">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            v-model="search"
            placeholder="Nhập mã đơn thuê (VD: 12 hoặc RENT-102)..."
            @keyup.enter="filterData"
          />
          <button class="btn-search" @click="filterData" :disabled="loading">
            <span v-if="!loading">Tra cứu ngay</span>
            <span v-else class="loader"></span>
          </button>
        </div>

        <!-- Alert messages -->
        <div v-if="error" class="alert alert-error">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="main-container">
      <!-- Loading Skeleton/State -->
      <div v-if="loading" class="state-card loading-state">
        <div class="spinner"></div>
        <p>Đang tìm kiếm thông tin phụ thu của bạn...</p>
      </div>

      <!-- Results Table Card -->
      <div v-else-if="surchargeList.length" class="result-card">
        <div class="card-header">
          <h2>Kết quả tra cứu mã đơn #{{ search }}</h2>
          <span class="badge-count">{{ surchargeList.length }} khoản phụ thu</span>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Loại phụ thu</th>
                <th>Mô tả chi tiết</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th style="text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in surchargeList" :key="item.id">
                <td class="col-rental">
                  <span class="rental-badge">#{{ item.rental_id }}</span>
                </td>
                <td>
                  <span class="type-tag" :class="item.type === 'Hư hỏng' ? 'damage' : 'late'">
                    {{ item.type }}
                  </span>
                </td>
                <td class="col-desc">
                  <p class="desc-text">{{ item.description || 'Không có chi tiết' }}</p>
                </td>
                <td class="col-amount">{{ item.amount ? item.amount.toLocaleString('vi-VN') : 0 }} ₫</td>
                <td>
                  <span class="status-badge" :class="statusClass(item.status)">
                    <span class="status-dot"></span>
                    {{ translateStatus(item.status) }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <template v-if="item.status !== 'completed' && item.status !== 'canceled'">
                    <button class="btn-pay" @click="paySurcharge(item)">
                      Thanh toán
                    </button>
                  </template>
                  <span v-else class="text-done">Hoàn tất</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Information Sections (Guides & FAQs) -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-header">
            <div class="info-icon blue">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3>Hướng dẫn tra cứu</h3>
          </div>
          <ul class="guide-list">
            <li><span>1</span> Nhập chính xác mã đơn thuê xe vào ô tìm kiếm ở trên.</li>
            <li><span>2</span> Nhấn nút <strong>"Tra cứu ngay"</strong> hoặc gõ phím Enter.</li>
            <li><span>3</span> Kiểm tra khoản phụ thu (Hư hỏng, Quá giờ, Vệ sinh xe...).</li>
            <li><span>4</span> Nhấn <strong>"Thanh toán"</strong> để hoàn tất chi phí trực tuyến.</li>
          </ul>
        </div>

        <div class="info-card">
          <div class="info-header">
            <div class="info-icon orange">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3>Câu hỏi thường gặp</h3>
          </div>
          <div class="faq-list">
            <details class="faq-item">
              <summary>Làm sao để tìm mã đơn thuê của tôi?</summary>
              <p>Mã đơn thuê được gửi qua SMS/Email khi bạn xác nhận đặt xe, hoặc hiển thị trên hợp đồng bàn giao xe.</p>
            </details>
            <details class="faq-item">
              <summary>Tại sao tôi bị tính thêm phụ thu?</summary>
              <p>Phụ thu phát sinh khi trả xe trễ hạn, xe bị hư hỏng hư hao thiết bị, hoặc xe chưa được làm sạch cơ bản.</p>
            </details>
            <details class="faq-item">
              <summary>Tôi có thể khiếu nại nếu phụ thu không đúng?</summary>
              <p>Có. Vui lòng liên hệ Hotline CSKH 1900 xxxx kèm hình ảnh biên bản để được hỗ trợ xử lý ngay.</p>
            </details>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal thanh toán -->
    <PaymentModal
      v-if="showModal && selectedSurcharge"
      :show="showModal"
      type="surcharge"
      :surcharge="selectedSurcharge"
      :qrCodeValue="qrCodeValue"
      @close="showModal = false"
      @pay="handleSurchargePayment"
      @update:qrCodeValue="qrCodeValue = $event"
    />
  </div>
</template>

<script>
import axios from 'axios';
import PaymentModal from '@/components/PaymentModal.vue'; 

export default {
  name: 'SurchargeLookup',
  components: {
    PaymentModal,
  },
  data() {
    return {
      search: '',
      surchargeList: [],
      loading: false,
      error: '',
      showModal: false,
      selectedSurcharge: null,
      qrCodeValue: '',
    };
  },
  methods: {
    statusClass(status) {
      return {
        pending: 'status-pending',
        completed: 'status-completed',
        canceled: 'status-canceled',
      }[status] || '';
    },
    async filterData() {
      this.error = '';
      this.surchargeList = [];

      if (!this.search.trim()) {
        this.error = 'Vui lòng nhập mã đơn thuê để tiếp tục!';
        return;
      }

      this.loading = true;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/surcharges?rental_id=${this.search.trim()}`
        );

        this.surchargeList = res.data;

        if (this.surchargeList.length === 0) {
          this.error = 'Không tìm thấy khoản phụ thu nào cho mã đơn thuê này.';
        }
      } catch (err) {
        console.error('Lỗi gọi API:', err);
        this.error = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau!';
      } finally {
        this.loading = false;
      }
    },
    translateStatus(status) {
      const translations = {
        pending: 'Đang xử lý',
        completed: 'Đã hoàn thành',
        canceled: 'Đã hủy',
      };
      return translations[status] || status;
    },
    paySurcharge(item) {
      this.selectedSurcharge = item;
      this.showModal = true;
    },
    handleSurchargePayment({ method, content }) {
      alert(`Thanh toán phụ thu thành công!\nPhương thức: ${method}\nNội dung: ${content}`);
      this.showModal = false;
      this.filterData();
    },
  },
};
</script>

<style scoped>
@import "@/assets/style/SurchargeLookup.css";
</style>