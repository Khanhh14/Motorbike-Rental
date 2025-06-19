<script setup>
import { RouterView, useRoute } from "vue-router";
import NavHome from "@/components/NavHome.vue";
import Footer from "@/components/Footer.vue";

const route = useRoute();

// Danh sách các đường dẫn không hiển thị NavHome và Footer
const hiddenNavRoutes = ["/login", "/admin", "/sign-up","/userpage","/resetpassword","/forgotpassword", "/changepassword","/rental-motor",     "/admin/vehicle-type", "/admin/rentals","/admin/payments", "/admin/motorbikes","/admin/surcharges","/admin/stats", "/admin/reviews"];
const hiddenFooterRoutes = ["/admin","/login", "/sign-up","/userpage","/resetpassword","/forgotpassword", "/changepassword","/rental-motor",           "/admin/vehicle-type","/admin/rentals","/admin/payments", "/admin/motorbikes","/admin/surcharges","/admin/stats", "/admin/reviews"];
</script>

<template>  
  <div>
    <!-- Chỉ hiển thị NavHome nếu route.path không nằm trong danh sách hiddenNavRoutes -->
    <NavHome v-if="!hiddenNavRoutes.includes(route.path)" />
    
    <!-- Nội dung trang -->
    <RouterView />

    <!-- Chỉ hiển thị Footer nếu route.path không nằm trong danh sách hiddenFooterRoutes -->
    <Footer v-if="!hiddenFooterRoutes.includes(route.path)" />
  </div>
</template>
