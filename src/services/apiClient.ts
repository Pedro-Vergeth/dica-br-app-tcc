import axios from "axios";

export function resolveApiBaseUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!apiUrl) {
    return "";
  }

  return apiUrl;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});