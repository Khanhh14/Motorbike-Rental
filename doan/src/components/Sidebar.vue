<template>
  <div class="sidebar">
    <h2>Travalizer</h2>
    <ul>
      <li @click="$router.push('/admin/vehicle-type')">⚙️ Quản lý Loại Xe</li>
      <li @click="$router.push('/admin/motorbikes')">🏍️ Quản Lý Xe</li>
      <li @click="$router.push('/admin/rentals')">📅 Quản Lý Cho Thuê</li> 
      <li @click="$router.push('/admin/reviews')">👨‍🏫 Quản Lý Đánh Giá</li>
      <li @click="$router.push('/admin/payments')">💰 Quản Lý Thanh Toán</li>
      <li @click="$router.push('/admin/surcharges')">💵 Quản Lý Phụ Thu</li>
      <li @click="$router.push('/admin/stats')">📊 Thống Kê</li>
    </ul>
  </div>
</template>


<script>
import { useRouter } from 'vue-router';
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  background: #2a2d3e;
  color: white;
  padding: 20px;
}

.sidebar h2 {
  font-size: 22px;
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 12px 0;
  cursor: pointer;
  font-size: 16px;
}

.sidebar li:hover {
  background: rgba(255, 255, 255, 0.2);
  padding-left: 8px;
  transition: 0.3s;
}
</style>
