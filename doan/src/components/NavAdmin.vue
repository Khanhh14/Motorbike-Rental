<template>
  <nav class="navbar">
    <h1>Hello, Admin 👋</h1>
    <div class="nav-actions">
      <img 
        src="@/assets/image/user.png" 
        alt="User" 
        class="user-avatar" 
        @click="toggleDropdown"
      />
      <div v-if="showDropdown" class="dropdown-menu">
        <button @click="handleLogout">Đăng xuất</button>
      </div>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from "@/store/userStore";
import { useRouter } from "vue-router";

export default {
  data() {
    return {
      showDropdown: false,
    };
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    const handleLogout = () => {
      userStore.logout(); // Xóa token & trạng thái đăng nhập
      router.push("/login"); // Chuyển về trang chủ
      setTimeout(() => window.location.reload(), 100); // Reload để reset trạng thái
    };

    return { handleLogout };
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgb(238, 233, 233);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.nav-actions {
  position: relative;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 50px;
  background: white;
  border: 1px solid #f7f6f8;
  border-radius: 4px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  white-space: nowrap;
}

.dropdown-menu button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  width: 100%;
  text-align: left;
}

.dropdown-menu button:hover {
  background: #6b6666;
}
</style>
