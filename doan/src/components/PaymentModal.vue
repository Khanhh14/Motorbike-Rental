<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>Chọn phương thức thanh toán</h2>

      <div class="order-id">
        <p v-if="orderId">
          <strong>{{ type === 'surcharge' ? 'Mã đơn thuê xe:' : 'Mã đơn thuê xe:' }}</strong>
          {{ orderId }}
        </p>
        <p v-else>
          <strong>{{ type === 'surcharge' ? 'Mã đơn thuê xe:' : 'Mã đơn thuê xe:' }}</strong>
          Đang tải...
        </p>
      </div>

      <div class="payment-info">
        <p><strong>Giá tiền:</strong> {{ formattedPrice }}</p>
        <p><strong>Nội dung thanh toán:</strong> {{ dynamicContent }}</p>
      </div>

      <div class="tabs">
        <button
          v-for="method in paymentMethods"
          :key="method.value"
          :class="['tab-btn', { active: selectedMethod === method.value }]"
          @click="selectMethod(method.value)"
        >
          {{ method.label }}
        </button>
      </div>

      <div v-if="selectedMethod" class="qr-card">
        <h3>{{ getLabel(selectedMethod) }}</h3>
        <div v-if="qrCodeValue">
          <img :src="qrCodeValue" alt="QR Code" width="200" height="200" />
        </div>
        <div v-else>
          <p>Không thể tạo mã QR. Vui lòng thử lại.</p>
        </div>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="closeModal">Hủy</button>
        <button class="pay-btn" @click="handlePayment">Thanh toán</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaymentModal',
  props: {
    show: { type: Boolean, required: true },
    type: { type: String, default: 'rental' }, // 'rental' hoặc 'surcharge'
    rentalOrder: { type: Object, default: null },     // Đơn thuê
    surcharge: { type: Object, default: null },       // Phụ thu
    qrCodeValue: { type: String, default: '' }
  },
  data() {
    return {
      paymentMethods: [
        { label: 'Ngân hàng', value: 'credit_cash' },
        { label: 'MOMO', value: 'momo' },
      ],
      selectedMethod: null
    };
  },
  computed: {
    orderId() {
      if (this.type === 'surcharge') {
        // Lấy mã đơn thuê từ phụ thu
        return this.surcharge?.rental_id || null;
      } else {
        return this.rentalOrder?.id || null;
      }
    },
    amount() {
      return this.type === 'surcharge'
        ? this.surcharge?.amount || 0
        : this.rentalOrder?.totalPrice || 0;
    },
    formattedPrice() {
      return this.amount.toLocaleString('vi-VN') + ' VNĐ';
    },
    dynamicContent() {
      const prefix = this.type === 'surcharge' ? 'TTPHUTHU' : 'TTHDTX';
      return this.orderId ? `${prefix}${this.orderId}` : `${prefix}00`;
    }
  },
  watch: {
    selectedMethod(newMethod) {
      if (newMethod) {
        this.generateQRCode(newMethod);
      }
    }
  },
  emits: ['close', 'pay', 'update:qrCodeValue'],
  methods: {
    closeModal() {
      this.$emit('close');
    },
    selectMethod(methodValue) {
      this.selectedMethod = methodValue;
    },
    getLabel(methodValue) {
      const found = this.paymentMethods.find(m => m.value === methodValue);
      return found ? found.label : methodValue;
    },
    async generateQRCode(method) {
      try {
        if (!this.amount || this.amount <= 0) {
          throw new Error('Số tiền không hợp lệ.');
        }

        let soTaiKhoan = '';
        let tenTaiKhoan = 'Tran Bao Khanh';
        let soDienThoai = null;

        if (method === 'credit_cash') {
          soTaiKhoan = '1048929602';
        } else if (method === 'momo') {
          soDienThoai = '0363352990';
        } else if (method === 'zalopay') {
          soDienThoai = '0356907889';
        }

        const payload = {
          type: method,
          soTaiKhoan,
          tenTaiKhoan,
          soTien: this.amount,
          noiDung: this.dynamicContent,
          soDienThoai
        };

        const response = await axios.post('http://localhost:5000/api/qr', payload);

        if (response.data.success && response.data.qr) {
          this.$emit('update:qrCodeValue', response.data.qr);
        } else {
          console.error('Lỗi phản hồi tạo QR:', response.data);
          this.$emit('update:qrCodeValue', '');
        }
      } catch (error) {
        console.error('Lỗi tạo mã QR:', error.response?.data || error.message);
        this.$emit('update:qrCodeValue', '');
      }
    },
    async handlePayment() {
  if (!this.selectedMethod) {
    alert('Vui lòng chọn một phương thức thanh toán.');
    return;
  }

  if (!this.orderId) {
    alert('Không tìm thấy ID cần thanh toán!');
    return;
  }

  try {
    const payload = {
      amount: this.amount,
      payment_method: this.selectedMethod,
      content: this.dynamicContent,
      status: 'pending',
      type: this.type // thêm trường type để gửi lên backend
    };

    if (this.type === 'surcharge') {
      // Chú ý backend bạn nói không có surcharge_id, nên bỏ dòng này nếu đúng nhé
      // Nếu backend không có surcharge_id thì thay bằng rental_id thôi
      payload.rental_id = this.surcharge?.rental_id || null;
    } else {
      payload.rental_id = this.rentalOrder?.id || null;
    }

    console.log('Payload gửi lên backend:', payload);

    const response = await axios.post('http://localhost:5000/api/payments', payload);

    console.log('Phản hồi từ backend:', response.data);

    if (response.data.payment_id) {
      alert('Đã tạo thanh toán thành công!');
      this.$emit('pay', { method: this.selectedMethod, content: this.dynamicContent });
      this.closeModal();
    } else {
      alert('Tạo thanh toán thất bại.');
    }
  } catch (error) {
    // Log lỗi chi tiết
    console.error('Lỗi khi tạo thanh toán:', error.response?.data || error.message || error);
    alert('Có lỗi xảy ra khi tạo thanh toán. Vui lòng kiểm tra console để biết thêm chi tiết.');
  }
}
  }
};
</script>



<style scoped>
@import "@/assets/style/PaymentModal.css";
</style>
