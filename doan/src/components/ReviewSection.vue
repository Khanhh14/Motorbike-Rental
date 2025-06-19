<template>
  <div class="reviews-section">
    <h3>ĐÁNH GIÁ XE</h3>

    <ul v-if="paginatedReviews.length">
      <li v-for="review in paginatedReviews" :key="review.id">
        <small class="review-time">{{ formatDate(review.created_at) }}</small><br />
        <strong>{{ review.username }}</strong> - ⭐ {{ review.rating }}/5
        <p>{{ review.comment }}</p>
    </li>
    </ul>
    <p v-else>Chưa có đánh giá nào.</p>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">« Trước</button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Sau »</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { defineComponent, ref, computed, watch, onMounted } from "vue";

export default defineComponent({
  props: {
    motorbikeId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const reviews = ref([]);
    const reviewsPerPage = 3;
    const currentPage = ref(1);

    const totalPages = computed(() => {
      return reviews.value.length
        ? Math.ceil(reviews.value.length / reviewsPerPage)
        : 1;
    });

    const paginatedReviews = computed(() => {
      const start = (currentPage.value - 1) * reviewsPerPage;
      return reviews.value.slice(start, start + reviewsPerPage);
    });

    const fetchReviews = async () => {
      if (!props.motorbikeId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/reviews/${props.motorbikeId}`,
          { withCredentials: true }
        );
        reviews.value = res.data || [];
      } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
        reviews.value = [];
      }
    };

    const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

    watch(() => props.motorbikeId, fetchReviews);
    onMounted(fetchReviews);

    return {
      paginatedReviews,
      currentPage,
      totalPages,
      prevPage: () => {
        if (currentPage.value > 1) currentPage.value--;
      },
      nextPage: () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
      },
      formatDate,
    };
  },
});
</script>

<style scoped>
@import "@/assets/style/MotorReviews.css";

.review-header {
  display: flex;
  flex-direction: column;
  gap: 2px; /* điều chỉnh khoảng cách giữa ngày và tên */
  margin-bottom: 2px;
}

.review-time {
  color: #666;
  font-size: 0.85em;
  font-style: italic;
}
</style>
