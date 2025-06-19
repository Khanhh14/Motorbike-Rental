<template>
  <div class="motor-detail-container" v-if="!isLoading">
    <div class="motor-info">
      <img :src="motorbikes.image_url" alt="Motorbike Image" class="motor-image" />
      <div class="motor-details">
        <h2>{{ motorbikes.name }}</h2>
        <p><strong>Hãng xe:</strong> {{ motorbikes.brand }}</p>
        <p><strong>Tên xe:</strong> {{ motorbikes.model }}</p>
        <p><strong>Loại xe:</strong> {{ getVehicleTypeName(motorbikes.vehicle_type_id) }}</p>
        <p class="description"><strong>Mô tả:</strong> {{ motorbikes.description || 'Không có mô tả' }}</p> 
        <p><strong>Đời xe:</strong> {{ motorbikes.year }}</p>
        <p><strong>Giá thuê:</strong> {{ motorbikes.price_per_day.toLocaleString("vi-VN") }} VNĐ/ngày</p>
      </div>
    </div>

    <!-- Phần form giữ nguyên -->
    <div class="rental-form">
      <h3>Thuê xe</h3>
      <form @submit.prevent="submitRental">
        <label>Thời gian nhận xe:</label>
        <div class="datetime-picker">
          <input type="date" v-model="rental.startDate" required :min="today" />
          <input type="time" v-model="rental.startTime" required />
        </div>
        <label>Thời gian trả xe:</label>
        <div class="datetime-picker">
          <input type="date" v-model="rental.endDate" required :min="rental.startDate || today" />
          <input type="time" v-model="rental.endTime" required />
        </div>
        <div v-if="!isLoggedIn">
          <h3>Thông tin cá nhân</h3>
          <label>Họ và tên:</label>
          <input type="text" v-model="userInfo.name" required />
          <label>Số điện thoại:</label>
          <input type="tel" v-model="userInfo.phone" required />
          <label>Email:</label>
          <input type="email" v-model="userInfo.email" required />
        </div>

        <p><strong>Tổng tiền:</strong> {{ totalPrice.toLocaleString("vi-VN") }} VNĐ</p>
        <p v-if="totalPrice > 0 && totalPrice < 50000" class="warning-message">
          ⚠️ Giá thuê tối thiểu là 50,000 VNĐ.
        </p>

        <button type="submit" :disabled="loading || isLockedByOther">
          {{ loading ? "Đang xử lý..." : (isLockedByOther ? "Xe đang được giữ" : "Đăng ký thuê xe") }}
        </button>
      </form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <ReviewSection v-if="motorbikes.id" :motorbikeId="motorbikes.id" />
  </div>

  <p v-else>Đang tải dữ liệu...</p>

  <!-- ✅ Modal thanh toán sau khi đăng ký thuê -->
  <PaymentModal
    :show="showPaymentModal"
    :rentalOrder="rentalOrder" 
    :latestContentNumber="latestContentNumber"
    :qrCodeValue="qrCodeValue"
    @update:qrCodeValue="qrCodeValue = $event"
    @close="showPaymentModal = false"
    @pay="handlePaymentMethod"
  />
</template>



<script src="./MotorDetail.js"></script>

<style scoped>
@import "@/assets/style/MotorDetail.css";

</style>
