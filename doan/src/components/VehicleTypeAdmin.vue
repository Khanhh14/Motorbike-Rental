<template>
  <div class="vehicle-type-manager">
    <h2>Quản lý Loại Xe</h2>
    <button class="add-button" @click="openForm">+ Thêm Loại Xe Mới</button>

    <table class="vehicle-table">
      <thead>
        <tr>
          <th>Mã loại xe</th>
          <th>Tên loại xe</th>
          <th>Số lượng</th>
          <th>Mô tả</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="type in vehicletypes" :key="type.ID">
          <td>{{ type.ID }}</td>
          <td>{{ type.TypeName }}</td>
          <td>{{ type.Quantity }}</td>
          <td>{{ type.Description }}</td>
          <td>
            <button class="action-button edit-button" @click="editVehicleType(type)">Sửa</button>
            <button class="action-button delete-button" @click="deleteType(type.ID)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="form-modal">
      <div class="form-container">
        <h3>{{ form.ID ? 'Sửa loại xe' : 'Thêm loại xe' }}</h3>
        <form @submit.prevent="submitForm">
          <label>Tên loại xe:</label>
          <input v-model="form.TypeName" required />

          <label>Số lượng:</label>
          <input type="number" v-model.number="form.Quantity" required />

          <label>Mô tả:</label>
          <textarea v-model="form.Description"></textarea>

          <div class="form-actions">
            <button class="cancel-button" type="button" @click="closeForm">Hủy</button>
            <button class="save-button" type="submit">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const vehicletypes = ref([])
const showForm = ref(false)
const form = ref({
  ID: null,
  TypeName: '',
  Quantity: 0,
  Description: '',
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
