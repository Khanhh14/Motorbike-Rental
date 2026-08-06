<template>
  <div class="user-profile">
    <Sidebar />

    <main class="content">
      <header class="profile-header">
        <div class="header-title">
          <h1>Hồ sơ người dùng</h1>
          <p class="subtitle">Quản lý thông tin cá nhân và lịch sử thuê xe của bạn</p>
        </div>
        <button class="btn-home" @click="dangXuat">
          <span class="icon">🏠</span> Trang Chủ
        </button>
      </header>

      <div class="profile-grid">
        <section class="user-card">
          <div class="user-avatar">
            <div class="avatar-placeholder">{{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}</div>
          </div>
          <div class="user-details">
            <h3 class="user-name">{{ user.name || 'Chưa cập nhật tên' }}</h3>
            <div class="info-item">
              <span class="info-icon">📧</span>
              <span class="info-text">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📞</span>
              <span class="info-text">{{ user.phone || 'Chưa có số điện thoại' }}</span>
            </div>
          </div>
        </section>

        <section class="stats-container">
          <div class="stat-card">
            <div class="stat-icon purple">🏍️</div>
            <div class="stat-info">
              <span class="stat-label">Đã thuê</span>
              <h4 class="stat-value">{{ rentedCars.length }} xe</h4>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon gold">⭐</div>
            <div class="stat-info">
              <span class="stat-label">Đánh giá</span>
              <h4 class="stat-value">4.8</h4>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">🎁</div>
            <div class="stat-info">
              <span class="stat-label">Điểm thưởng</span>
              <h4 class="stat-value">2,450</h4>
            </div>
          </div>
        </section>
      </div>

      <section class="recent-activity">
        <h3 class="section-title">Hoạt động gần đây</h3>
        
        <div v-if="recentRentals.length === 0" class="empty-state">
          <p>Bạn chưa có hoạt động thuê xe nào gần đây.</p>
        </div>

        <ul v-else class="activity-list">
          <li v-for="rental in recentRentals" :key="rental.id" class="activity-item">
            <div class="motor-img-wrapper">
              <img
                v-if="getRentalImage(rental)"
                :src="getRentalImage(rental)"
                :alt="`Ảnh xe ${rental.motorbike_model || rental.vehicle_name || ''}`"
                class="motorbike-img"
                loading="lazy"
                :title="getRentalImage(rental)"
              />

              <div v-else class="img-fallback">
                <div>🏍️</div>
                <div class="model-name">{{ rental.motorbike_model || 'Xe' }}</div>
              </div>
            </div>

            <div class="rental-details">
              <h4>{{ rental.motorbike_model || rental.vehicle_name || 'Xe không xác định' }}</h4>
              <div class="rental-dates">
                <span><strong>Ngày thuê:</strong> {{ dinhDangNgay(rental.start_date) }}</span>
                <span v-if="rental.end_date"><strong>Ngày trả:</strong> {{ dinhDangNgay(rental.end_date) }}</span>
              </div>
            </div>

            <div class="status-wrapper">
              <span class="status-badge" :class="statusClass(rental.status)">
                {{ statusLabel(rental.status) }}
              </span>
            </div>

          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'vue-router';
import { onMounted, reactive, ref, computed } from 'vue';
import Sidebar from '@/components/SideUser.vue';

// Khai báo Base URL Backend của bạn để load ảnh tĩnh (static files)
const BACKEND_URL = "http://localhost:5000";

export default {
  components: {
    Sidebar
  },
  setup() {
    const authStore = useUserStore();
    const router = useRouter();

    const user = reactive({
      name: "",
      email: "",
      phone: ""
    });

    const rentedCars = ref([]);

    // Lightweight wrapper to automatically add Authorization header using the store token
    const apiFetchSafe = async (url, options = {}) => {
      const token = authStore.token || localStorage.getItem('token');
      const headers = Object.assign({}, options.headers || {});
      if (token) headers.Authorization = 'Bearer ' + token;
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      return fetch(url, Object.assign({}, options, { headers }));
    };

    const fetchUserInfo = async () => {
      const token = authStore.token;
      if (!token) {
        console.warn("Không có token, chưa đăng nhập.");
        return;
      }

      try {
        const response = await apiFetchSafe(`${BACKEND_URL}/api/auth/me`);

        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          user.name = data.name;
          user.email = data.email;
          user.phone = data.phone;
        } else {
          const text = await response.text();
          console.error("Không phải JSON:", text);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    const fetchUserRentals = async () => {
      const token = authStore.token;
      if (!token) return;

      try {
        const response = await apiFetchSafe(`${BACKEND_URL}/api/rentals/user-rentals`);

        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Danh sách đơn thuê:", data);
          rentedCars.value = data;
        } else {
          console.error("Dữ liệu trả về không phải JSON");
        }
      } catch (error) {
        console.error("Lỗi khi lấy đơn thuê:", error);
      }
    };

    const dangXuat = () => {
      authStore.token = null;
      localStorage.removeItem("token");
      router.push("/");
    };

    const dinhDangNgay = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN");
    };

    const getRentalImage = (rental) => {
      const rawImage =
        rental.motorbike_image ||
        rental.vehicle_image ||
        rental.image ||
        rental.img_url ||
        rental.image_url ||
        "";

      if (!rawImage) return "";

      const value = rawImage.toString().trim();
      if (!value) return "";

      if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
      }

      const withoutLeadingSlash = value.replace(/^\/+/, "");
      if (withoutLeadingSlash.startsWith("uploads/")) {
        return `${BACKEND_URL}/${withoutLeadingSlash}`;
      }

      return `${BACKEND_URL}/uploads/${withoutLeadingSlash}`;
    };

    const statusLabel = (status) => {
      if (!status) return "Chưa có trạng thái";
      const value = status.toString().toLowerCase();
      if (value.includes("complete")) return "Hoàn thành";
      if (value.includes("pending")) return "Chờ xử lý";
      if (value.includes("confirm")) return "Đã xác nhận";
      if (value.includes("cancel")) return "Đã hủy";
      if (value.includes("progress") || value.includes("in progress")) return "Đang xử lý";
      return status;
    };

    const statusClass = (status) => {
      if (!status) return "unknown";
      const value = status.toString().toLowerCase();
      if (value.includes("complete")) return "completed";
      if (value.includes("pending")) return "pending";
      if (value.includes("confirm")) return "confirmed";
      if (value.includes("cancel")) return "cancelled";
      if (value.includes("progress") || value.includes("in progress")) return "in_progress";
      return "unknown";
    };

    const recentRentals = computed(() => {
      return rentedCars.value.slice(0, 5);
    });

    onMounted(() => {
      fetchUserInfo();
      fetchUserRentals();
    });

    return {
      user,
      rentedCars,
      recentRentals,
      dangXuat,
      dinhDangNgay,
      getRentalImage,
      statusLabel,
      statusClass
    };
  }
};
</script>

<style scoped>
@import "@/assets/style/UserPage.css";
</style>