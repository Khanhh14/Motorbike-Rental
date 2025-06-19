<template>
  <div class="container">
    <div class="header">
      <h2>Quản Lý Phụ Thu</h2>
      <button class="btn-add" @click="showModal = true">+ Thêm Phụ Thu Mới</button>
    </div>

    <div class="filters">
      <select v-model="filterType">
        <option value="">Loại phụ thu</option>
        <option value="Hư hỏng">Hư hỏng</option>
        <option value="Trả xe trễ">Trả xe trễ</option>
      </select>

      <select v-model="filterStatus">
        <option value="">Trạng thái</option>
        <option value="pending">Đang xử lý</option>
        <option value="completed">Đã thanh toán</option>
        <option value="canceled">Đã hủy</option>
      </select>
    </div>

    <table class="surcharge-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Mã đơn thuê</th>
          <th>Loại</th>
          <th>Mô tả</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredSurcharges" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.rental_id }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.description }}</td>
          <td>{{ formatCurrency(item.amount) }}</td>
          <td>
            <span :class="'badge ' + item.status">{{ statusText(item.status) }}</span>
          </td>
          <td>
            <template v-if="item.status === 'pending'">
              <button class="btn-confirm-action" @click="confirmSurcharge(item.id)">Xác nhận</button>
              <button class="btn-cancel-action" @click="cancelSurcharge(item.id)">Hủy</button>
            </template>
            <template v-else>
              <span style="color: gray; font-size: 12px;">Đã xử lý</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal thêm phụ thu -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Thêm Phụ Thu Mới</h3>
        <form @submit.prevent="createSurcharge">
          <label>Mã đơn thuê:</label>
          <input type="text" v-model="newSurcharge.rental_id" required />

          <label>Loại:</label>
          <select v-model="newSurcharge.type" required>
            <option value="">-- Chọn loại --</option>
            <option value="Hư hỏng">Hư hỏng</option>
            <option value="Trả xe trễ">Trả xe trễ</option>
          </select>

          <label>Mô tả:</label>
          <textarea v-model="newSurcharge.description" required></textarea>

          <label>Số tiền:</label>
          <input type="number" v-model="newSurcharge.amount" required min="0" />

          <label>Trạng thái:</label>
          <select v-model="newSurcharge.status" required>
            <option value="pending">Đang xử lý</option>
            <option value="completed">Đã thanh toán</option>
            <option value="canceled">Đã hủy</option>
          </select>

          <div class="modal-actions">
            <button type="submit" class="btn-confirm">Lưu</button>
            <button type="button" @click="closeModal" class="btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      surcharges: [],
      filterType: '',
      filterStatus: '',
      showModal: false,
      newSurcharge: {
        rental_id: '',
        type: '',
        description: '',
        amount: '',
        status: 'pending'
      }
    };
  },
  computed: {
    filteredSurcharges() {
      return this.surcharges.filter(item => {
        return (!this.filterType || item.type === this.filterType) &&
               (!this.filterStatus || item.status === this.filterStatus);
      });
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async fetchSurcharges() {
      try {
        const res = await axios.get('http://localhost:5000/api/surcharges');
        this.surcharges = res.data;
      } catch (error) {
        console.error('Lỗi khi lấy phụ thu:', error);
      }
    },
    async createSurcharge() {
      try {
        const res = await axios.post('http://localhost:5000/api/surcharges', this.newSurcharge);
        this.surcharges.push(res.data);
        this.toast.success('Thêm phụ thu thành công!');
        this.closeModal();
      } catch (error) {
        console.error('Lỗi khi thêm phụ thu:', error.response?.data || error);
        this.toast.error('Thêm phụ thu thất bại!');
      }
    },
    async confirmSurcharge(id) {
      if (confirm("Bạn có chắc muốn xác nhận phụ thu này?")) {
        try {
          await axios.put(`http://localhost:5000/api/surcharges/${id}`, { status: 'completed' });
          const item = this.surcharges.find(s => s.id === id);
          if (item) item.status = 'completed';
          this.toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
          console.error('Lỗi khi xác nhận phụ thu:', error.response?.data || error);
          this.toast.error('Cập nhật trạng thái thất bại!');
        }
      }
    },
    async cancelSurcharge(id) {
      if (confirm("Bạn có chắc muốn hủy phụ thu này?")) {
        try {
          await axios.put(`http://localhost:5000/api/surcharges/${id}`, { status: 'canceled' });
          const item = this.surcharges.find(s => s.id === id);
          if (item) item.status = 'canceled';
          this.toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
          console.error('Lỗi khi hủy phụ thu:', error.response?.data || error);
          this.toast.error('Cập nhật trạng thái thất bại!');
        }
      }
    },
    closeModal() {
      this.showModal = false;
      this.newSurcharge = {
        rental_id: '',
        type: '',
        description: '',
        amount: '',
        status: 'pending'
      };
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },
    statusText(status) {
      switch (status) {
        case 'pending': return 'Đang xử lý';
        case 'completed': return 'Đã thanh toán';
        case 'canceled': return 'Đã hủy';
        default: return status;
      }
    }
  },
  mounted() {
    this.fetchSurcharges();
  }
};
</script>

<style scoped>
@import "@/assets/style/SurchargesAdmin.css";
@import '@/assets/style/Toast.css';
</style>
