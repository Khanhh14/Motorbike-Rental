<template>
  <div class="change-password-container">
    <Sidebar />
    <div class="form-wrapper">
      <div class="form-box">
        <div class="form-header">
          <h2>Đổi Mật Khẩu</h2>
          <p class="sub-title">Vui lòng nhập đầy đủ thông tin bên dưới để bảo mật tài khoản</p>
        </div>

        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label>Mật khẩu hiện tại</label>
            <input 
              type="password" 
              v-model="oldPassword" 
              placeholder="Nhập mật khẩu hiện tại" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input 
              type="password" 
              v-model="newPassword" 
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input 
              type="password" 
              v-model="confirmNewPassword" 
              placeholder="Xác nhận lại mật khẩu mới" 
              required 
            />
          </div>

          <div class="btn-group">
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? "Đang xử lý..." : "Đổi Mật Khẩu" }}
            </button>
            <button type="button" class="btn-secondary" @click="handleCancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/SideUser.vue";
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  name: "ChangePassword",
  components: { Sidebar },
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      loading: false,
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async handleChangePassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        this.toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
        return;
      }

      if (this.newPassword.length < 6) {
        this.toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
        return;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        this.toast.error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        return;
      }

      this.loading = true;

      const payload = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmNewPassword,
      };

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/change-password",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.toast.success(res.data.message || "Cập nhật mật khẩu thành công!");
        this.handleCancel();
      } catch (err) {
        console.error("Lỗi khi đổi mật khẩu:", err.response || err);
        const errorMsg = err.response?.data?.message || "Đổi mật khẩu thất bại, vui lòng thử lại!";
        this.toast.error(errorMsg);
      } finally {
        this.loading = false;
      }
    },
    handleCancel() {
      this.oldPassword = "";
      this.newPassword = "";
      this.confirmNewPassword = "";
    },
  },
};
</script>

<style scoped>
@import "@/assets/style/ChangePassword.css";
@import "@/assets/style/Toast.css";

</style>