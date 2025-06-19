<template>
  <!-- Hero section -->
  <div class="hero-section">
    <div class="hero-overlay">
      <h1>THUÊ XE MÁY UY TÍN TẠI PHÚ YÊN</h1>
      <p>Đa dạng các loại xe, giá cả hợp lý, thủ tục đơn giản</p>
    </div>
  </div>

  <!-- Danh mục loại xe -->
  <div class="categories">
    <div class="category-card">
      <h3>Xe Số</h3>
      <p>Phù hợp cho di chuyển hằng ngày</p>
      <button class="category-btn" @click="filterByType('xe số')">Xem thêm</button>
    </div>
    <div class="category-card">
      <h3>Xe Ga</h3>
      <p>Tiện lợi và thoải mái</p>
      <button class="category-btn" @click="filterByType('tay ga')">Xem thêm</button>
    </div>
    <div class="category-card">
      <h3>Xe Côn Tay</h3>
      <p>Mạnh mẽ và thể thao</p>
      <button class="category-btn" @click="filterByType('tay côn')">Xem thêm</button>
    </div>
    <div class="category-card">
      <h3>Tất cả</h3>
      <p>Xem toàn bộ xe đang có</p>
      <button class="category-btn" @click="filterByType(null)">Hiển thị tất cả</button>
    </div>
  </div>

  <!-- Tìm kiếm xe -->
  <div class="search-section">
    <input
      type="text"
      v-model="searchQuery"
      @input="onSearch"
      placeholder="Tìm kiếm theo tên xe, hãng hoặc loại xe..."
      class="search-input"
    />
  </div>

  <!-- Danh sách xe -->
  <div class="motorbike-list">
    <div v-for="bike in paginatedMotorbikes" :key="bike.id" class="motorbike-card">
      <img
        :src="bike.image_url ? bike.image_url : defaultImage"
        :alt="bike.model"
        class="motorbike-image"
      />
      <h3>{{ bike.brand }} - {{ bike.model }}</h3>
      <p>Loại xe: {{ getVehicleTypeName(bike.vehicle_type_id) }}</p>
      <p class="price">{{ formatPrice(bike.price_per_day) }}đ/ngày</p>
      <router-link :to="`/motorbikes/${bike.id}`" class="detail-button">
        Chi tiết
      </router-link>
    </div>

    <!-- Phân trang -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">&lt;</button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages">&gt;</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      motorbikes: [],
      defaultImage: "https://via.placeholder.com/220x140?text=No+Image",
      currentPage: 1,
      itemsPerPage: 15,
      selectedType: null,
      searchQuery: "",
    };
  },
  computed: {
    filteredMotorbikes() {
      return this.motorbikes.filter((bike) => {
        const notRented = bike.status !== "Rented" && bike.status !== "Maintenance";
        const matchesType = this.selectedType ? bike.vehicle_type_id === this.selectedType : true;
        const matchesSearch =
          bike.brand.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          bike.model.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          this.getVehicleTypeName(bike.vehicle_type_id).toLowerCase().includes(this.searchQuery.toLowerCase());
        return notRented && matchesType && matchesSearch;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredMotorbikes.length / this.itemsPerPage);
    },
    paginatedMotorbikes() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredMotorbikes.slice(start, end);
    },
  },
  created() {
    this.fetchMotorbikes();
    const queryType = this.$route.query.type;
    if (queryType) {
      this.filterByType(queryType);
    }
  },
  methods: {
    async fetchMotorbikes() {
      try {
        const response = await axios.get("http://localhost:5000/api/motorbikes");
        this.motorbikes = response.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe: ", error);
      }
    },
    getVehicleTypeName(id) {
      switch (id) {
        case 1:
          return "Xe số";
        case 2:
          return "Tay ga";
        case 3:
          return "Tay côn";
        default:
          return "Không xác định";
      }
    },
    filterByType(typeName) {
      const typeMap = {
        "xe số": 1,
        "tay ga": 2,
        "tay côn": 3,
      };
      this.selectedType = typeName ? typeMap[typeName.toLowerCase()] : null;
      this.currentPage = 1;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    onSearch() {
      this.currentPage = 1;
    },
    formatPrice(value) {
      if (!value) return "0";
      return new Intl.NumberFormat("vi-VN").format(value);
    },
  },
};
</script>



<style scoped>
@import "@/assets/style/MotorList.css";
</style>
