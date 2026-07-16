<template>
  <div class="motor-detail-root">
    <div v-if="!isLoading" class="motor-detail-grid">
      
      <section class="card motor-card">
        <div class="media">
          <img 
            :src="motorbikes.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=500'" 
            alt="Motorbike Image" 
            class="motor-image" 
          />
        </div>
        <div class="content">
          <div class="header-row">
            <h1 class="title">{{ motorbikes.model || 'Đang cập nhật tên xe...' }}</h1>
            <div class="badges">
              <span class="badge brand" v-if="motorbikes.brand">{{ motorbikes.brand }}</span>
              <span v-if="getVehicleTypeName(motorbikes.vehicle_type_id)" class="badge type">
                {{ getVehicleTypeName(motorbikes.vehicle_type_id) }}
              </span>
              <span class="badge year" v-if="motorbikes.year">{{ motorbikes.year }}</span>
            </div>
          </div>

          <p class="license-plate">Biển số xe: <strong>{{ motorbikes.license_plate || '-' }}</strong></p>

          <p class="description" v-if="motorbikes.description">{{ motorbikes.description }}</p>
          <p class="description muted" v-else>Chưa có mô tả cho xe này.</p>

          <div class="price-row">
            <div class="price">
              {{ motorbikes.price_per_day ? motorbikes.price_per_day.toLocaleString('vi-VN') : '0' }} 
              <span class="unit">VNĐ</span><span class="per-day">/ngày</span>
            </div>
          </div>
        </div>
      </section>

      <section class="card form-card" ref="rentalForm">
        <h2 class="form-title">Đặt thuê - Thông tin & Thanh toán</h2>
        <form @submit.prevent="submitRental" novalidate>
          
          <div class="form-group-row">
            <div class="row">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Nhận xe
              </label>
              <div class="datetime">
                <input type="date" v-model="rental.startDate" required :min="today" />
                <input type="time" v-model="rental.startTime" required />
              </div>
            </div>

            <div class="row">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M10 2H14"></path><path d="M12 14L15 11"></path><circle cx="12" cy="14" r="8"></circle></svg>
                Trả xe
              </label>
              <div class="datetime">
                <input type="date" v-model="rental.endDate" required :min="rental.startDate || today" />
                <input type="time" v-model="rental.endTime" required />
              </div>
            </div>
          </div>

          <transition name="fade">
            <div v-if="!isLoggedIn" class="guest-info">
              <h3 class="section-subtitle">Thông tin người thuê</h3>
              <div class="row-inputs">
                <div class="input-wrapper">
                  <input type="text" v-model="userInfo.name" placeholder="Họ và tên" required />
                </div>
                <div class="input-wrapper">
                  <input type="tel" v-model="userInfo.phone" placeholder="Số điện thoại" required />
                </div>
              </div>
              <div class="input-wrapper full-width">
                <input type="email" v-model="userInfo.email" placeholder="Email" required />
              </div>
            </div>
          </transition>

          <div class="summary">
            <div class="total-box">
              <span class="label">Tổng tiền thanh toán</span>
              <span class="value">
                {{ totalPrice ? totalPrice.toLocaleString('vi-VN') : '0' }} <span class="currency">VNĐ</span>
              </span>
            </div>
            <p v-if="totalPrice > 0 && totalPrice < 50000" class="warning">⚠️ Giá thuê tối thiểu là 50,000 VNĐ.</p>
            <p v-if="errorMessage" class="error">⚠️ {{ errorMessage }}</p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading || isLockedByOther">
              <template v-if="loading">Đang xử lý...</template>
              <template v-else-if="isLockedByOther">Xe đang được giữ</template>
              <template v-else>Đăng ký thuê xe ngay</template>
            </button>
            <button type="button" class="btn-muted" @click="resetForm">Đặt lại</button>
          </div>
        </form>
      </section>

      <section class="card review-card" v-if="motorbikes.id">
        <h3 class="review-title">Đánh giá & Bình luận từ khách hàng</h3>
        <ReviewSection :motorbikeId="motorbikes.id" />
      </section>
    </div>

    <div v-else class="loading-wrapper">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu xe...</p>
    </div>

    <PaymentModal
      :show="showPaymentModal"
      :rentalOrder="rentalOrder"
      :latestContentNumber="latestContentNumber"
      :qrCodeValue="qrCodeValue"
      @update:qrCodeValue="qrCodeValue = $event"
      @close="showPaymentModal = false"
      @pay="handlePaymentMethod"
    />
  </div>
</template>

<script src="./MotorDetail.js"></script>

<style scoped>
/* Biến màu sắc hiện đại & đồng bộ theo tông xanh lá của Header */
.motor-detail-root {
  --primary-color: #0f766e; /* Xanh lá đậm thương hiệu (Teal) */
  --primary-hover: #0d5c56;
  --secondary-color: #10b981; /* Xanh ngọc lục bảo */
  --bg-gradient: #f8fafc;
  --card-bg: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --danger-color: #ef4444;
  --shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08);
  
  /* Đảm bảo khoảng đệm an toàn tự nhiên tránh bị header che */
  padding: 110px 24px 48px; 
  background: radial-gradient(100% 100% at top, #f0fdf4 0%, var(--bg-gradient) 60%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
}

/* Layout chia 2 cột */
.motor-detail-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 24px;
  align-items: start;
  max-width: 1300px;
  margin: 0 auto;
}

/* Thiết kế Card */
.card {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: var(--shadow-sm);
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Card Thông tin xe */
.motor-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 1200px) {
  .motor-card {
    flex-direction: row;
  }
}

.media {
  flex: 0 0 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.motor-image {
  width: 100%;
  height: 230px;
  object-fit: contain;
  transition: transform 0.5s ease;
}
.card:hover .motor-image {
  transform: scale(1.05);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  line-height: 1.25;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
}
.badge.brand { background-color: #fef3c7; color: #b45309; }
.badge.type { background-color: #d1fae5; color: #065f46; }
.badge.year { background-color: #e0f2fe; color: #0369a1; }

.license-plate {
  color: var(--text-muted);
  font-size: 15px;
  margin: 0 0 10px 0;
}

.description {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}
.description.muted {
  font-style: italic;
  color: var(--text-muted);
}

.price-row {
  border-top: 1px solid var(--border-color);
  padding-top: 14px;
  margin-top: auto;
}

.price {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary-color);
}
.price .unit {
  font-size: 18px;
  margin-left: 4px;
}
.price .per-day {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 6px;
}

/* Card Đặt xe */
.form-title {
  margin: 0 0 18px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}

.form-group-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

@media (min-width: 576px) {
  .form-group-row {
    grid-template-columns: 1fr 1fr;
  }
}

.row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}

label .icon {
  color: var(--primary-color);
}

.datetime {
  display: flex;
  gap: 8px;
}

.datetime input[type="date"] {
  flex: 1.3;
}

.datetime input[type="time"] {
  flex: 1;
}

/* Inputs styling */
input[type="date"], 
input[type="time"], 
input[type="text"], 
input[type="email"], 
input[type="tel"] {
  width: 100%;
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: #f8fafc;
  outline: none;
  font-size: 14px;
  color: var(--text-main);
  box-sizing: border-box;
  transition: all 0.2s ease;
}

input:focus {
  border-color: var(--primary-color);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
}

/* Thông tin khách thuê */
.guest-info {
  border-top: 1px solid var(--border-color);
  margin-top: 16px;
  padding-top: 16px;
}

.section-subtitle {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 12px 0;
}

.row-inputs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

@media (min-width: 576px) {
  .row-inputs {
    grid-template-columns: 1fr 1fr;
  }
}

.input-wrapper.full-width {
  margin-bottom: 12px;
}

/* Tổng tiền */
.summary {
  background: #f0fdf4;
  border: 1px dashed var(--secondary-color);
  border-radius: 10px;
  padding: 14px;
  margin-top: 18px;
}

.total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-box .label {
  font-weight: 600;
  color: #3f4e4f;
}

.total-box .value {
  font-size: 20px;
  font-weight: 800;
  color: #065f46;
}

.total-box .currency {
  font-size: 14px;
}

.warning, .error {
  margin: 8px 0 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--danger-color);
}

/* Nút bấm hành động */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

button {
  border: 0;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

button.btn-primary {
  flex: 2;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
}

button.btn-primary:hover:not([disabled]) {
  filter: brightness(1.05);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(15, 118, 110, 0.3);
}

button.btn-primary[disabled] {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

button.btn-muted {
  flex: 1;
  background: #f1f5f9;
  color: #475569;
}

button.btn-muted:hover {
  background: #e2e8f0;
}

/* Đánh giá rộng full */
.review-card {
  grid-column: 1 / -1;
  margin-top: 12px;
}

.review-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  border-left: 4px solid var(--primary-color);
  padding-left: 10px;
}

/* Loading Wrapper */
.loading-wrapper {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 991px) {
  .motor-detail-root {
    padding-top: 88px; /* Giảm padding cho mobile gọn gàng */
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .motor-detail-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .media {
    flex-basis: 100%;
  }
  
  .motor-image {
    height: 180px;
  }
}

/* Hiệu ứng mượt */
.fade-enter-active, .fade-leave-active { 
  transition: all 0.3s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0;
  transform: translateY(-10px);
}
</style>