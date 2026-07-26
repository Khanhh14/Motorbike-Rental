<template>
  <div class="vehicle-type-manager">
    <!-- Header Page -->
    <div class="page-header">
      <div>
        <h1 class="title">Quản lý loại xe</h1>
        <p class="subtitle">Phân loại danh mục xe, số lượng và thông tin chi tiết</p>
      </div>
      <button class="btn-primary" @click="openForm">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Thêm loại xe mới
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
          <span class="stat-label">Tổng loại xe</span>
          <strong class="stat-value">{{ vehicletypes.length }}</strong>
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
          <span class="stat-label">Tổng số lượng xe</span>
          <strong class="stat-value highlight">{{ totalQuantity }}</strong>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card">
      <!-- Toolbar: Search -->
      <div class="table-toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm theo tên loại xe hoặc mô tả..." 
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">&times;</button>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 80px;">Mã loại</th>
              <th>Tên loại xe</th>
              <th style="width: 140px;">Số lượng xe</th>
              <th>Mô tả</th>
              <th style="width: 150px; text-align: center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in filteredVehicleTypes" :key="type.ID">
              <td class="col-id">#{{ type.ID }}</td>
              <td class="col-type-name">
                <span class="type-badge">{{ type.TypeName }}</span>
              </td>
              <td class="col-quantity">
                <span class="quantity-tag">{{ type.Quantity || 0 }} chiếc</span>
              </td>
              <td class="description-cell">
                <p class="description-text" :title="type.Description">{{ type.Description || 'Chưa có mô tả' }}</p>
              </td>
              <td style="text-align: center;">
                <div class="action-buttons">
                  <button class="btn-action edit" title="Chỉnh sửa" @click="editVehicleType(type)">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Sửa
                  </button>
                  <button class="btn-action delete" title="Xóa" @click="deleteType(type.ID)">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Xóa
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredVehicleTypes.length === 0">
              <td colspan="5" class="empty-cell">
                Chưa có dữ liệu loại xe nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer -->
      <div class="table-footer">
        <p class="records-count">Hiển thị {{ filteredVehicleTypes.length }} danh mục loại xe</p>
      </div>
    </div>

    <!-- Modal Form -->
    <transition name="fade">
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ form.ID ? 'Cập nhật loại xe' : 'Thêm loại xe mới' }}</h3>
            <button class="btn-close" @click="closeForm">&times;</button>
          </div>

          <form @submit.prevent="submitForm" class="modal-body">
            <div class="form-group full-width">
              <label>Tên loại xe <span class="required">*</span></label>
              <input v-model="form.TypeName" type="text" placeholder="VD: Xe tay ga, Xe số, Xe Côn tay..." required />
            </div>

            <div class="form-group full-width">
              <label>Số lượng xe <span class="required">*</span></label>
              <input v-model.number="form.Quantity" type="number" min="0" placeholder="Nhập số lượng xe khả dụng" required />
            </div>

            <div class="form-group full-width">
              <label>Mô tả chi tiết</label>
              <textarea v-model="form.Description" rows="3" placeholder="Nhập mô tả đặc điểm loại xe..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeForm">Hủy bỏ</button>
              <button type="submit" class="btn-primary">Lưu thông tin</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const vehicletypes = ref([])
const showForm = ref(false)
const searchQuery = ref('')
const form = ref({
  ID: null,
  TypeName: '',
  Quantity: 0,
  Description: '',
})

// Tính tổng số lượng xe
const totalQuantity = computed(() => {
  return vehicletypes.value.reduce((acc, cur) => acc + Number(cur.Quantity || 0), 0)
})

// Lọc danh sách theo tìm kiếm
const filteredVehicleTypes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return vehicletypes.value

  return vehicletypes.value.filter(item => {
    const typeName = (item.TypeName || '').toLowerCase()
    const desc = (item.Description || '').toLowerCase()
    return typeName.includes(query) || desc.includes(query)
  })
})

const fetchVehicleTypes = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/vehicletype')
    vehicletypes.value = res.data
  } catch (err) {
    console.error('Lỗi khi lấy danh sách loại xe:', err)
  }
}

const openForm = () => {
  showForm.value = true
  form.value = {
    ID: null,
    TypeName: '',
    Quantity: 0,
    Description: '',
  }
}

const closeForm = () => {
  showForm.value = false
}

const editVehicleType = (type) => {
  showForm.value = true
  form.value = {
    ID: type.ID,
    TypeName: type.TypeName,
    Quantity: type.Quantity,
    Description: type.Description,
  }
}

const submitForm = async () => {
  try {
    const payload = {
      typeName: form.value.TypeName,
      quantity: form.value.Quantity,
      description: form.value.Description,
    }

    if (form.value.ID) {
      await axios.put(`http://localhost:5000/api/vehicletype/${form.value.ID}`, payload)
    } else {
      await axios.post('http://localhost:5000/api/vehicletype', payload)
    }

    await fetchVehicleTypes()
    closeForm()
  } catch (err) {
    console.error('Lỗi khi gửi form:', err)
  }
}

const deleteType = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa loại xe này không?')) {
    try {
      await axios.delete(`http://localhost:5000/api/vehicletype/${id}`)
      await fetchVehicleTypes()
    } catch (err) {
      console.error('Lỗi khi xóa loại xe:', err)
    }
  }
}

onMounted(fetchVehicleTypes)
</script>

<style scoped>
@import "@/assets/style/VehicleTypeAdmin.css";
</style>