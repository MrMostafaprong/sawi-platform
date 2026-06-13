import api from "./api";
import type { Report } from "../types";

export const reportService = {
  async create(targetId: string, reason: string, description?: string) {
    const res = await api.post<{ message: string; report: Report }>("/reports", { targetId, reason, description });
    return res.data;
  },
  async getMyReports() {
    const res = await api.get<{ reports: Report[] }>("/reports/my");
    return res.data.reports;
  },
};
