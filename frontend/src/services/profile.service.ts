import api from "./api";
import type { ProfileData } from "../types";

export const profileService = {
  async getMyProfile() {
    const res = await api.get<{ profile: ProfileData }>("/profile/me");
    return res.data.profile;
  },
  async getPublicProfile(username: string) {
    const res = await api.get<{ profile: ProfileData }>(`/profile/${username}`);
    return res.data.profile;
  },
  async updateProfile(data: Record<string, unknown>) {
    const res = await api.put<{ message: string; user: ProfileData }>("/profile/me", data);
    return res.data;
  },
  async uploadMedia(file: File, caption?: string) {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    const res = await api.post("/profile/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  async uploadMultiple(files: FileList) {
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append("files", files[i]);
    }
    const res = await api.post("/profile/upload-multiple", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  async addLink(url: string, caption?: string) {
    const res = await api.post("/profile/link", { url, caption });
    return res.data;
  },
  async deleteMedia(id: string) {
    const res = await api.delete(`/profile/media/${id}`);
    return res.data;
  },
  async toggleContactVisibility() {
    const res = await api.patch<{ message: string; showContact: boolean }>(
      "/profile/contact-visibility"
    );
    return res.data;
  },
  async updateAvatar(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post("/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  async uploadResume(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{ message: string; resumeUrl: string }>("/profile/resume", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
