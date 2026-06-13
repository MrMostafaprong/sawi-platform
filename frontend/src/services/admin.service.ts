import api from "./api";
import type { Report, AdminUser, PortfolioItem } from "../types";

export const adminService = {
  async getPendingReports(page = 1) {
    const res = await api.get<{ reports: Report[]; total: number; page: number; totalPages: number }>("/admin/reports", { params: { page } });
    return res.data;
  },
  async resolveReport(id: string, action: "RESOLVED" | "DISMISSED") {
    const res = await api.patch<{ message: string; report: Report }>(`/admin/reports/${id}`, { action });
    return res.data;
  },
  async banUser(id: string) {
    const res = await api.post<{ message: string }>(`/admin/users/${id}/ban`);
    return res.data;
  },
  async unbanUser(id: string) {
    const res = await api.post<{ message: string }>(`/admin/users/${id}/unban`);
    return res.data;
  },
  async getPendingImages(page = 1) {
    const res = await api.get<{ items: PortfolioItem[]; total: number; page: number; totalPages: number }>("/admin/images/pending", { params: { page } });
    return res.data;
  },
  async approveImage(id: string) {
    const res = await api.patch<{ message: string; item: PortfolioItem }>(`/admin/images/${id}/approve`);
    return res.data;
  },
  async rejectImage(id: string) {
    const res = await api.patch<{ message: string; item: PortfolioItem }>(`/admin/images/${id}/reject`);
    return res.data;
  },
  async getAllUsers(page = 1) {
    const res = await api.get<{ users: AdminUser[]; total: number; page: number; totalPages: number }>("/admin/users", { params: { page } });
    return res.data;
  },
};
