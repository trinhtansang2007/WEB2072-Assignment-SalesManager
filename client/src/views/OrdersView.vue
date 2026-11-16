<script setup>
import { onMounted, reactive, ref } from "vue";
import AppLayout from "../layouts/AppLayout.vue";
import http from "../api/http";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const orders = ref([]);
const customers = ref([]);
const products = ref([]);
const status = ref("");
const q = ref("");
const showForm = ref(false);
const form = reactive({
  customerId: "",
  productId: "",
  quantity: 1,
  note: "",
  status: "pending",
});

async function loadOrders() {
  const { data } = await http.get("/orders", {
    params: { status: status.value || undefined, q: q.value || undefined },
  });
  orders.value = data;
}

async function loadOptions() {
  const [customerRes, productRes] = await Promise.all([
    http.get("/customers"),
    http.get("/products", { params: { limit: 50, status: "available" } }),
  ]);
  customers.value = customerRes.data;
  products.value = productRes.data.items || [];
  if (!form.customerId && customers.value[0]) form.customerId = customers.value[0]._id;
  if (!form.productId && products.value[0]) form.productId = products.value[0]._id;
}

function openCreate() {
  form.quantity = 1;
  form.note = "";
  form.status = "pending";
  showForm.value = true;
}

async function createOrder() {
  try {
    await http.post("/orders", {
      customerId: form.customerId,
      items: [{ productId: form.productId, quantity: form.quantity }],
      status: form.status,
      note: form.note,
    });
    showForm.value = false;
    await loadOrders();
  } catch (err) {
    alert(err.response?.data?.message || "Không tạo được đơn hàng.");
  }
}

async function updateStatus(order, nextStatus) {
  try {
    await http.put(`/orders/${order._id}`, { status: nextStatus });
    await loadOrders();
  } catch (err) {
    alert(err.response?.data?.message || "Không cập nhật được trạng thái.");
  }
}

async function removeOrder(order) {
  if (!auth.isAdmin) {
    alert("Chỉ admin được xóa đơn hàng.");
    return;
  }
  if (!confirm(`Xóa đơn ${order.code}?`)) return;
  try {
    await http.delete(`/orders/${order._id}`);
    await loadOrders();
  } catch (err) {
    alert(err.response?.data?.message || "Không xóa được đơn hàng.");
  }
}

onMounted(async () => {
  await Promise.all([loadOrders(), loadOptions()]);
});
</script>

<template>
  <AppLayout>
    <div class="topbar">
      <h1 class="page-title">Orders</h1>
      <button class="btn btn-brand" @click="openCreate">+ Add order</button>
    </div>

    <div class="card-panel mb-3">
      <div class="row g-2">
        <div class="col-md-5">
          <input v-model="q" class="form-control" placeholder="Tìm mã đơn / khách hàng" @keyup.enter="loadOrders" />
        </div>
        <div class="col-md-4">
          <select v-model="status" class="form-select" @change="loadOrders">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipping">Shipping</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-secondary w-100" @click="loadOrders">Lọc</button>
        </div>
      </div>
    </div>

    <div class="card-panel table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Code</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order._id">
            <td>{{ order.code }}</td>
            <td>
              <div>{{ order.customer?.name }}</div>
              <div class="small muted">{{ order.customer?.address }}</div>
            </td>
            <td>{{ order.items.map((i) => `${i.name} x${i.quantity}`).join(", ") }}</td>
            <td>${{ Number(order.total).toFixed(2) }}</td>
            <td>
              <select class="form-select form-select-sm" :value="order.status" @change="updateStatus(order, $event.target.value)">
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="shipping">shipping</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-danger" @click="removeOrder(order)">Xóa</button>
            </td>
          </tr>
          <tr v-if="!orders.length">
            <td colspan="6" class="text-center muted py-4">Chưa có đơn hàng</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="form-drawer" @click.self="showForm = false">
      <div class="form-panel">
        <h2 class="h5 mb-3">Add order</h2>
        <div class="mb-3">
          <label class="form-label">Customer</label>
          <select v-model="form.customerId" class="form-select">
            <option v-for="c in customers" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Product</label>
          <select v-model="form.productId" class="form-select">
            <option v-for="p in products" :key="p._id" :value="p._id">{{ p.name }} (${{ p.price }})</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Quantity</label>
          <input v-model.number="form.quantity" type="number" min="1" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-select">
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="shipping">shipping</option>
            <option value="completed">completed</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="form-label">Note</label>
          <textarea v-model="form.note" class="form-control" rows="2"></textarea>
        </div>
        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-secondary" @click="showForm = false">Cancel</button>
          <button class="btn btn-brand" @click="createOrder">Save</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
