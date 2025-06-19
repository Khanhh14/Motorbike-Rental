<template>
  <div class="change-password-container">
    <Sidebar />
    <div class="form-box">
      <h2>Đổi Mật Khẩu</h2>
      <p class="sub-title">Vui lòng nhập thông tin bên dưới để đổi mật khẩu</p>

      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label>Mật khẩu hiện tại</label>
          <input type="password" v-model="oldPassword" placeholder="Nhập mật khẩu hiện tại" required />
        </div>

        <div class="form-group">
          <label>Mật khẩu mới</label>
          <input type="password" v-model="newPassword" placeholder="Nhập mật khẩu mới" required />
        </div>

        <div class="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <input type="password" v-model="confirmNewPassword" placeholder="Xác nhận mật khẩu mới" required />
        </div>

        <div class="btn-group">
          <button type="submit" class="btn-primary">Đổi Mật Khẩu</button>
          <button type="button" class="btn-secondary" @click="handleCancel">Hủy</button>
        </div>

        <p v-if="message" :class="{'error-message': error, 'success-message': !error}">
          {{ message }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/SideUser.vue";
import axios from "axios";

export default {
  components: { Sidebar },
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      message: "",
      error: false,
    };
  },
  methods: {
    async handleChangePassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        this.message = "Mật khẩu mới và xác nhận mật khẩu không khớp!";
        this.error = true;
        console.log("Lỗi: Mật khẩu mới và xác nhận không khớp");
        return;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("Token lấy được từ localStorage hoặc sessionStorage:", token);

      if (!token) {
        this.message = "Bạn chưa đăng nhập hoặc token không hợp lệ!";
        this.error = true;
        console.log("Lỗi: Token không tồn tại hoặc không hợp lệ");
        return;
      }

      const payload = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmNewPassword,  // <-- Thêm confirmNewPassword ở đây
      };
      console.log("Dữ liệu gửi lên API đổi mật khẩu:", payload);

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

        console.log("Phản hồi thành công từ API:", res.data);

        this.message = res.data.message;
        this.error = false;
        this.oldPassword = "";
        this.newPassword = "";
        this.confirmNewPassword = "";
      } catch (err) {
        console.log("Lỗi khi gọi API đổi mật khẩu:", err.response || err);

        this.message = err.response?.data?.message || "Có lỗi xảy ra!";
        this.error = true;
      }
    },
    handleCancel() {
      this.oldPassword = "";
      this.newPassword = "";
      this.confirmNewPassword = "";
      this.message = "";
      this.error = false;
    },
  },
};
</script>


<style scoped>
@import "@/assets/style/ChangePassword.css";
</style>
