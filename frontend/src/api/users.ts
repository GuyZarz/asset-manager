import { apiFetch } from "./client";

export interface UserSettings {
  preferredCurrency: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export function getUserSettings() {
  return apiFetch<ApiResponse<UserSettings>>("/users/settings");
}

export function updateUserSettings(settings: { preferredCurrency: string }) {
  return apiFetch<ApiResponse<void>>("/users/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
