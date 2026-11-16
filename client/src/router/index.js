import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import LoginView from "../views/LoginView.vue";
import ProductsView from "../views/ProductsView.vue";
import OrdersView from "../views/OrdersView.vue";
import CustomersView from "../views/CustomersView.vue";
import StatsView from "../views/StatsView.vue";

const routes = [
  { path: "/login", name: "login", component: LoginView, meta: { public: true } },
  { path: "/", redirect: "/stats" },
  { path: "/stats", name: "stats", component: StatsView },
  { path: "/products", name: "products", component: ProductsView },
  { path: "/orders", name: "orders", component: OrdersView },
  { path: "/customers", name: "customers", component: CustomersView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: "login" };
  }
  if (to.name === "login" && auth.isAuthenticated) {
    return { name: "stats" };
  }
  return true;
});

export default router;
