<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const email = ref("admin@fpt.edu.vn");
const password = ref("123456");
const error = ref("");
const loading = ref(false);

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(email.value.trim(), password.value);
    router.push("/stats");
  } catch (err) {
    error.value = err.response?.data?.message || "Đăng nhập thất bại.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-wrap">
    <div class="card-panel login-card">
      <h1 class="h4 mb-1">Sales Manager</h1>
      <p class="muted mb-4">Đăng nhập quản lý bán hàng FPT Polytechnic</p>
      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Mật khẩu</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <button class="btn btn-brand w-100" :disabled="loading">
          {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
        </button>
      </form>
      <div class="mt-3 small muted">
        Admin: admin@fpt.edu.vn / 123456<br />
        Staff: staff@fpt.edu.vn / 123456
      </div>
    </div>
  </div>
</template>
