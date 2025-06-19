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
  // ... đoạn đầu y hệt như bạn gửi

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

  const motorbikes = ref({
    id: null,
    name: "",
    brand: "",
    model: "",
    year: "",
    license_plate: "",
    price_per_day: 0,
    image_url: "",
    vehicle_type_id: null,
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

  // **THÊM ĐOẠN KHAI BÁO CÁC BIẾN SAU**
  const showPaymentModal = ref(false);
  const selectedPaymentMethods = ref([]);
  const latestContentNumber = ref(1);

  // === COMPUTED ===
  const isLoggedIn = computed(() => !!userStore.token);
  const today = computed(() => new Date().toISOString().split("T")[0]);

  const totalPrice = computed(() => {
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
      total_price: totalPrice.value,
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

      showPaymentModal.value = true;
      latestContentNumber.value += 1;

      rentalOrder.value = { id: rentalId, totalPrice: totalPrice.value };

      generateQRCode();

      socket.emit("unlock_vehicle", vehicleId.value);

    } catch (error) {
      console.error("Lỗi gửi đơn thuê:", error.response?.data || error);
      errorMessage.value = error.response?.data?.error || "Lỗi thuê xe!";
    } finally {
      loading.value = false;
    }
  };

  const generateQRCode = async () => {
    try {
      const { totalPrice } = rental.value;

      const response = await axios.post("http://localhost:5000/api/qr", {
        type: "bank",
        soTaiKhoan: "1048929602",
        tenTaiKhoan: "Nguyen Thi Mai",
        soTien: totalPrice,
        noiDung: `TTHDTX${latestContentNumber.value}`,
      });

      qrCodeValue.value = response.data.success ? response.data.qr : '';
    } catch (error) {
      console.error("Lỗi tạo mã QR:", error);
      qrCodeValue.value = '';
    }
  };

  const handlePaymentMethod = (methods) => {
    selectedPaymentMethods.value = methods;
    console.log("Phương thức thanh toán đã chọn:", methods);
    router.push("/rentals");
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

  onMounted(fetchMotorbikeDetail);

  return {
    motorbikes,
    rental,
    userInfo,
    totalPrice,
    submitRental,
    isLoggedIn,
    isLoading,
    loading,
    errorMessage,
    today,
    showPaymentModal,         // phải trả về biến này để template nhận
    selectedPaymentMethods,
    handlePaymentMethod,
    latestContentNumber,
    qrCodeValue,
    rentalOrder,
    getVehicleTypeName,
    isLockedByOther,
  };
},
});
