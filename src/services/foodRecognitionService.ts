import axios from "axios";

import { resolveApiBaseUrl } from "./apiClient";

type FoodRecognitionResponse =
  | string
  | {
      nomePrincipal?: string;
      name?: string;
      alimento?: string;
      texto?: string;
      nome?: string;
      label?: string;
      foodName?: string;
      recognizedName?: string;
      nomeAlimento?: string;
      alimentoReconhecido?: string;
      data?: unknown;
      result?: unknown;
      resultado?: unknown;
      message?: unknown;
    }
  | { data?: unknown };

const RECOGNIZED_NAME_KEYS = [
  "nomePrincipal",
  "name",
  "alimento",
  "texto",
  "nome",
  "label",
  "foodName",
  "recognizedName",
  "nomeAlimento",
  "alimentoReconhecido",
] as const;

const FALLBACK_CONTAINER_KEYS = ["data", "result", "resultado", "message"] as const;
const UNKNOWN_FOOD_SENTINEL = "ALIMENTO DESCONHECIDO";

function readStringCandidate(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isUnknownFood(value: string) {
  return value.trim().toUpperCase() === UNKNOWN_FOOD_SENTINEL;
}

function readRecognizedName(payload: unknown, depth = 0): string {
  if (depth > 4 || payload == null) {
    return "";
  }

  if (typeof payload === "string") {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const recognizedName = readRecognizedName(item, depth + 1);

      if (recognizedName) {
        return recognizedName;
      }
    }

    return "";
  }

  if (typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;

  for (const key of RECOGNIZED_NAME_KEYS) {
    const candidate = readStringCandidate(record[key]);

    if (candidate) {
      return candidate;
    }
  }

  for (const key of FALLBACK_CONTAINER_KEYS) {
    const nestedValue = record[key];

    if (!nestedValue) {
      continue;
    }

    const nestedCandidate = readRecognizedName(nestedValue, depth + 1);

    if (nestedCandidate) {
      return nestedCandidate;
    }
  }

  for (const value of Object.values(record)) {
    const nestedCandidate = readRecognizedName(value, depth + 1);

    if (nestedCandidate) {
      return nestedCandidate;
    }
  }

  return "";
}

export async function recognizeFoodFromImage(imageUri: string): Promise<string> {
  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is missing");
  }

  const formData = new FormData();
  formData.append("imagem", {
    uri: imageUri,
    name: "food.png",
    type: "image/png",
  } as unknown as Blob);

  const endpoint = "ia";

  try {
    const { data: payload } = await axios.post<FoodRecognitionResponse>(`${baseUrl}/${endpoint}`, formData, {
      timeout: 60000,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const recognizedName = readRecognizedName(payload);

    if (!recognizedName) {
      throw new Error("Alimento não identificado");
    }

    if (isUnknownFood(recognizedName)) {
      throw new Error("Alimento desconhecido");
    }

    return recognizedName;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.status ? `HTTP ${error.response.status}` : error.message || "Alimento não identificado");
    }

    throw error instanceof Error ? error : new Error("Alimento não identificado");
  }
}
