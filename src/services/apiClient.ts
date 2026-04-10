import axios from "axios";
import { Platform } from "react-native";

export function resolveApiBaseUrl() {
  const apiTarget = process.env.EXPO_PUBLIC_API_TARGET?.trim().toLowerCase();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const deviceApiUrl = process.env.EXPO_PUBLIC_API_URL_DEVICE?.trim();
  const androidStudioApiUrl = process.env.EXPO_PUBLIC_API_URL_ANDROID_STUDIO?.trim();

  const selectedUrl =
    apiTarget === "android-studio"
      ? androidStudioApiUrl ?? apiUrl
      : apiTarget === "device"
        ? deviceApiUrl ?? apiUrl
        : Platform.OS === "android"
          ? deviceApiUrl ?? androidStudioApiUrl ?? apiUrl
          : deviceApiUrl ?? apiUrl ?? androidStudioApiUrl;

  if (!selectedUrl) {
    return "";
  }

  return selectedUrl;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});