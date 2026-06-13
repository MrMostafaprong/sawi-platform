import api from "./api";

export interface UserSearchResult {
  users: Array<{
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    role: string;
    gender: string | null;
    city: string | null;
    skills: string[];
    createdAt: string;
    _count: { groupMembers: number };
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export const userService = {
  async search(params: {
    query?: string; skill?: string; city?: string;
    gender?: string; page?: number;
  }) {
    const res = await api.get<UserSearchResult>("/users/search", { params });
    return res.data;
  },
};
