import { apiFetch } from "./client";

export interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  pictureUrl: string | null;
}

interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  timestamp: string;
}

export function getProfile() {
  return apiFetch<ProfileResponse>("/auth/profile");
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function getLoginUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "/api";
  return `${apiBase}/auth/login`;
}

export function devLogin() {
  return apiFetch<{ success: boolean }>("/auth/dev-login", { method: "POST" });
}
