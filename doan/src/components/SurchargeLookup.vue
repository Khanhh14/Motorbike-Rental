<template>
  <div class="container">
    <div style ="text-align: center; margin-top: 50px;">
      <h1>Tra cứu phụ thu</h1>
      <p>Nhập mã đơn thuê của bạn để tra cứu thông tin phụ thu</p>
    </div>

    <!-- Tìm kiếm -->
    <div class="search-box">
      <input
        type="text"
        v-model="search"
        placeholder="Nhập mã đơn thuê của bạn"
        @keyup.enter="filterData"
      />
      <button @click="filterData">Tra cứu</button>
    </div>

    <!-- Thông báo lỗi / loading -->
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="loading">Đang tải dữ liệu...</p>

    <!-- Bảng kết quả -->
    <table v-if="surchargeList.length">
      <thead>
        <tr>
          <th>Mã đơn thuê</th>
          <th>Loại</th>
          <th>Mô tả</th>
          <th>Số tiền</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
  <tr v-for="item in surchargeList" :key="item.id">
    <td>{{ item.rental_id }}</td>
    <td>{{ item.type }}</td>
    <td>{{ item.description }}</td>
    <td>{{ item.amount.toLocaleString() }} đ</td>
    <td>
      <span :class="['status', statusClass(item.status)]">{{ translateStatus(item.status) }}</span>
    </td>
    <td>
      <template v-if="item.status !== 'completed' && item.status !== 'canceled'">
        <button class="action pay" @click="paySurcharge(item)">Thanh toán</button>
      </template>
    </td>
  </tr>
</tbody>
    </table>

    <!-- Thông tin phụ -->
    <div class="info-sections">
      <div class="info-box">
        <h3>Hướng dẫn tra cứu</h3>
        <ul>
          <li>Nhập mã đơn thuê của bạn vào ô tìm kiếm</li>
          <li>Nhấn nút "Tra cứu" hoặc nhấn Enter</li>
          <li>Kiểm tra thông tin phụ thu hiển thị bên dưới</li>
          <li>Liên hệ hỗ trợ nếu cần thêm thông tin</li>
        </ul>
      </div>

      <div class="info-box">
        <h3>Câu hỏi thường gặp</h3>
        <ul>
          <li>Làm sao để tìm mã đơn thuê của tôi?</li>
          <li>Tại sao tôi bị tính phụ thu?</li>
          <li>Tôi có thể thắc mắc để tránh bị thu?</li>
          <li>Tôi có thể khiếu nại nếu phụ thu không đúng?</li>
        </ul>
      </div>
    </div>

    <!-- Modal thanh toán -->
    <PaymentModal
      v-if="showModal && selectedSurcharge"
      :show="showModal"
      type="surcharge"
      :surcharge="selectedSurcharge"
      :qrCodeValue="qrCodeValue"
      @close="showModal = false"
      @pay="handleSurchargePayment"
      @update:qrCodeValue="qrCodeValue = $event"
    />
  </div>
</template>

<script>
import axios from 'axios';
import PaymentModal from '@/components/PaymentModal.vue'; // cập nhật path đúng với dự án của bạn

export default {
  components: {
    PaymentModal,
  },
  data() {
    return {
      search: '',
      surchargeList: [],
      loading: false,
      error: '',
      showModal: false,
      selectedSurcharge: null,
      qrCodeValue: '', // Để nhận QR từ modal
    };
  },
  methods: {
        statusClass(status) {
      return {
        pending: 'status-pending',
        completed: 'status-completed',
        canceled: 'status-canceled',
      }[status] || '';
    },
    async filterData() {
      this.error = '';
      this.surchargeList = [];

      if (!this.search.trim()) {
        this.error = 'Vui lòng nhập mã đơn thuê';
        return;
      }

      this.loading = true;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/surcharges?rental_id=${this.search.trim()}`
        );

        this.surchargeList = res.data;

        if (this.surchargeList.length === 0) {
          this.error = 'Không tìm thấy phụ thu cho mã đơn thuê này';
        }
      } catch (err) {
        console.error('Lỗi gọi API:', err);
        this.error = 'Lỗi kết nối tới máy chủ';
      } finally {
        this.loading = false;
      }
    },
    translateStatus(status) {
      const translations = {
        pending: 'Đang xử lý',
        completed: 'Đã hoàn thành',
        canceled: 'Đã hủy',
      };
      return translations[status] || status;
    },
    paySurcharge(item) {
      this.selectedSurcharge = item;
      this.showModal = true;
    },
    reportSurcharge(item) {
      alert(`Bạn đã gửi khiếu nại cho phụ thu ID ${item.id}`);
    },
    handleSurchargePayment({ method, content }) {
      alert(`Thanh toán phụ thu thành công!\nPhương thức: ${method}\nNội dung: ${content}`);
      this.showModal = false;
      this.filterData(); // Cập nhật lại danh sách sau khi thanh toán
    },
  },
};
</script>



<style scoped>
@import "@/assets/style/SurchargeLookup.css";
</style>
