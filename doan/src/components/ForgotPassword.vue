<template>
    <div class="container">
      <div class="form-box">
        <h2>Quên mật khẩu?</h2>
        <p>Vui lòng nhập tên đăng nhập và email để khôi phục mật khẩu của bạn</p>
  
        <label for="username">Tên đăng nhập</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="Nhập tên đăng nhập của bạn"
        />
  
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="Nhập địa chỉ email của bạn"
        />
  
        <button class="confirm-btn" @click="handleSendResetCode">Xác nhận</button>
        <button class="cancel-btn" @click="handleCancel">Hủy</button>
  
        <router-link to="/login" class="back-link">Quay lại đăng nhập</router-link>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        username: "",
        email: "",
      };
    },
    methods: {
      async handleSendResetCode() {
        try {
          const response = await axios.post("http://localhost:5000/api/auth/forgot-password", {
            name: this.username,
            email: this.email,
          });
  
          alert(response.data.message);
          this.$router.push({
          path: "/resetpassword",
          query: { email: this.email } // truyền email sang trang reset
        }); // Chuyển sang trang nhập mã xác nhận
        } catch (error) {
          alert(
            error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại."
          );
        }
      },
      handleCancel() {
        this.username = "";
        this.email = "";
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
  }
  
  .form-box {
    background: white;
    padding: 30px 40px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
  }
  
  .form-box h2 {
    margin-bottom: 10px;
    color: #1f2937;
  }
  
  .form-box p {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    text-align: left;
    font-size: 14px;
    margin-top: 15px;
    margin-bottom: 5px;
    color: #374151;
  }
  
  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .confirm-btn {
    background-color: #2563eb;
    color: white;
    border: none;
  }
  
  .cancel-btn {
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
    margin-top: 10px;
  }
  
  .back-link {
    display: block;
    margin-top: 20px;
    font-size: 14px;
    color: #2563eb;
    text-decoration: none;
  }
  </style>
  