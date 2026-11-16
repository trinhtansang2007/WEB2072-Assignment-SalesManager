<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const links = [
  { to: "/stats", label: "Thống kê" },
  { to: "/products", label: "Sản phẩm" },
  { to: "/orders", label: "Đơn hàng" },
  { to: "/customers", label: "Khách hàng" },
];

const activePath = computed(() => route.path);

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        FPT Education
        <small>FPT Polytechnic</small>
      </div>
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :class="{ active: activePath === link.to }"
      >
        {{ link.label }}
      </router-link>
      <div class="mt-4 px-2 small text-white-50">
        {{ auth.user?.name }} ({{ auth.user?.role }})
      </div>
      <button class="btn btn-outline-light btn-sm mt-2" @click="logout">Đăng xuất</button>
    </aside>
    <main class="content">
      <slot />
    </main>
  </div>
</template>
