<template>
  <div class="user-profile">
    <Sidebar />

    <main class="content">
      <header>
        <h1>Hồ sơ người dùng</h1>
        <button class="logout" @click="dangXuat">Trang Chủ</button>
      </header>

      <section class="user-info">
        <h3>Tên: {{ user.name }}</h3>
        <p>Email: {{ user.email }}</p>
        <p>Điện thoại: {{ user.phone }}</p>
      </section>

      <section class="stats">
        <div>
          <h4>{{ rentedCars.length }}</h4>
          <p>Số đơn thuê xe đã thuê</p>
        </div>
        <div>
          <h4>4.8</h4>
          <p>Đánh giá</p>
        </div>
        <div>
          <h4>2,450</h4>
          <p>Điểm thưởng</p>
        </div>
      </section>

      <section class="recent-activity">
        <h3>Hoạt động gần đây</h3>
        <ul>
          <li v-for="rental in recentRentals" :key="rental.id">
            <img
              v-if="rental.motorbike_image"
              :src="rental.motorbike_image"
              alt="Ảnh xe"
              class="motorbike-img"
            />
            <div>
              <h4>{{ rental.motorbike_model }}</h4>
              <p>Ngày thuê: {{ dinhDangNgay(rental.start_date) }}</p>
              <p>Trạng thái: {{ rental.status }}</p>
            </div>
            <span class="status" :class="{ completed: rental.status === 'completed' }">
              {{ rental.status === 'completed' ? 'Hoàn thành' : rental.status }}
            </span>
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


    const fetchUserInfo = async () => {
      const token = authStore.token;
      if (!token) {
        console.warn("Không có token, chưa đăng nhập.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

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
        const response = await fetch("http://localhost:5000/api/rentals/user-rentals", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log(data);  // Kiểm tra xem data có chứa trường motorbike_image không
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
      dinhDangNgay
    };
  }
};
</script>

<style scoped>
@import "@/assets/style/UserPage.css";

</style>
