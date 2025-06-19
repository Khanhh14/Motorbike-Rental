<template>
  <nav class="navbar">
    <div class="navbar-brand">Travalizer</div>
    <div class="navbar-links">
      <!-- Luôn hiển thị TRANG CHỦ và XE MÁY -->
      <router-link to="/" class="home">TRANG CHỦ</router-link>

      <div class="navbar-dropdown" @click="togglePolicyDropdown">
        <div class="dropdown-toggle policy-link">
          QUY TRÌNH THUÊ XE
          <span class="arrow-down">▼</span>
        </div>
        <div class="dropdown-menu custom-dropdown" v-show="isPolicyDropdownOpen">
          <router-link to="/policy" class="dropdown-item">QUY TRÌNH THUÊ XE</router-link>
          <router-link to="/TimeMotor" class="dropdown-item">GIÁ THUÊ XE</router-link>
        </div>
      </div>

      <router-link to="/motorbikes" class="motorbike-link">XE MÁY</router-link>
      <router-link to="/surcharge" class="motorbike-link">TRA CỨU PHỤ THU</router-link>

      <!-- Nếu chưa đăng nhập -->
      <template v-if="!isLoggedIn">
        <router-link to="/sign-up" class="sign-up">ĐĂNG KÝ</router-link>
        <router-link to="/login" class="sign-in">ĐĂNG NHẬP</router-link>
      </template>

      <!-- Nếu đã đăng nhập -->
      <template v-else>
        <div class="user-menu" @click="toggleMenu">
          <img
            src="@/assets/image/user.png"
            alt="User Icon"
            class="user-icon-image"
          />
          <div v-if="showMenu" class="dropdown-menu">
            <button @click="goToUserPage" class="dropdown-item">Thông tin người dùng</button>
            <button @click="logout" class="dropdown-item logout-button">Đăng xuất</button>
          </div>
        </div>
      </template>
    </div>
  </nav>
</template>

<script>
import { ref, watchEffect, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(false);
    const userName = ref("Người dùng");
    const showMenu = ref(false);
    const isPolicyDropdownOpen = ref(false);

    const updateLoginState = () => {
      const name = localStorage.getItem("name") || sessionStorage.getItem("name");
      isLoggedIn.value = !!name;
      userName.value = name || "Người dùng";
    };

    watchEffect(() => {
      updateLoginState();
    });

    const logout = () => {
      localStorage.removeItem("name");
      sessionStorage.removeItem("name");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      showMenu.value = false;
      updateLoginState();
      router.push("/");
    };

    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

    const goToUserPage = () => {
      showMenu.value = false;
      router.push("/userpage");
    };

    const togglePolicyDropdown = () => {
      isPolicyDropdownOpen.value = !isPolicyDropdownOpen.value;
    };

    // Đóng dropdown nếu click ra ngoài
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".navbar-dropdown");
      if (dropdown && !dropdown.contains(event.target)) {
        isPolicyDropdownOpen.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("click", handleClickOutside);
    });

    return {
      isLoggedIn,
      logout,
      userName,
      showMenu,
      toggleMenu,
      goToUserPage,
      isPolicyDropdownOpen,
      togglePolicyDropdown,
    };
  },
};
</script>

<style scoped>
@import "@/assets/style/NavHome.css";
</style>
