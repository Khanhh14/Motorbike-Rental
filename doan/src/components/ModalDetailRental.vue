<template>
  <div v-if="rental" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h3>Chi tiết đơn thuê xe</h3>
        <button class="btn-close-icon" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="modal-img-container">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Ảnh xe"
            class="modal-bike-img"
          />
          <div v-else class="modal-img-fallback">🏍️</div>
        </div>

        <div class="modal-info-list">
          <p><strong>Mã đơn thuê:</strong> #{{ rental.id }}</p>
          <p><strong>Tên xe:</strong> {{ rental.motorbike_model || rental.vehicle_name || 'Xe không xác định' }}</p>
          <p v-if="rental.license_plate"><strong>Biển số xe:</strong> {{ rental.license_plate }}</p>
          <p><strong>Ngày bắt đầu:</strong> {{ dinhDangNgay(rental.start_date) }}</p>
          <p v-if="rental.end_date"><strong>Ngày trả xe:</strong> {{ dinhDangNgay(rental.end_date) }}</p>
          <p v-if="rental.total_price || rental.price">
            <strong>Tổng tiền:</strong> 
            {{ dinhDangTien(rental.total_price || rental.price) }}
          </p>
          <p>
            <strong>Trạng thái:</strong> 
            <span class="status-badge" :class="statusClass(rental.status)">
              {{ statusLabel(rental.status) }}
            </span>
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close-modal" @click="$emit('close')">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rental: {
    type: Object,
    default: null
  },
  backendUrl: {
    type: String,
    default: "http://localhost:5000"
  }
})

defineEmits(['close'])

const dinhDangNgay = (dateStr) => {
  if (!dateStr) return "N/A"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN")
}

const dinhDangTien = (val) => {
  if (!val) return "0 VNĐ"
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

const statusLabel = (status) => {
  if (!status) return "Chưa có trạng thái"
  const value = status.toString().toLowerCase()
  if (value.includes("complete")) return "Hoàn thành"
  if (value.includes("pending")) return "Chờ xử lý"
  if (value.includes("confirm")) return "Đã xác nhận"
  if (value.includes("cancel")) return "Đã hủy"
  if (value.includes("progress") || value.includes("in progress")) return "Đang xử lý"
  return status
}

const statusClass = (status) => {
  if (!status) return "unknown"
  const value = status.toString().toLowerCase()
  if (value.includes("complete")) return "completed"
  if (value.includes("pending")) return "pending"
  if (value.includes("confirm")) return "confirmed"
  if (value.includes("cancel")) return "cancelled"
  if (value.includes("progress") || value.includes("in progress")) return "in_progress"
  return "unknown"
}

const imageUrl = computed(() => {
  if (!props.rental) return ""
  const rawImage =
    props.rental.motorbike_image ||
    props.rental.vehicle_image ||
    props.rental.image ||
    props.rental.img_url ||
    props.rental.image_url ||
    ""

  if (!rawImage) return ""
  const value = rawImage.toString().trim()
  if (!value) return ""

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value
  }

  const withoutLeadingSlash = value.replace(/^\/+/, "")
  if (withoutLeadingSlash.startsWith("uploads/")) {
    return `${props.backendUrl}/${withoutLeadingSlash}`
  }

  return `${props.backendUrl}/uploads/${withoutLeadingSlash}`
})
</script>

<style scoped>
@import "@/assets/style/ModalDetailRentai.css";
</style>