import axios from "axios";
import { Platform } from "react-native";

export function resolveApiBaseUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    return "";
  }

  return Platform.OS === "android" ? apiUrl.replace("localhost", "10.0.2.2") : apiUrl;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});