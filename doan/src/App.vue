<script setup>
import { RouterView, useRoute } from "vue-router"
import NavHome from "@/components/NavHome.vue"
import Footer from "@/components/Footer.vue"
import ChatPopup from "@/components/ChatPopup.vue"

const route = useRoute()

// Ẩn Nav/Footer ở các route cần thiết
const hiddenNavRoutes = [
  "/login","/admin","/sign-up","/userpage","/resetpassword","/forgotpassword",
  "/changepassword","/rental-motor","/admin/vehicle-type","/admin/rentals",
  "/admin/payments","/admin/motorbikes","/admin/surcharges",
  "/admin/stats","/admin/reviews","/admin/chatadmin"
]
const hiddenFooterRoutes = [
  "/admin","/login","/sign-up","/userpage","/resetpassword","/forgotpassword",
  "/changepassword","/rental-motor","/admin/vehicle-type","/admin/rentals",
  "/admin/payments","/admin/motorbikes","/admin/surcharges",
  "/admin/stats","/admin/reviews","/admin/chatadmin"
]

// Ẩn chat ở các route admin
const hiddenChatRoutes = [
  "/admin","/admin/vehicle-type","/admin/rentals","/admin/payments",
  "/admin/motorbikes","/admin/surcharges","/admin/stats",
  "/admin/reviews","/admin/chatadmin"
]
</script>

<template>
  <div>
    <NavHome v-if="!hiddenNavRoutes.includes(route.path)" />

    <RouterView />

    <!-- Chỉ hiển thị ChatPopup nếu không nằm trong hiddenChatRoutes -->
    <ChatPopup v-if="!hiddenChatRoutes.includes(route.path)" />

    <Footer v-if="!hiddenFooterRoutes.includes(route.path)" />
  </div>
</template>
