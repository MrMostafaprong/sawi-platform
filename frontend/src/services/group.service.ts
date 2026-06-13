import api from "./api";
import type { Group, GroupSearchResult, GroupReviewListResult } from "../types";

export const groupService = {
  async create(data: { name: string; description?: string; visibility: string }) {
    const res = await api.post<{ message: string; group: Group }>("/groups", data);
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get<{ group: Group }>(`/groups/${id}`);
    return res.data.group;
  },
  async update(id: string, data: Partial<{ name: string; description: string; visibility: string }>) {
    const res = await api.put<{ message: string; group: Group }>(`/groups/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete<{ message: string }>(`/groups/${id}`);
    return res.data;
  },
  async join(id: string) {
    const res = await api.post<{ message: string }>(`/groups/${id}/join`);
    return res.data;
  },
  async leave(id: string) {
    const res = await api.post<{ message: string }>(`/groups/${id}/leave`);
    return res.data;
  },
  async follow(id: string) {
    const res = await api.post<{ message: string }>(`/groups/${id}/follow`);
    return res.data;
  },
  async unfollow(id: string) {
    const res = await api.post<{ message: string }>(`/groups/${id}/unfollow`);
    return res.data;
  },
  async createReview(id: string, rating: number, comment?: string) {
    const res = await api.post<{ message: string; review: unknown }>(`/groups/${id}/review`, { rating, comment });
    return res.data;
  },
  async getReviews(id: string, page = 1) {
    const res = await api.get<GroupReviewListResult>(`/groups/${id}/reviews`, { params: { page } });
    return res.data;
  },
  async search(params: {
    query?: string; skill?: string; city?: string;
    gender?: string; visibility?: string; page?: number;
  }) {
    const res = await api.get<GroupSearchResult>("/groups/search", { params });
    return res.data;
  },
  async myGroups() {
    const res = await api.get<{ groups: Group[] }>("/groups/my");
    return res.data.groups;
  },
};
