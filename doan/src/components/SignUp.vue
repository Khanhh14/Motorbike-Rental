<template>
  <div class="signup-container">
    <!-- Hình ảnh bên trái -->
    <div class="left-panel">
      <img src="@/assets/image/van-illustration.png" alt="Travalizer Illustration" />
    </div>

    <!-- Form đăng ký bên phải -->
    <div class="right-panel">
      <h2>Travalizer</h2>

      <!-- Hiển thị thông báo thành công hoặc lỗi -->
      <p v-if="success" class="success-message">{{ message }}</p>
      <p v-if="message && !success" class="error-message">{{ message }}</p>

      <form @submit.prevent="handleSubmit">
        <!-- User -->
        <div class="form-group">
          <label for="name">Tên đăng nhập</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            placeholder="Nhập tên đăng nhập"
            required
            @input="clearValidity('name')"
          />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="Nhập email"
            required
            @input="clearValidity('email')"
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>

        <!-- Phone -->
        <div class="form-group">
          <label for="phone">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            placeholder="Nhập số điện thoại"
            required
            @input="clearValidity('phone')"
          />
          <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="form.password"
            placeholder="Nhập mật khẩu"
            required
            @input="clearValidity('password')"
          />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>

        <!-- Captcha -->
        <div class="form-group captcha-group">
  <label for="captchaInput">Nhập mã xác thực</label>

  <div class="captcha-row">
    <div class="captcha-image" v-html="captchaSvg"></div>
    <button type="button" class="btn-refresh-captcha" @click="loadCaptcha" title="Tải lại captcha">↻</button>
  </div>

  <input
    type="text"
    id="captchaInput"
    v-model="captchaInput"
    placeholder="Nhập mã captcha"
    required
    @input="clearValidity('captchaInput')"
  />
  <span v-if="errors.captchaInput" class="error">{{ errors.captchaInput }}</span>
</div>

        <!-- Nút Sign Up & Login -->
        <div class="button-group">
          <button type="submit" class="btn-primary">Đăng Ký</button>
          <button type="button" class="btn-secondary" @click="$router.push('/login')">Đăng Nhập</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      form: {
        name: "",
        email: "",
        phone: "",
        password: "",
      },
      captchaInput: "",     // Giá trị nhập captcha
      captchaSvg: "",       // Lưu ảnh captcha SVG (string)
      showPassword: false,
      message: "",
      success: false,
      errors: {}, // Lưu lỗi cụ thể cho từng input
    };
  },
  methods: {
    async loadCaptcha() {
      try {
        const response = await axios.get("http://localhost:5000/api/captcha", {
          withCredentials: true,
          headers: { "Cache-Control": "no-cache" },
        });
        this.captchaSvg = response.data;
      } catch (error) {
        console.error("Lấy captcha lỗi:", error);
      }
    },

    validateForm() {
      this.errors = {}; // Reset lỗi trước khi kiểm tra

      // Kiểm tra username
      if (!this.form.name) {
        this.errors.name = "Tên đăng nhập không được để trống!";
      }

      // Kiểm tra email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email) {
        this.errors.email = "Email không được để trống!";
      } else if (!emailRegex.test(this.form.email)) {
        this.errors.email = "Email không hợp lệ!";
      }

      // Kiểm tra số điện thoại (10 số, bắt đầu bằng 0)
      const phoneRegex = /^0\d{9}$/;
      if (!this.form.phone) {
        this.errors.phone = "Số điện thoại không được để trống!";
      } else if (!phoneRegex.test(this.form.phone)) {
        this.errors.phone = "Số điện thoại phải có 10 số và bắt đầu bằng số 0!";
      }

      // Kiểm tra password
      if (!this.form.password) {
        this.errors.password = "Mật khẩu không được để trống!";
      } else if (this.form.password.length < 6) {
        this.errors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      }

      // Kiểm tra captchaInput
      if (!this.captchaInput) {
        this.errors.captchaInput = "Vui lòng nhập mã captcha!";
      }

      return Object.keys(this.errors).length === 0; // Trả về true nếu không có lỗi
    },

    clearValidity(field) {
      // Xóa lỗi hiển thị trên input khi người dùng nhập lại
      document.getElementById(field).setCustomValidity("");
      if (this.errors[field]) {
        delete this.errors[field];
      }
    },

    async handleSubmit() {
      this.message = "";
      this.success = false;

      if (!this.validateForm()) {
        return; // Dừng lại nếu có lỗi
      }

      try {
        // Gửi thêm captchaInput trong payload
        const payload = {
          ...this.form,
          captchaInput: this.captchaInput,
        };

        const response = await axios.post("http://localhost:5000/api/auth/register", payload, {
          withCredentials: true,
        });

        // Nếu đăng ký thành công
        this.message = response.data.message;
        this.success = true;

        // Xóa dữ liệu form sau khi đăng ký thành công
        this.form = { name: "", email: "", phone: "", password: "" };
        this.captchaInput = "";
        await this.loadCaptcha(); // Tải lại captcha mới

        // Chuyển hướng sau 2 giây (tùy chọn)
        setTimeout(() => {
          this.$router.push("/login");
        }, 2000);
      } catch (error) {
        // Nếu lỗi trả về có field (bao gồm cả captchaInput)
        if (error.response && error.response.data) {
          const { field, message } = error.response.data;

          if (field && document.getElementById(field)) {
            // Gán thông báo lỗi vào input để hiển thị tooltip
            document.getElementById(field).setCustomValidity(message);
            document.getElementById(field).reportValidity();

            this.errors[field] = message;
          } else {
            this.message = message; // Lỗi chung
          }
        } else {
          this.message = "Lỗi không xác định!";
        }

        // Nếu captcha lỗi thì tải lại captcha mới
        if (error.response?.data?.field === "captchaInput") {
          await this.loadCaptcha();
          this.captchaInput = "";
        }
      }
    },
  },
  mounted() {
    this.loadCaptcha();
  },
};
</script>

<style scoped>
@import "@/assets/style/SignUp.css";
</style>
