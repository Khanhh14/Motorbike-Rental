import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router"; // Import router để điều hướng sau khi đăng xuất

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async fetchUser() {
      if (!this.token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.user = res.data;
      } catch (error) {
        console.error("Lỗi xác thực, đăng xuất...");
        this.logout();
      }
    },

    async login(name, password, rememberMe = false) {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", { name, password });
        this.token = res.data.token;
        this.user = res.data.user;

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", this.token);

        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        await this.fetchUser(); // Lấy thông tin người dùng sau khi đăng nhập
      } catch (error) {
        console.error("Đăng nhập thất bại:", error);
        throw error;
      }
    },

    logout() {
      console.log("Đăng xuất, xóa token...");

      this.user = null;
      this.token = null;

      // Xóa token khỏi localStorage & sessionStorage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Xóa token khỏi Axios
      delete axios.defaults.headers.common["Authorization"];

      // Chuyển hướng về trang đăng nhập
      router.push("/login");
    },
  },
});
