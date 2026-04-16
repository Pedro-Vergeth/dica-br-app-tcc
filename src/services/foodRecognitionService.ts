import axios from "axios";

import { resolveApiBaseUrl } from "./apiClient";

type FoodRecognitionResponse =
  | string
  | {
      nomePrincipal?: string;
      name?: string;
      alimento?: string;
      texto?: string;
      data?: unknown;
      result?: unknown;
      message?: unknown;
    }
  | { data?: unknown };

function readRecognizedName(payload: FoodRecognitionResponse): string {
  if (typeof payload === "string") {
    return payload.trim();
  }

  const candidate =
    (typeof payload === "object" && payload !== null && "nomePrincipal" in payload && typeof payload.nomePrincipal === "string" && payload.nomePrincipal) ||
    (typeof payload === "object" && payload !== null && "name" in payload && typeof payload.name === "string" && payload.name) ||
    (typeof payload === "object" && payload !== null && "alimento" in payload && typeof payload.alimento === "string" && payload.alimento) ||
    (typeof payload === "object" && payload !== null && "texto" in payload && typeof payload.texto === "string" && payload.texto);

  if (candidate) {
    return candidate.trim();
  }

  const nestedData = (typeof payload === "object" && payload !== null && "data" in payload ? payload.data : undefined) as unknown;

  if (typeof nestedData === "string") {
    return nestedData.trim();
  }

  if (nestedData && typeof nestedData === "object") {
    const nestedCandidate = nestedData as Record<string, unknown>;
    const nestedName = nestedCandidate.nomePrincipal ?? nestedCandidate.name ?? nestedCandidate.alimento ?? nestedCandidate.texto;

    if (typeof nestedName === "string") {
      return nestedName.trim();
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

    return recognizedName;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.status ? `HTTP ${error.response.status}` : error.message || "Alimento não identificado");
    }

    throw error instanceof Error ? error : new Error("Alimento não identificado");
  }
}
