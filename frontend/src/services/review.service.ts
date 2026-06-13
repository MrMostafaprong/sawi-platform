import api from "./api";
import type { ReviewListResult } from "../types";

export const reviewService = {
  async create(targetId: string, rating: number, comment?: string) {
    const res = await api.post<{ message: string; review: unknown }>("/reviews", { targetId, rating, comment });
    return res.data;
  },
  async getForUser(targetId: string, page = 1) {
    const res = await api.get<ReviewListResult>(`/reviews/${targetId}`, { params: { page } });
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete<{ message: string }>(`/reviews/${id}`);
    return res.data;
  },
};
