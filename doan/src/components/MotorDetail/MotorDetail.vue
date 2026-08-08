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

          <!-- PHẦN MÃ GIẢM GIÁ (ẨN/HIỆN THEO BẤM) -->
          <div class="coupon-section">
            <div class="coupon-header">
              <h3 class="section-subtitle">Mã giảm giá</h3>
              <button 
                type="button" 
                class="btn-toggle-coupons" 
                @click="showCouponList = !showCouponList"
              >
                {{ showCouponList ? 'Ẩn danh sách mã ▲' : 'Xem mã giảm giá ▼' }}
              </button>
            </div>
            
            <transition name="fade">
              <div v-if="showCouponList" class="coupon-list-wrapper">
                <div v-if="availableCoupons.length > 0" class="coupon-list">
                  <div 
                    v-for="c in availableCoupons" 
                    :key="c.id" 
                    :class="['coupon-card', { active: appliedCoupon && appliedCoupon.code === c.code }]"
                    @click="selectCoupon(c)"
                  >
                    <div class="coupon-code">{{ c.code }}</div>
                    <div class="coupon-desc">
                      Giảm {{ (c.discount_type === 'percentage' || c.discount_type === 'percent') ? c.discount_value + '%' : Number(c.discount_value).toLocaleString('vi-VN') + ' VNĐ' }}
                      <span v-if="c.min_order_value > 0">(Đơn từ {{ Number(c.min_order_value).toLocaleString('vi-VN') }}đ)</span>
                    </div>
                  </div>
                </div>
                <p v-else class="text-muted font-small">Không có mã giảm giá nào khả dụng.</p>
              </div>
            </transition>

            <div class="coupon-input-group" style="margin-top: 10px;">
              <input 
                type="text" 
                v-model="couponCode" 
                placeholder="Nhập hoặc chọn mã giảm giá..." 
                :disabled="appliedCoupon !== null"
              />
              <button 
                type="button" 
                class="btn-apply-coupon" 
                @click="appliedCoupon ? removeCoupon() : applyCoupon()"
              >
                {{ appliedCoupon ? 'Hủy' : 'Áp dụng' }}
              </button>
            </div>
            <p v-if="couponMessage" :class="['coupon-msg', isCouponApplied ? 'success' : 'error']">
              {{ couponMessage }}
            </p>
          </div>

          <!-- Phương thức thanh toán -->
          <div class="payment-method-section">
            <h3 class="section-subtitle">Hình thức thanh toán</h3>
            <div class="payment-options">
              <label class="radio-option">
                <input type="radio" v-model="paymentMethod" value="transfer" name="paymentMethod" />
                <span class="radio-label">Chuyển khoản QR</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="paymentMethod" value="cash" name="paymentMethod" />
                <span class="radio-label">Tiền mặt khi nhận xe</span>
              </label>
            </div>
          </div>

          <!-- Tóm tắt chi phí -->
          <div class="summary">
            <div class="summary-line" v-if="appliedCoupon">
              <span>Tạm tính:</span>
              <span>{{ subtotalPrice.toLocaleString('vi-VN') }} VNĐ</span>
            </div>
            <div class="summary-line discount" v-if="appliedCoupon">
              <span>Giảm giá:</span>
              <span>-{{ discountAmount.toLocaleString('vi-VN') }} VNĐ</span>
            </div>
            <div class="total-box">
              <span class="label">Tổng tiền thanh toán</span>
              <span class="value">
                {{ finalTotalPrice ? finalTotalPrice.toLocaleString('vi-VN') : '0' }} <span class="currency">VNĐ</span>
              </span>
            </div>
            <p v-if="finalTotalPrice > 0 && finalTotalPrice < 50000" class="warning">⚠️ Giá thuê tối thiểu là 50,000 VNĐ.</p>
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

<script>
import MotorDetailScript from "./MotorDetail.js";
import { useToast } from "vue-toastification";
import { ref, computed, onMounted } from "vue";
import axios from "axios";

export default {
  ...MotorDetailScript,
  setup() {
    const toast = useToast();
    const scriptSetup = MotorDetailScript.setup ? MotorDetailScript.setup() : {};

    const paymentMethod = ref("transfer");
    const couponCode = ref("");
    const appliedCoupon = ref(null);
    const couponMessage = ref("");
    const isCouponApplied = ref(false);
    const availableCoupons = ref([]);
    const showCouponList = ref(false); // Mặc định ẩn danh sách mã

    // Lấy danh sách mã giảm giá từ backend
    const fetchAvailableCoupons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/coupons");
        if (Array.isArray(res.data)) {
          const now = new Date();
          availableCoupons.value = res.data.filter((c) => {
            const startDate = c.start_date ? new Date(c.start_date) : null;
            if (startDate) startDate.setHours(0, 0, 0, 0);

            const endDate = c.end_date ? new Date(c.end_date) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);

            const isStarted = !startDate || startDate <= now;
            const isNotExpired = !endDate || endDate >= now;
            const hasUsageLimit = c.usage_limit === null || c.used_count < c.usage_limit;

            return Boolean(c.is_active) && isStarted && isNotExpired && hasUsageLimit;
          });
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách mã giảm giá:", error);
      }
    };

    onMounted(() => {
      fetchAvailableCoupons();
    });

    const subtotalPrice = computed(() => {
      return scriptSetup.totalPrice ? scriptSetup.totalPrice.value || scriptSetup.totalPrice : 0;
    });

    const discountAmount = computed(() => {
      if (!appliedCoupon.value) return 0;
      return appliedCoupon.value.discount_amount || 0;
    });

    const finalTotalPrice = computed(() => {
      if (appliedCoupon.value && appliedCoupon.value.final_amount !== undefined) {
        return appliedCoupon.value.final_amount;
      }
      return Math.max(0, subtotalPrice.value - discountAmount.value);
    });

    const selectCoupon = (coupon) => {
      if (appliedCoupon.value && appliedCoupon.value.code === coupon.code) {
        removeCoupon();
        return;
      }
      couponCode.value = coupon.code;
      applyCoupon(coupon.code);
    };

    const applyCoupon = async (codeOverride = null) => {
      const codeToApply = codeOverride || couponCode.value.trim();

      if (!codeToApply) {
        couponMessage.value = "Vui lòng nhập hoặc chọn mã giảm giá.";
        isCouponApplied.value = false;
        return;
      }

      if (subtotalPrice.value <= 0) {
        couponMessage.value = "Vui lòng chọn thời gian thuê xe trước khi áp dụng mã.";
        isCouponApplied.value = false;
        return;
      }

      try {
        const response = await axios.post("http://localhost:5000/api/coupons/apply", {
          code: codeToApply,
          order_amount: subtotalPrice.value,
        });

        appliedCoupon.value = response.data;
        couponCode.value = response.data.code;
        isCouponApplied.value = true;
        couponMessage.value = response.data.message || "Áp dụng mã giảm giá thành công!";
        toast.success("Áp dụng mã giảm giá thành công!");
      } catch (error) {
        appliedCoupon.value = null;
        isCouponApplied.value = false;
        couponMessage.value = error.response?.data?.message || "Mã giảm giá không hợp lệ hoặc không đủ điều kiện.";
      }
    };

    const removeCoupon = () => {
      appliedCoupon.value = null;
      couponCode.value = "";
      couponMessage.value = "";
      isCouponApplied.value = false;
    };

    return {
      ...scriptSetup,
      toast,
      paymentMethod,
      couponCode,
      appliedCoupon,
      couponMessage,
      isCouponApplied,
      availableCoupons,
      showCouponList,
      subtotalPrice,
      discountAmount,
      finalTotalPrice,
      selectCoupon,
      applyCoupon,
      removeCoupon
    };
  }
};
</script>

<style scoped>
@import "@/assets/style/MotorDetail.css";
@import "@/assets/style/Toast.css";


</style>