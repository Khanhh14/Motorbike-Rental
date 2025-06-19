<template>
  <div class="admin-layout">
    <Sidebar />
    <div class="main-content">
      <Navbar /> 
      <router-view /> 
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/NavAdmin.vue";


export default {
  components: {
    Sidebar,
    Navbar,
  },
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 220px; 
}
</style>
