import axios from "axios";

import { apiClient, resolveApiBaseUrl } from "./apiClient";

export type ApiFoodItem = {
  nomePrincipal: string;
  grupoAlimentar: string;
  imagem64: string;
};

type ApiFoodResponseItem = Partial<{
  nomePrincipal: string;
  grupoAlimentar: string;
  imagem64: string;
}>;

function normalizeFoodItem(item: ApiFoodResponseItem): ApiFoodItem | null {
  const nomePrincipal = item.nomePrincipal ?? "";
  const grupoAlimentar = item.grupoAlimentar ?? "";
  const imagem64 = item.imagem64 ?? "";

  if (!nomePrincipal || !grupoAlimentar || !imagem64) {
    return null;
  }

  return {
    nomePrincipal,
    grupoAlimentar,
    imagem64,
  };
}

export async function fetchGameFoods(): Promise<ApiFoodItem[]> {
  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    console.log("[gameFoodService] EXPO_PUBLIC_API_URL is missing");
    return [];
  }

  const endpoint = "/alimento/pegar-alimentos-aleatorios";
  console.log("[gameFoodService] GET", endpoint);

  try {
    const { data: payload } = await apiClient.get<unknown>(endpoint);

    console.log("[gameFoodService] raw response", payload);

    if (!Array.isArray(payload)) {
      console.log("[gameFoodService] response is not an array");
      return [];
    }

    const foods = payload.map((item) => normalizeFoodItem(item as ApiFoodResponseItem)).filter((item): item is ApiFoodItem => Boolean(item));
    console.log("[gameFoodService] normalized foods count", foods.length);

    return foods;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("[gameFoodService] axios error", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.baseURL ? `${error.config.baseURL}${error.config.url ?? ""}` : error.config?.url,
      });
      throw new Error(error.response?.status ? `HTTP ${error.response.status}` : error.message);
    }

    console.log("[gameFoodService] unknown error", error);
    throw error;
  }
}
