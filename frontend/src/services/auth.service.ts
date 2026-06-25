import api from "./api";
import type { AuthResponse, User } from "../types";

export const authService = {
  async register(email: string, username: string, password: string, confirmPassword: string, gender?: string) {
    const res = await api.post<AuthResponse>("/auth/register", { email, username, password, confirmPassword, gender });
    return res.data;
  },
  async login(email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },
  async logout() {
    const res = await api.post<{ message: string }>("/auth/logout");
    return res.data;
  },
  async me() {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },
};
