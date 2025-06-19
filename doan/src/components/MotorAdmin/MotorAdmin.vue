<template>
  <div class="motorbike-table">
    <h2>Danh sách xe máy</h2>

    <div class="actions">
      <div class="search-filter-group">
        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm..." @input="filterMotorbikes" />
        <select v-model="selectedStatus" @change="filterMotorbikes">
          <option value="">Tất cả</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <button @click="addMotorbike">Thêm xe</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Hãng</th>
          <th>Model</th>
          <th>Loại xe</th>
          <th>Mô tả</th>
          <th>Năm</th>
          <th>Biển số</th>
          <th>Giá thuê/ngày</th>
          <th>Trạng thái</th>
          <th>Hình ảnh</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bike in paginatedMotorbikes" :key="bike.id">
          <td>{{ bike.id }}</td>
          <td>{{ bike.brand }}</td>
          <td>{{ bike.model }}</td>
          <td>{{ getVehicleTypeLabel(bike.vehicle_type_id) }}</td>
          <td>{{ shortDescription(bike.description) }}</td>
          <td>{{ bike.year }}</td>
          <td>{{ bike.license_plate }}</td>
          <td>{{ bike.price_per_day.toLocaleString() }}đ</td>
          <td :class="getStatusClass(bike.status)">{{ bike.status }}</td>
          <td>
            <img :src="bike.image_url" alt="Hình ảnh xe" class="bike-image" v-if="bike.image_url" />
            <span v-else>Không có ảnh</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="edit-button" @click="openEditModal(bike)">Sửa</button>
              <button class="delete-button" @click="deleteBike(bike.id)">Xóa</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal thêm xe -->
<div v-if="showAddModal" class="modal">
  <div class="modal-content">
    <span class="close-modal" @click="closeAddModal">&times;</span>
    <h3>Thêm xe mới</h3>
    <div class="modal-body">
      <div class="modal-left">
        <label>Hãng:</label>
        <input type="text" v-model="newBike.brand" required />
        <label>Model:</label>
        <input type="text" v-model="newBike.model" required />
        <label>Loại xe:</label>
        <select v-model="newBike.vehicle_type_id" required>
          <option disabled value="">-- Chọn loại xe --</option>
          <option v-for="type in vehicleTypes" :key="type.id" :value="type.id">
            {{ type.name }} ({{ type.quantity }})
          </option>
        </select>
        <label>Mô tả:</label>
        <textarea v-model="newBike.description" required></textarea>
        <label>Năm:</label>
        <input type="text" v-model="newBike.year" required />
      </div>
      <div class="modal-right">
        <label>Biển số:</label>
        <input type="text" v-model="newBike.license_plate" required />
        <label>Giá thuê/ngày:</label>
        <input type="text" v-model="newBike.price_per_day" required />
        <label>Trạng thái:</label>
        <select v-model="newBike.status" required>
          <option value="available">Có sẵn</option>
          <option value="rented">Đã thuê</option>
          <option value="maintenance">Bảo trì</option>
        </select>
        <label>Hình ảnh:</label>
        <input type="file" @change="handleImageUpload" accept="image/*" required />
      </div>
    </div>
    <div class="modal-buttons">
      <button @click="saveNewBike">Lưu</button>
      <button @click="closeAddModal">Hủy</button>
    </div>
  </div>
</div>

    <!-- Modal chỉnh sửa xe -->
<div v-if="showEditModal" class="modal">
  <div class="modal-content">
    <span class="close-modal" @click="closeEditModal">&times;</span>
    <h3>Chỉnh sửa xe</h3>
    <label>Hãng:</label>
    <input type="text" v-model="selectedBike.brand" />
    <label>Model:</label>
    <input type="text" v-model="selectedBike.model" />
    <label>Loại xe:</label>
    <select v-model="selectedBike.vehicle_type_id">
      <option disabled value="">-- Chọn loại xe --</option>
      <option v-for="type in vehicleTypes" :key="type.id" :value="type.id">
        {{ type.name }} ({{ type.quantity }})
      </option>
    </select>
    <label>Mô tả:</label>
    <textarea v-model="selectedBike.description"></textarea>
    <label>Năm:</label>
    <input type="number" v-model="selectedBike.year" />
    <label>Biển số:</label>
    <input type="text" v-model="selectedBike.license_plate" />
    <label>Giá thuê/ngày:</label>
    <input type="text" v-model="selectedBike.price_per_day" />
    <label>Hình ảnh:</label>
    <input type="file" @change="handleEditImageUpload" accept="image/*" />
    <div class="modal-buttons">
      <button @click="saveEdit">Lưu</button>
      <button @click="closeEditModal">Hủy</button>
    </div>
  </div>
</div>

    <!-- Phân Trang -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">❮</button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="nextPage">❯</button>
    </div>
  </div>
</template>


<script src="./MotorAdmin.js"></script>

<style scoped>
@import "@/assets/style/MotoAdmin.css";
</style>