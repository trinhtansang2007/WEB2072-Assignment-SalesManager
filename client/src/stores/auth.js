import { defineStore } from "pinia";
import { ref, computed } from "vue";
import http from "../api/http";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || "");
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));

  const isAuthenticated = computed(() => Boolean(token.value));
  const isAdmin = computed(() => user.value?.role === "admin");

  async function login(email, password) {
    const { data } = await http.post("/auth/login", { email, password });
    token.value = data.accessToken;
    user.value = data.user;
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  }

  function logout() {
    token.value = "";
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return { token, user, isAuthenticated, isAdmin, login, logout };
});
