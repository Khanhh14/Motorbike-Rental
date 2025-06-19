<template>
  <div class="container">
    <h2 class="header">📊 Thống kê hệ thống</h2>

    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">Doanh thu theo tháng</h3>
        <Bar :data="revenueData" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Số lượt thuê theo tháng</h3>
        <Line :data="rentalData" />
      </div>

      <div class="chart-card chart-card-full">
        <h3 class="chart-title">Top xe được thuê nhiều nhất</h3>
        <Pie :data="topMotorbikesData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bar, Line, Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement
} from 'chart.js';

ChartJS.register(
  Title, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement
);

const revenueData = ref({ labels: [], datasets: [] });
const rentalData = ref({ labels: [], datasets: [] });
const topMotorbikesData = ref({ labels: [], datasets: [] });

onMounted(async () => {
  // Doanh thu theo tháng
  const res1 = await fetch('http://localhost:5000/api/stats/revenue-by-month');
  const data1 = await res1.json();
  revenueData.value = {
    labels: data1.map(item => item.month),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      backgroundColor: '#4ade80',
      data: data1.map(item => item.total_revenue)
    }]
  };

  // Số lượt thuê theo tháng
  const res2 = await fetch('http://localhost:5000/api/stats/rentals-by-month');
  const data2 = await res2.json();
  rentalData.value = {
    labels: data2.map(item => item.month),
    datasets: [{
      label: 'Lượt thuê',
      borderColor: '#3b82f6',
      backgroundColor: '#bfdbfe',
      fill: true,
      data: data2.map(item => item.total_rentals)
    }]
  };

  // Top xe được thuê nhiều
  const res3 = await fetch('http://localhost:5000/api/stats/top-motorbikes');
  const data3 = await res3.json();
  topMotorbikesData.value = {
    labels: data3.map(item => `${item.brand} ${item.model}`),
    datasets: [{
      label: 'Số lượt thuê',
      backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
      data: data3.map(item => item.rental_count)
    }]
  };
});
</script>

<style scoped>
/* Container chính */
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Grid layout cho các biểu đồ */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
}

/* Full-width cho biểu đồ cuối cùng */
.chart-card-full {
  grid-column: span 2;
}

/* Style cho canvas */
canvas {
  max-height: 300px;
  width: 100%;
  border-radius: 8px;
}
</style>
