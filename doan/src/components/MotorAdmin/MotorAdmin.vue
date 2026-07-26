<template>
  <div class="motor-admin-container">
    <!-- Header Page -->
    <div class="page-header">
      <div>
        <h1 class="title">Quản lý danh sách xe máy</h1>
        <p class="subtitle">Quản lý fleet xe, biển số, giá thuê và tình trạng bảo trì</p>
      </div>
      <button class="btn-primary" @click="addMotorbike">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Thêm xe mới
      </button>
    </div>

    <!-- Thẻ thống kê nhanh -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="1" y="3" width="15" height="13" rx="2"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tổng số xe</span>
          <strong class="stat-value">{{ motorbikes.length }}</strong>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Xe có sẵn</span>
          <strong class="stat-value">{{ countByStatus('available') }}</strong>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đang cho thuê</span>
          <strong class="stat-value">{{ countByStatus('rented') }}</strong>
        </div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Đang bảo trì</span>
          <strong class="stat-value">{{ countByStatus('maintenance') }}</strong>
        </div>
      </div>
    </div>

    <!-- Card chính chứa Toolbar & Bảng -->
    <div class="card">
      <div class="table-toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm theo Model, Hãng, Biển số..." 
            @input="filterMotorbikes" 
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''; filterMotorbikes()">&times;</button>
        </div>

        <div class="filter-select-wrapper">
          <select v-model="selectedStatus" class="select-filter" @change="filterMotorbikes">
            <option value="">Tất cả trạng thái</option>
            <option value="available">Có sẵn (Available)</option>
            <option value="rented">Đang thuê (Rented)</option>
            <option value="maintenance">Bảo trì (Maintenance)</option>
          </select>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 60px;">ID</th>
              <th style="width: 90px;">Hình ảnh</th>
              <th>Mẫu xe & Hãng</th>
              <th>Loại xe</th>
              <th>Biển số</th>
              <th>Năm SX</th>
              <th>Giá thuê/ngày</th>
              <th>Trạng thái</th>
              <th style="width: 140px; text-align: center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bike in paginatedMotorbikes" :key="bike.id">
              <td class="col-id">#{{ bike.id }}</td>
              <td>
                <div class="bike-img-thumb">
                  <img :src="bike.image_url" alt="Xe" v-if="bike.image_url" />
                  <div v-else class="no-img">No Img</div>
                </div>
              </td>
              <td>
                <div class="bike-title-info">
                  <span class="bike-model">{{ bike.model }}</span>
                  <span class="bike-brand">{{ bike.brand }}</span>
                </div>
              </td>
              <td>
                <span class="type-badge">{{ getVehicleTypeLabel(bike.vehicle_type_id) }}</span>
              </td>
              <td>
                <span class="license-tag">{{ bike.license_plate }}</span>
              </td>
              <td class="col-year">{{ bike.year }}</td>
              <td class="col-price">{{ Number(bike.price_per_day || 0).toLocaleString() }} ₫</td>
              <td>
                <span class="status-badge" :class="getStatusClass(bike.status)">
                  <span class="status-dot"></span>
                  {{ formatStatusText(bike.status) }}
                </span>
              </td>
              <td style="text-align: center;">
                <div class="action-buttons">
                  <button class="btn-action edit" title="Sửa" @click="openEditModal(bike)">
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn-action delete" title="Xóa" @click="deleteBike(bike.id)">
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredMotorbikes && filteredMotorbikes.length === 0">
              <td colspan="9" class="empty-cell">
                Không tìm thấy thông tin xe phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer / Pagination -->
      <div class="table-footer">
        <p class="records-count">Hiển thị {{ paginatedMotorbikes.length }}/{{ filteredMotorbikes ? filteredMotorbikes.length : 0 }} chiếc xe</p>
        
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">‹</button>
          <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">›</button>
        </div>
      </div>
    </div>

    <!-- Modal Thêm xe mới -->
    <transition name="fade">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-card wide">
          <div class="modal-header">
            <h3>Thêm xe máy mới</h3>
            <button class="btn-close" @click="closeAddModal">&times;</button>
          </div>

          <form @submit.prevent="saveNewBike" class="modal-body-grid">
            <div class="form-column">
              <div class="form-group">
                <label>Hãng sản xuất <span class="required">*</span></label>
                <input type="text" v-model="newBike.brand" placeholder="VD: Honda, Yamaha..." required />
              </div>

              <div class="form-group">
                <label>Model xe <span class="required">*</span></label>
                <input type="text" v-model="newBike.model" placeholder="VD: Vision 2023, Exciter..." required />
              </div>

              <div class="form-group">
                <label>Loại xe <span class="required">*</span></label>
                <select v-model="newBike.vehicle_type_id" required>
                  <option disabled value="">-- Chọn loại xe --</option>
                  <option v-for="type in vehicleTypes" :key="type.id" :value="type.id">
                    {{ type.name }} (Sẵn có: {{ type.quantity }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Năm sản xuất <span class="required">*</span></label>
                <input type="text" v-model="newBike.year" placeholder="VD: 2022" required />
              </div>

              <div class="form-group">
                <label>Mô tả chi tiết</label>
                <textarea v-model="newBike.description" rows="3" placeholder="Nhập tình trạng xe, tính năng..."></textarea>
              </div>
            </div>

            <div class="form-column">
              <div class="form-group">
                <label>Biển số xe <span class="required">*</span></label>
                <input type="text" v-model="newBike.license_plate" placeholder="VD: 78-F1 123.45" required />
              </div>

              <div class="form-group">
                <label>Giá thuê / ngày (VNĐ) <span class="required">*</span></label>
                <input type="text" v-model="newBike.price_per_day" placeholder="VD: 150000" required />
              </div>

              <div class="form-group">
                <label>Trạng thái ban đầu <span class="required">*</span></label>
                <select v-model="newBike.status" required>
                  <option value="available">Có sẵn (Available)</option>
                  <option value="rented">Đã thuê (Rented)</option>
                  <option value="maintenance">Bảo trì (Maintenance)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Hình ảnh xe <span class="required">*</span></label>
                <input type="file" @change="handleImageUpload" accept="image/*" class="file-input" required />
              </div>
            </div>

            <div class="modal-actions full-width">
              <button type="button" class="btn-secondary" @click="closeAddModal">Hủy bỏ</button>
              <button type="submit" class="btn-primary">Lưu xe mới</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal Chỉnh sửa xe -->
    <transition name="fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-card wide">
          <div class="modal-header">
            <h3>Chỉnh sửa thông tin xe #{{ selectedBike.id }}</h3>
            <button class="btn-close" @click="closeEditModal">&times;</button>
          </div>

          <form @submit.prevent="saveEdit" class="modal-body-grid">
            <div class="form-column">
              <div class="form-group">
                <label>Hãng sản xuất</label>
                <input type="text" v-model="selectedBike.brand" />
              </div>

              <div class="form-group">
                <label>Model xe</label>
                <input type="text" v-model="selectedBike.model" />
              </div>

              <div class="form-group">
                <label>Loại xe</label>
                <select v-model="selectedBike.vehicle_type_id">
                  <option disabled value="">-- Chọn loại xe --</option>
                  <option v-for="type in vehicleTypes" :key="type.id" :value="type.id">
                    {{ type.name }} (Sẵn có: {{ type.quantity }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Năm sản xuất</label>
                <input type="number" v-model="selectedBike.year" />
              </div>
            </div>

            <div class="form-column">
              <div class="form-group">
                <label>Biển số xe</label>
                <input type="text" v-model="selectedBike.license_plate" />
              </div>

              <div class="form-group">
                <label>Giá thuê / ngày (VNĐ)</label>
                <input type="text" v-model="selectedBike.price_per_day" />
              </div>

              <div class="form-group">
                <label>Cập nhật hình ảnh</label>
                <input type="file" @change="handleEditImageUpload" accept="image/*" class="file-input" />
              </div>

              <div class="form-group">
                <label>Mô tả</label>
                <textarea v-model="selectedBike.description" rows="2"></textarea>
              </div>
            </div>

            <div class="modal-actions full-width">
              <button type="button" class="btn-secondary" @click="closeEditModal">Hủy bỏ</button>
              <button type="submit" class="btn-primary">Cập nhật</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import MotorAdminJS from './MotorAdmin.js';

export default {
  name: 'MotorAdmin',
  mixins: [MotorAdminJS],
  methods: {
    countByStatus(status) {
      if (!this.motorbikes) return 0;
      return this.motorbikes.filter(b => b.status === status).length;
    },
    formatStatusText(status) {
      switch (status) {
        case 'available': return 'Có sẵn';
        case 'rented': return 'Đang thuê';
        case 'maintenance': return 'Bảo trì';
        default: return status || 'N/A';
      }
    }
  }
};
</script>

<style scoped>
@import "@/assets/style/MotoAdmin.css";
</style>