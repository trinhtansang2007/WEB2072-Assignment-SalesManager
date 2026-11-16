<script setup>
import { onMounted, reactive, ref } from "vue";
import AppLayout from "../layouts/AppLayout.vue";
import http from "../api/http";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const items = ref([]);
const q = ref("");
const showForm = ref(false);
const editingId = ref(null);
const form = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
  note: "",
});

async function loadCustomers() {
  const { data } = await http.get("/customers", { params: { q: q.value || undefined } });
  items.value = data;
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, { name: "", email: "", phone: "", address: "", note: "" });
  showForm.value = true;
}

function openEdit(customer) {
  editingId.value = customer._id;
  Object.assign(form, {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    note: customer.note,
  });
  showForm.value = true;
}

async function saveCustomer() {
  if (!form.name) {
    alert("Tên khách hàng là bắt buộc.");
    return;
  }
  try {
    if (editingId.value) {
      await http.put(`/customers/${editingId.value}`, form);
    } else {
      await http.post("/customers", form);
    }
    showForm.value = false;
    await loadCustomers();
  } catch (err) {
    alert(err.response?.data?.message || "Không lưu được khách hàng.");
  }
}

async function removeCustomer(customer) {
  if (!auth.isAdmin) {
    alert("Chỉ admin được xóa khách hàng.");
    return;
  }
  if (!confirm(`Xóa khách hàng "${customer.name}"?`)) return;
  try {
    await http.delete(`/customers/${customer._id}`);
    await loadCustomers();
  } catch (err) {
    alert(err.response?.data?.message || "Không xóa được khách hàng.");
  }
}

onMounted(loadCustomers);
</script>

<template>
  <AppLayout>
    <div class="topbar">
      <h1 class="page-title">Customers</h1>
      <button class="btn btn-brand" @click="openCreate">+ Add customer</button>
    </div>

    <div class="card-panel mb-3">
      <div class="row g-2">
        <div class="col-md-9">
          <input v-model="q" class="form-control" placeholder="Tìm tên / email / SĐT" @keyup.enter="loadCustomers" />
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-secondary w-100" @click="loadCustomers">Tìm</button>
        </div>
      </div>
    </div>

    <div class="card-panel table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item._id">
            <td>{{ item.name }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.address }}</td>
            <td class="text-nowrap">
              <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(item)">Sửa</button>
              <button class="btn btn-sm btn-outline-danger" @click="removeCustomer(item)">Xóa</button>
            </td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="5" class="text-center muted py-4">Chưa có khách hàng</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="form-drawer" @click.self="showForm = false">
      <div class="form-panel">
        <h2 class="h5 mb-3">{{ editingId ? "Edit customer" : "Add customer" }}</h2>
        <div class="mb-3">
          <label class="form-label">Name *</label>
          <input v-model="form.name" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input v-model="form.phone" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Address</label>
          <input v-model="form.address" class="form-control" />
        </div>
        <div class="mb-4">
          <label class="form-label">Note</label>
          <textarea v-model="form.note" class="form-control" rows="2"></textarea>
        </div>
        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-secondary" @click="showForm = false">Cancel</button>
          <button class="btn btn-brand" @click="saveCustomer">Save</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
