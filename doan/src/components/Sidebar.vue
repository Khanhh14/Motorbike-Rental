<template>
  <div class="sidebar">
    <div class="sidebar-brand">
      <h2>Travalizer</h2>
    </div>
    <ul class="sidebar-menu">
      <li @click="$router.push('/admin/chatadmin')">
        <font-awesome-icon :icon="['fas', 'headset']" class="menu-icon icon-support" />
        <span>Hỗ trợ khách hàng</span>
      </li>
      <li @click="$router.push('/admin/vehicle-type')">
        <font-awesome-icon :icon="['fas', 'tags']" class="menu-icon icon-type" />
        <span>Quản lý Loại Xe</span>
      </li>
      <li @click="$router.push('/admin/motorbikes')">
        <font-awesome-icon :icon="['fas', 'motorcycle']" class="menu-icon icon-motor" />
        <span>Quản Lý Xe</span>
      </li>
      <li @click="$router.push('/admin/rentals')">
        <font-awesome-icon :icon="['fas', 'key']" class="menu-icon icon-rental" />
        <span>Quản Lý Cho Thuê</span>
      </li> 
      <li @click="$router.push('/admin/coupons')">
        <font-awesome-icon :icon="['fas', 'ticket']" class="menu-icon icon-coupon" />
        <span>Quản Lý Mã Giảm Giá</span>
      </li>
      <li @click="$router.push('/admin/reviews')">
        <font-awesome-icon :icon="['fas', 'star']" class="menu-icon icon-review" />
        <span>Quản Lý Đánh Giá</span>
      </li>
      <li @click="$router.push('/admin/payments')">
        <font-awesome-icon :icon="['far', 'credit-card']" class="menu-icon icon-payment" />
        <span>Quản Lý Thanh Toán</span>
      </li>
      <li @click="$router.push('/admin/surcharges')">
        <font-awesome-icon :icon="['fas', 'receipt']" class="menu-icon icon-surcharge" />
        <span>Quản Lý Phụ Thu</span>
      </li>
      <li @click="$router.push('/admin/stats')">
        <font-awesome-icon :icon="['fas', 'chart-pie']" class="menu-icon icon-stats" />
        <span>Thống Kê</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Sidebar"
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: #2a2d3e;
  color: white;
  padding: 24px 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.sidebar-brand h2 {
  font-size: 22px;
  margin: 0 0 24px 0;
  padding-left: 12px;
  color: #ffffff;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  margin-bottom: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  color: #e2e8f0;
  transition: all 0.25s ease;
}

.sidebar-menu li:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: translateX(5px);
}

/* Định dạng Icon */
.menu-icon {
  width: 20px;
  font-size: 16px;
  margin-right: 12px;
  text-align: center;
}

/* Màu sắc từng tính năng */
.icon-support {
  color: #38bdf8; /* Xanh ngọc biển */
}

.icon-type {
  color: #a78bfa; /* Tím nhạt */
}

.icon-motor {
  color: #34d399; /* Xanh lá mint */
}

.icon-rental {
  color: #fbbf24; /* Vàng hổ phách */
}

.icon-coupon {
  color: #f87171; /* Đỏ pastel */
}

.icon-review {
  color: #facc15; /* Vàng sao */
}

.icon-payment {
  color: #60a5fa; /* Xanh dương */
}

.icon-surcharge {
  color: #fb923c; /* Cam */
}

.icon-stats {
  color: #ec4899; /* Hồng tím */
}
</style>