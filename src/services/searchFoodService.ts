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
  quantidade?: number | string;
  unidade?: string;
  porcao?: string;
  porcaoPorUnidade?: string;
  porcao_por_unidade?: string;
  medidaCaseira?: string;
  medidacaseira?: string;
  textoInformativo?: string;
};

function normalizeApiPayload(payload: unknown): SearchFoodItem[] {
  const candidateList = Array.isArray(payload)
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

  if (candidateList.length === 0) return [];

  return candidateList
    .map((item) => {
      const candidate = item as Partial<ApiFoodItem> & Partial<{ name: string; file64: string; quantity: number | string; quantidade: number | string; quantidadePorUnidade: number | string; quantidade_por_unidade: number | string; unidade: string }>;
      const nomePrincipal = candidate.nomePrincipal ?? candidate.name ?? "";
      const grupoAlimentar = candidate.grupoAlimentar ?? "";
      const imagem64 = candidate.imagem64 ?? candidate.file64 ?? "";
      const quantidade = candidate.quantidade ?? candidate.quantity ?? candidate.quantidadePorUnidade ?? candidate.quantidade_por_unidade;
      const unidade = candidate.unidade ?? "";
      if (!nomePrincipal || !grupoAlimentar || !imagem64) return null;
      const porcao = candidate.porcao ?? "";
      const porcaoPorUnidade = candidate.porcaoPorUnidade ?? candidate.porcao_por_unidade ?? "";
      return {
        ...candidate,
        nomePrincipal,
        grupoAlimentar,
        imagem64,
        quantidade,
        unidade,
        porcao,
        porcaoPorUnidade,
        heartColor: resolveHeartColor(grupoAlimentar),
      } satisfies SearchFoodItem;
    })
    .filter(Boolean) as SearchFoodItem[];
}

export async function fetchFoodsByGroup(grupoAlimentar: string): Promise<SearchFoodItem[]> {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) return [];

  try {
    const { data: payload } = await apiClient.get<unknown>("alimento", {
      params: { grupoAlimentar, size: 100 },
    });
    console.log("[searchFoodService] fetchFoodsByGroup", grupoAlimentar, "count:", Array.isArray(payload) ? payload.length : "?");
    return normalizeApiPayload(payload);
  } catch (error) {
    console.log("[searchFoodService] fetchFoodsByGroup error", grupoAlimentar, error);
    return [];
  }
}

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
        const candidate = item as Partial<ApiFoodItem> & Partial<{ name: string; file64: string; quantity: number | string; quantidade: number | string; quantidadePorUnidade: number | string; quantidade_por_unidade: number | string; unidade: string }>;

        const nomePrincipal = candidate.nomePrincipal ?? candidate.name ?? "";
        const grupoAlimentar = candidate.grupoAlimentar ?? "";
        const imagem64 = candidate.imagem64 ?? candidate.file64 ?? "";
        const quantidade = candidate.quantidade ?? candidate.quantity ?? candidate.quantidadePorUnidade ?? candidate.quantidade_por_unidade;
        const unidade = candidate.unidade ?? "";

        if (!nomePrincipal || !grupoAlimentar || !imagem64) {
          return null;
        }

        const porcao = candidate.porcao ?? "";
        const porcaoPorUnidade = candidate.porcaoPorUnidade ?? candidate.porcao_por_unidade ?? "";

        return {
          ...candidate,
          nomePrincipal,
          grupoAlimentar,
          imagem64,
          quantidade,
          unidade,
          porcao,
          porcaoPorUnidade,
          heartColor: resolveHeartColor(grupoAlimentar),
        } satisfies SearchFoodItem;
      })
      .filter(Boolean) as SearchFoodItem[];

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