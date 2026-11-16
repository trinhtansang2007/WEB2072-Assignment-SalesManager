<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import AppLayout from "../layouts/AppLayout.vue";
import http from "../api/http";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const items = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const q = ref("");
const category = ref("");
const status = ref("");
const loading = ref(false);
const error = ref("");
const showForm = ref(false);
const editingId = ref(null);

const form = reactive({
  name: "",
  description: "",
  price: 0,
  category: "Pastas",
  imageUrl: "https://picsum.photos/id/292/200/200",
  status: "available",
  stock: 0,
});

const categories = ["Pastas", "Cold Drinks", "Deserts", "Starters", "Hot Drinks", "Salads"];
const totalPages = computed(() => Math.ceil(total.value / limit.value) || 1);

async function loadProducts() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await http.get("/products", {
      params: {
        q: q.value || undefined,
        category: category.value || undefined,
        status: status.value || undefined,
        page: page.value,
        limit: limit.value,
      },
    });
    items.value = data.items;
    total.value = data.total;
  } catch (err) {
    error.value = err.response?.data?.message || "Không tải được sản phẩm.";
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, {
    name: "",
    description: "",
    price: 0,
    category: "Pastas",
    imageUrl: "https://picsum.photos/id/292/200/200",
    status: "available",
    stock: 0,
  });
  showForm.value = true;
}

function openEdit(product) {
  editingId.value = product._id;
  Object.assign(form, {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    status: product.status,
    stock: product.stock,
  });
  showForm.value = true;
}

async function saveProduct() {
  if (!form.name || form.price < 0 || !form.category) {
    alert("Vui lòng nhập đủ Name, Price, Category.");
    return;
  }
  try {
    if (editingId.value) {
      await http.put(`/products/${editingId.value}`, form);
    } else {
      await http.post("/products", form);
    }
    showForm.value = false;
    await loadProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Không lưu được sản phẩm.");
  }
}

async function removeProduct(product) {
  if (!auth.isAdmin) {
    alert("Chỉ admin được xóa sản phẩm.");
    return;
  }
  if (!confirm(`Xóa sản phẩm "${product.name}"?`)) return;
  try {
    await http.delete(`/products/${product._id}`);
    await loadProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Không xóa được sản phẩm.");
  }
}

function changePage(next) {
  if (next < 1 || next > totalPages.value) return;
  page.value = next;
  loadProducts();
}

onMounted(loadProducts);
</script>

<template>
  <AppLayout>
    <div class="topbar">
      <h1 class="page-title">Products</h1>
      <button class="btn btn-brand" @click="openCreate">+ Add new product</button>
    </div>

    <div class="card-panel mb-3">
      <div class="row g-2">
        <div class="col-md-4">
          <input v-model="q" class="form-control" placeholder="Tìm tên / mô tả" @keyup.enter="loadProducts" />
        </div>
        <div class="col-md-3">
          <select v-model="category" class="form-select" @change="page = 1; loadProducts()">
            <option value="">All categories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="status" class="form-select" @change="page = 1; loadProducts()">
            <option value="">All status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-outline-secondary w-100" @click="page = 1; loadProducts()">Lọc</button>
        </div>
      </div>
    </div>

    <div class="card-panel">
      <p v-if="loading" class="muted">Đang tải...</p>
      <p v-else-if="error" class="text-danger">{{ error }}</p>
      <div v-else class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>ID #</th>
              <th>Images</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="item._id">
              <td>#{{ (page - 1) * limit + index + 1 }}</td>
              <td><img class="product-thumb" :src="item.imageUrl" :alt="item.name" /></td>
              <td>{{ item.name }}</td>
              <td class="muted">{{ item.description }}</td>
              <td>${{ Number(item.price).toFixed(2) }}</td>
              <td>{{ item.category }}</td>
              <td>
                <span class="status-pill" :class="item.status">
                  {{ item.status === "available" ? "Available" : "Unavailable" }}
                </span>
              </td>
              <td class="text-nowrap">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(item)">Sửa</button>
                <button class="btn btn-sm btn-outline-danger" @click="removeProduct(item)">Xóa</button>
              </td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="8" class="text-center muted py-4">Chưa có sản phẩm</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="muted">{{ total }} Products in total</div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="changePage(page - 1)">
            Trước
          </button>
          <span>Trang {{ page }} / {{ totalPages }}</span>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
          >
            Sau
          </button>
          <select v-model.number="limit" class="form-select form-select-sm" style="width: auto" @change="page = 1; loadProducts()">
            <option :value="5">5 / page</option>
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="form-drawer" @click.self="showForm = false">
      <div class="form-panel">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 mb-0">{{ editingId ? "Edit product" : "Add new product" }}</h2>
          <button class="btn-close" @click="showForm = false"></button>
        </div>
        <div class="mb-3">
          <label class="form-label">Name *</label>
          <input v-model="form.name" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Description *</label>
          <textarea v-model="form.description" class="form-control" rows="3"></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Price *</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input v-model.number="form.price" type="number" min="0" step="0.01" class="form-control" />
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Category *</label>
          <select v-model="form.category" class="form-select">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Image URL</label>
          <input v-model="form.imageUrl" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Stock</label>
          <input v-model.number="form.stock" type="number" min="0" class="form-control" />
        </div>
        <div class="mb-4">
          <label class="form-label d-block">Status</label>
          <div class="toggle-group">
            <button type="button" :class="{ active: form.status === 'available' }" @click="form.status = 'available'">
              Available
            </button>
            <button
              type="button"
              :class="{ active: form.status === 'unavailable' }"
              @click="form.status = 'unavailable'"
            >
              Unavailable
            </button>
          </div>
        </div>
        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-secondary" @click="showForm = false">Cancel</button>
          <button class="btn btn-brand" @click="saveProduct">Save</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
