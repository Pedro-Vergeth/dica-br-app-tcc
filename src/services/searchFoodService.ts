import { apiClient, resolveApiBaseUrl } from "./apiClient";
import type { ApiFoodItem } from "./gameFoodService";

function resolveHeartColor(grupoAlimentar: string) {
  const normalized = grupoAlimentar
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("VERDE")) {
    return "#4BB05B";
  }

  if (normalized.includes("AZUL")) {
    return "#0F5F9A";
  }

  if (normalized.includes("AMARELO")) {
    return "#F7C300";
  }

  if (normalized.startsWith("#") || normalized.startsWith("RGB")) {
    return grupoAlimentar.trim();
  }

  return "#C6C6C6";
}

export type SearchFoodItem = ApiFoodItem & {
  heartColor: string;
  [key: string]: unknown;
  sinonimos?: string | string[];
  porcao?: string;
  medidaCaseira?: string;
  medidacaseira?: string;
  textoInformativo?: string;
};

export async function fetchSearchFoods(buscaLivre: string): Promise<SearchFoodItem[]> {
  const normalizedSearch = buscaLivre.trim();

  if (!normalizedSearch) {
    return [];
  }

  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    console.log("[searchFoodService] EXPO_PUBLIC_API_URL is missing");
    return [];
  }

  const endpoint = "alimento/busca";
  console.log("[searchFoodService] GET", endpoint, { buscaLivre: normalizedSearch });

  try {
    const { data: payload } = await apiClient.get<unknown>(endpoint, {
      params: { buscaLivre: normalizedSearch },
    });

    console.log("[searchFoodService] raw response", payload);    const candidateList = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { data?: unknown })?.data)
        ? (payload as { data: unknown[] }).data
        : Array.isArray((payload as { content?: unknown })?.content)
          ? (payload as { content: unknown[] }).content
          : Array.isArray((payload as { items?: unknown })?.items)
            ? (payload as { items: unknown[] }).items
            : Array.isArray((payload as { results?: unknown })?.results)
              ? (payload as { results: unknown[] }).results
              : [];

    if (candidateList.length === 0) {
      console.log("[searchFoodService] response is not an array");
      return [];
    }

    const foods = candidateList
      .map((item) => {
        const candidate = item as Partial<ApiFoodItem> & Partial<{ name: string; file64: string }>;

        const nomePrincipal = candidate.nomePrincipal ?? candidate.name ?? "";
        const grupoAlimentar = candidate.grupoAlimentar ?? "";
        const imagem64 = candidate.imagem64 ?? candidate.file64 ?? "";

        if (!nomePrincipal || !grupoAlimentar || !imagem64) {
          return null;
        }

        return {
          ...candidate,
          nomePrincipal,
          grupoAlimentar,
          imagem64,
          heartColor: resolveHeartColor(grupoAlimentar),
        } satisfies SearchFoodItem;
      })
      .filter((item): item is SearchFoodItem => Boolean(item)) as SearchFoodItem[];

    console.log("[searchFoodService] normalized foods count", foods.length);

    return foods;
  } catch (error) {
    if (error && typeof error === "object" && "isAxiosError" in error) {
      console.log("[searchFoodService] axios error", {
        message: (error as { message?: string }).message,
        status: (error as { response?: { status?: number } }).response?.status,
        data: (error as { response?: { data?: unknown } }).response?.data,
        url: (error as { config?: { baseURL?: string; url?: string } }).config?.baseURL
          ? `${(error as { config?: { baseURL?: string; url?: string } }).config?.baseURL}${(error as { config?: { baseURL?: string; url?: string } }).config?.url ?? ""}`
          : (error as { config?: { url?: string } }).config?.url,
      });
      const responseStatus = (error as { response?: { status?: number } }).response?.status;
      const message = (error as { message?: string }).message ?? "Erro ao buscar alimentos.";

      throw new Error(responseStatus ? `HTTP ${responseStatus}` : message);
    }

    console.log("[searchFoodService] unknown error", error);
    throw error;
  }
}