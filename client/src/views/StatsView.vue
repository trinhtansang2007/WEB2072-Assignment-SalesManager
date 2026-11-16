<script setup>
import { nextTick, onMounted, onBeforeUnmount, ref } from "vue";
import Chart from "chart.js/auto";
import AppLayout from "../layouts/AppLayout.vue";
import http from "../api/http";

const overview = ref(null);
const revenueCanvas = ref(null);
const ordersCanvas = ref(null);
let revenueChart;
let ordersChart;

async function loadStats() {
  const { data } = await http.get("/stats/overview");
  overview.value = data;
  await nextTick();
  renderCharts();
}

function renderCharts() {
  if (!overview.value || !revenueCanvas.value || !ordersCanvas.value) return;

  revenueChart?.destroy();
  ordersChart?.destroy();

  revenueChart = new Chart(revenueCanvas.value, {
    type: "line",
    data: {
      labels: overview.value.dailyRevenue.map((d) => d.day),
      datasets: [
        {
          label: "Revenue",
          data: overview.value.dailyRevenue.map((d) => d.value),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.2)",
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });

  ordersChart = new Chart(ordersCanvas.value, {
    type: "bar",
    data: {
      labels: overview.value.dailyOrders.map((d) => d.day),
      datasets: [
        {
          label: "Orders",
          data: overview.value.dailyOrders.map((d) => d.value),
          backgroundColor: "#60a5fa",
          borderRadius: 8,
        },
      ],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });
}

onMounted(loadStats);
onBeforeUnmount(() => {
  revenueChart?.destroy();
  ordersChart?.destroy();
});
</script>

<template>
  <AppLayout>
    <div class="topbar">
      <h1 class="page-title">Overview</h1>
    </div>

    <div v-if="overview" class="kpi-grid">
      <div class="card-panel">
        <div class="d-flex justify-content-between">
          <div>
            <div class="muted">Daily Revenue</div>
            <div class="h4 mb-0">${{ Number(overview.summary.revenue).toFixed(2) }}</div>
          </div>
        </div>
        <canvas ref="revenueCanvas" height="120" class="mt-3"></canvas>
      </div>

      <div class="card-panel">
        <div class="muted">Daily Orders</div>
        <div class="h4 mb-0">{{ overview.summary.orderCount }}</div>
        <canvas ref="ordersCanvas" height="120" class="mt-3"></canvas>
      </div>

      <div class="card-panel">
        <div class="muted">Customers / Products</div>
        <div class="h4 mb-1">{{ overview.summary.customerCount }} khách</div>
        <div class="muted">
          {{ overview.summary.availableProducts }}/{{ overview.summary.productCount }} sản phẩm còn bán
        </div>
      </div>
    </div>

    <div v-if="overview" class="stats-bottom">
      <div class="card-panel">
        <h2 class="h6 mb-3">Recent Orders</h2>
        <div v-for="order in overview.recentOrders" :key="order.id" class="d-flex justify-content-between border-bottom py-2">
          <div>
            <div class="fw-semibold">{{ order.code }} · {{ order.customerName }}</div>
            <div class="small muted">{{ order.address }}</div>
            <div class="small">{{ order.itemsLabel }}</div>
          </div>
          <div class="text-end">
            <div class="fw-semibold">${{ Number(order.total).toFixed(2) }}</div>
            <div class="small muted">{{ order.status }}</div>
          </div>
        </div>
      </div>

      <div class="card-panel">
        <h2 class="h6 mb-3">Trending Products</h2>
        <div
          v-for="item in overview.trendingProducts"
          :key="item.rank"
          class="d-flex align-items-center gap-3 border-bottom py-2"
        >
          <img class="product-thumb" :src="item.imageUrl" :alt="item.name" />
          <div class="flex-grow-1">
            <div class="fw-semibold">{{ item.rank }}. {{ item.name }}</div>
            <div class="small muted">Ordered {{ item.ordered }} times</div>
          </div>
          <div class="fw-semibold">${{ Number(item.price).toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
