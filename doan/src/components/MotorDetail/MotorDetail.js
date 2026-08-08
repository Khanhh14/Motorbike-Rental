import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { defineComponent, computed, ref, onMounted, onBeforeUnmount } from "vue";
import Cookies from "js-cookie";
import ReviewSection from "@/components/ReviewSection.vue";
import PaymentModal from "@/components/PaymentModal.vue";
import { io } from "socket.io-client";

export default defineComponent({
  components: { ReviewSection, PaymentModal },
  props: {
    id: {
      type: [String, Number],
      required: false,
    },
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();

    // === SOCKET.IO ===
    const socket = io("http://localhost:5000");
    const vehicleId = ref(null);
    const isLockedByOther = ref(false);
    const isLocking = ref(false);

    // === State ===
    const isLoading = ref(true);
    const loading = ref(false);
    const errorMessage = ref("");
    const qrCodeValue = ref("");

    // State Thanh toán & Mã giảm giá
    const paymentMethod = ref("transfer"); // 'transfer' (Chuyển khoản) hoặc 'cash' (Tiền mặt)
    const couponCode = ref("");
    const appliedCoupon = ref(null); // Lưu kết quả trả về từ API Backend
    const couponMessage = ref("");
    const isCouponApplied = ref(false);
    const availableCoupons = ref([]);

    // Xe & Đơn thuê
    const motorbikes = ref({
      id: null,
      brand: "",
      model: "",
      year: "",
      license_plate: "",
      price_per_day: 0,
      image_url: "",
      vehicle_type_id: null,
      description: "",
    });

    const rental = ref({
      startDate: "",
      startTime: "07:00",
      endDate: "",
      endTime: "12:00",
      motorbike_id: null,
      total_price: 0,
    });

    const userInfo = ref({
      name: "",
      phone: "",
      email: "",
    });

    const rentalOrder = ref({ id: null, totalPrice: 0 });

    const showPaymentModal = ref(false);
    const selectedPaymentMethods = ref([]);
    const latestContentNumber = ref(1);

    // === COMPUTED ===
    const isLoggedIn = computed(() => !!userStore.token);
    const today = computed(() => new Date().toISOString().split("T")[0]);

    // Giá tạm tính ban đầu
    const subtotalPrice = computed(() => {
      if (!rental.value.startDate || !rental.value.endDate) return 0;

      const startDateTime = new Date(`${rental.value.startDate}T${rental.value.startTime}`);
      const endDateTime = new Date(`${rental.value.endDate}T${rental.value.endTime}`);
      const totalHours = (endDateTime - startDateTime) / (1000 * 60 * 60);

      if (totalHours <= 0) return 0;

      const hourlyRate = motorbikes.value.price_per_day / 24;
      const price = Math.ceil(totalHours) * hourlyRate;
      const finalPrice = price < 50000 ? 50000 : price;

      return Math.round(finalPrice / 1000) * 1000;
    });

    const totalPrice = computed(() => subtotalPrice.value);

    // Số tiền giảm giá lấy từ kết quả Backend hoặc tính nhẩm phía Client
    const discountAmount = computed(() => {
      if (!appliedCoupon.value) return 0;
      return appliedCoupon.value.discount_amount || 0;
    });

    // Tổng tiền thanh toán cuối cùng
    const finalTotalPrice = computed(() => {
      if (appliedCoupon.value && appliedCoupon.value.final_amount !== undefined) {
        return appliedCoupon.value.final_amount;
      }
      return Math.max(0, subtotalPrice.value - discountAmount.value);
    });

    // === API COUPONS (Khớp với Controller Backend) ===

    // Lấy danh sách mã giảm giá để người dùng chọn nhanh
    const fetchAvailableCoupons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/coupons");
        if (Array.isArray(res.data)) {
          const now = new Date();
          // Lọc mã hợp lệ hiển thị lên giao diện
          availableCoupons.value = res.data.filter((c) => {
            const isNotExpired = (!c.start_date || new Date(c.start_date) <= now) && 
                                 (!c.end_date || new Date(c.end_date) >= now);
            const hasUsageLeft = c.usage_limit === null || c.used_count < c.usage_limit;
            return c.is_active && isNotExpired && hasUsageLeft;
          });
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách mã giảm giá:", error);
      }
    };

    // Gọi API `applyCoupon` của Backend để kiểm tra & tính tiền
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
        const res = await axios.post("http://localhost:5000/api/coupons/apply", {
          code: codeToApply,
          order_amount: subtotalPrice.value,
        });

        // Áp dụng thành công
        appliedCoupon.value = res.data;
        couponCode.value = res.data.code;
        isCouponApplied.value = true;
        couponMessage.value = res.data.message || "Áp dụng mã giảm giá thành công!";
      } catch (error) {
        appliedCoupon.value = null;
        isCouponApplied.value = false;
        couponMessage.value = error.response?.data?.message || "Mã giảm giá không áp dụng được.";
      }
    };

    // Chọn mã từ thẻ danh sách
    const selectCoupon = (coupon) => {
      if (appliedCoupon.value && appliedCoupon.value.code === coupon.code) {
        removeCoupon();
        return;
      }
      couponCode.value = coupon.code;
      applyCoupon(coupon.code);
    };

    // Hủy mã giảm giá
    const removeCoupon = () => {
      appliedCoupon.value = null;
      couponCode.value = "";
      couponMessage.value = "";
      isCouponApplied.value = false;
    };

    // === Fetch detail xe ===
    const fetchMotorbikeDetail = async () => {
      try {
        const id = route.params.id;
        if (!id) throw new Error("Thiếu ID xe!");

        const res = await axios.get(`http://localhost:5000/api/motorbikes/${id}`);
        if (res.data && res.data.id) {
          motorbikes.value = res.data;
          rental.value.motorbike_id = res.data.id;
          vehicleId.value = res.data.id;

          socket.emit("lock_vehicle", vehicleId.value);
        } else {
          throw new Error("Xe không tồn tại!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin xe:", error);
        router.push("/");
      } finally {
        isLoading.value = false;
      }
    };

    // === SOCKET EVENTS ===
    socket.on("lock_success", (id) => {
      if (id === vehicleId.value) {
        isLockedByOther.value = false;
        errorMessage.value = "";
        isLocking.value = true;
      }
    });

    socket.on("lock_failed", (id) => {
      if (id === vehicleId.value) {
        isLockedByOther.value = true;
        errorMessage.value = "Xe này đang được giữ bởi người khác, vui lòng thử lại sau.";
        isLocking.value = false;
      }
    });

    socket.on("vehicle_locked", (id) => {
      if (id === vehicleId.value) {
        isLockedByOther.value = true;
        errorMessage.value = "Xe này đang được giữ bởi người khác, vui lòng thử lại sau.";
        isLocking.value = false;
      }
    });

    socket.on("vehicle_unlocked", (id) => {
      if (id === vehicleId.value) {
        isLockedByOther.value = false;
        errorMessage.value = "";
      }
    });

    // === Submit rental ===
    const submitRental = async () => {
      errorMessage.value = "";

      if (isLockedByOther.value) {
        errorMessage.value = "Xe đang bị giữ, không thể đặt thuê.";
        return;
      }

      if (!rental.value.startDate || !rental.value.endDate) {
        errorMessage.value = "Vui lòng chọn ngày và giờ thuê xe!";
        return;
      }

      let rentalData = {
        start_date: `${rental.value.startDate} ${rental.value.startTime}:00`,
        end_date: `${rental.value.endDate} ${rental.value.endTime}:00`,
        motorbike_id: rental.value.motorbike_id,
        subtotal_price: subtotalPrice.value,
        discount_amount: discountAmount.value,
        total_price: finalTotalPrice.value,
        coupon_id: appliedCoupon.value ? appliedCoupon.value.coupon_id : null,
        payment_method: paymentMethod.value, // 'transfer' hoặc 'cash'
      };

      if (isLoggedIn.value) {
        rentalData.user_id = userStore.user?.id;
      } else {
        if (!userInfo.value.name || !userInfo.value.phone || !userInfo.value.email) {
          errorMessage.value = "Vui lòng nhập đầy đủ thông tin cá nhân!";
          return;
        }
        rentalData = {
          ...rentalData,
          name: userInfo.value.name,
          phone: userInfo.value.phone,
          email: userInfo.value.email,
        };
      }

      loading.value = true;
      try {
        const response = await axios.post("http://localhost:5000/api/rentals", rentalData, {
          withCredentials: true,
        });

        const rentalId = response.data.rentalId;
        alert("Thuê xe thành công!");
        Cookies.remove("guest_rental");

        rentalOrder.value = { id: rentalId, totalPrice: finalTotalPrice.value };

        // Kiểm tra hình thức thanh toán
        if (paymentMethod.value === "transfer") {
          showPaymentModal.value = true;
          latestContentNumber.value += 1;
          await generateQRCode();
        } else {
          router.push("/rentals");
        }

        socket.emit("unlock_vehicle", vehicleId.value);

      } catch (error) {
        console.error("Lỗi gửi đơn thuê:", error.response?.data || error);
        errorMessage.value = error.response?.data?.error || "Lỗi thuê xe!";
      } finally {
        loading.value = false;
      }
    };

    // Tạo QR thanh toán ngân hàng
    const generateQRCode = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/qr", {
          type: "bank",
          soTaiKhoan: "1048929602",
          tenTaiKhoan: "Nguyen Thi Mai",
          soTien: finalTotalPrice.value,
          noiDung: `TTHDTX${latestContentNumber.value}`,
        });

        qrCodeValue.value = response.data.success ? response.data.qr : "";
      } catch (error) {
        console.error("Lỗi tạo mã QR:", error);
        qrCodeValue.value = "";
      }
    };

    const handlePaymentMethod = (methods) => {
      selectedPaymentMethods.value = methods;
      router.push("/rentals");
    };

    const resetForm = () => {
      rental.value = {
        startDate: "",
        startTime: "07:00",
        endDate: "",
        endTime: "12:00",
        motorbike_id: motorbikes.value.id,
        total_price: 0,
      };
      userInfo.value = {
        name: "",
        phone: "",
        email: "",
      };
      paymentMethod.value = "transfer";
      removeCoupon();
      errorMessage.value = "";
    };

    const getVehicleTypeName = (id) => {
      switch (id) {
        case 1: return "Xe số";
        case 2: return "Tay ga";
        case 3: return "Tay côn";
        default: return "Không xác định";
      }
    };

    onBeforeUnmount(() => {
      if (vehicleId.value) {
        socket.emit("unlock_vehicle", vehicleId.value);
      }
      socket.disconnect();
    });

    onMounted(() => {
      fetchMotorbikeDetail();
      fetchAvailableCoupons();
    });

    return {
      motorbikes,
      rental,
      userInfo,
      totalPrice,
      subtotalPrice,
      discountAmount,
      finalTotalPrice,
      paymentMethod,
      couponCode,
      appliedCoupon,
      couponMessage,
      isCouponApplied,
      availableCoupons,
      selectCoupon,
      applyCoupon,
      removeCoupon,
      submitRental,
      isLoggedIn,
      isLoading,
      loading,
      errorMessage,
      today,
      showPaymentModal,
      selectedPaymentMethods,
      handlePaymentMethod,
      latestContentNumber,
      qrCodeValue,
      rentalOrder,
      getVehicleTypeName,
      isLockedByOther,
      resetForm,
    };
  },
});