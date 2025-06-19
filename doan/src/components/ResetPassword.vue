<template>
  <div class="container">
    <div class="form-box">
      <h2>Đặt Lại Mật Khẩu</h2>
      <p>Vui lòng nhập mã xác nhận và mật khẩu mới của bạn</p>

      <label for="code">Mã xác nhận</label>
      <input v-model="code" type="text" id="code" placeholder="Nhập mã xác nhận" />

      <label for="password">Mật khẩu mới</label>
      <input v-model="password" type="password" id="password" placeholder="Nhập mật khẩu mới" />

      <label for="confirmPassword">Xác nhận mật khẩu mới</label>
      <input v-model="confirmPassword" type="password" id="confirmPassword" placeholder="Xác nhận mật khẩu mới" />

      <button @click="resetPassword" :disabled="loading">
        {{ loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu" }}
      </button>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>

      <router-link to="/login" class="back-link">← Quay lại đăng nhập</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const email = ref("");
const code = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMsg = ref("");
const successMsg = ref("");
const loading = ref(false);

onMounted(() => {
  email.value = route.query.email || "";
});

const resetPassword = async () => {
  errorMsg.value = "";
  successMsg.value = "";

  if (!code.value || !password.value || !confirmPassword.value) {
    errorMsg.value = "Vui lòng nhập đầy đủ thông tin.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = "Mật khẩu xác nhận không khớp.";
    return;
  }

  try {
    loading.value = true;

    await axios.post("http://localhost:5000/api/auth/reset-password", {
      email: email.value,
      code: code.value,
      newPassword: password.value,
    });

    successMsg.value = "Đặt lại mật khẩu thành công! Chuyển hướng...";
    setTimeout(() => router.push("/login"), 2000);
  } catch (error) {
    errorMsg.value = error.response?.data?.message || "Lỗi khi đặt lại mật khẩu.";
  } finally {
    loading.value = false;
  }
};
</script>
  
<style scoped>
.container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.form-box {
  width: 100%;
  max-width: 400px;
  border: 1px solid #ccc;
  padding: 2rem;
  border-radius: 10px;
}
input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0 1rem;
}
button {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
}
.error {
  color: red;
  margin-top: 1rem;
}
.success {
  color: green;
  margin-top: 1rem;
}
.back-link {
  display: block;
  text-align: center;
  margin-top: 1rem;
}
</style>
  