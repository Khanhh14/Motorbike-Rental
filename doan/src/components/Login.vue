<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-form-area">
        <div class="brand-title">
          <h2>Travalizer</h2>
        </div>
        <h3 class="welcome-title">Chào mừng bạn đến với dịch vụ cho thuê xe máy</h3>
        <p class="welcome-subtitle">Welcome Back, Please login to your account</p>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Tên Đăng Nhập</label>
            <input id="username" type="text" v-model="name" placeholder="Nhập tên đăng nhập" required />
          </div>

          <div class="form-group">
            <label for="password">Mật Khẩu</label>
            <input id="password" type="password" v-model="password" placeholder="Nhập mật khẩu" required />
          </div>

          <div class="options-row">
            <div class="checkbox-remember">
              <input type="checkbox" id="rememberMe" v-model="rememberMe" />
              <label for="rememberMe">Ghi Nhớ Đăng Nhập</label>
            </div>
            <router-link to="/forgotpassword" class="forgot-link">Quên Mật Khẩu?</router-link>
          </div>

          <div class="button-row">
            <button type="submit" class="login-button" :disabled="loading">
              {{ loading ? "Đang đăng nhập..." : "Đăng Nhập" }}
            </button>
            <button type="button" class="signup-button" @click="goToSignUp">Đăng Ký</button>
          </div>
        </form>

        <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>
      </div>

      <div class="illustration-area">
        <img src="@/assets/image/van-illustration.png" alt="Van illustration" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import "@/assets/style/Login.css";
import { mapActions } from "pinia";

export default {
  name: "LoginForm",
  data() {
    return {
      name: "",
      password: "",
      rememberMe: false,
      message: "",
      success: false,
      loading: false,
    };
  },
  async mounted() {
    // Đảm bảo token không bị mất sau khi refresh trang
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.message = "";

      try {
        console.log("Đang gửi request đăng nhập...");
        const response = await axios.post("http://localhost:5000/api/auth/login", {
          name: this.name,
          password: this.password,
        });

        console.log("Response từ API:", response.data);

        if (!response.data || !response.data.token || !response.data.user) {
          throw new Error("Dữ liệu phản hồi từ server không hợp lệ!");
        }

        const { token, user } = response.data;

        // Lưu token và thông tin user
        const storage = this.rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", token);
        storage.setItem("id", user.id); 
        storage.setItem("name", user.name);
        storage.setItem("email", user.email);
        storage.setItem("role", user.role);

        // Thiết lập header mặc định cho axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        this.message = "Đăng nhập thành công!";
        this.success = true;

        // Chuyển hướng theo role
        setTimeout(() => {
          this.$router.push(user.role === "admin" ? "/admin" : "/");
        }, 1500);
      } catch (error) {
        console.error("Lỗi đăng nhập:", error.response?.data || error.message);
        this.message = error.response?.data?.message || "Lỗi đăng nhập!";
        this.success = false;
      } finally {
        this.loading = false;
      }
    },
    goToSignUp() {
      this.$router.push("/sign-up");
    },
  },
};
</script>

<style scoped>
@import "@/assets/style/Login.css";
</style>
