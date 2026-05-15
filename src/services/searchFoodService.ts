import { apiClient, resolveApiBaseUrl } from "./apiClient";
import type { ApiFoodItem } from "./gameFoodService";

function resolveHeartColor(grupoAlimentar: string) {
  const normalized = grupoAlimentar
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

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

function isRedGroup(grupoAlimentar: string) {
  const normalized = grupoAlimentar
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  return normalized.includes("VERMELHO");
}

export type SearchFoodItem = ApiFoodItem & {
  heartColor: string;
  [key: string]: unknown;
  sinonimos?: string | string[];
  textoInformativo?: string;
};

type ApiCandidate = Partial<ApiFoodItem> & Partial<{ name: string; file64: string }>;

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
      const candidate = item as ApiCandidate;
      const nomePrincipal = candidate.nomePrincipal ?? candidate.name ?? "";
      const grupoAlimentar = candidate.grupoAlimentar ?? "";
      const imagem64 = candidate.imagem64 ?? candidate.file64 ?? "";

      if (!nomePrincipal || !grupoAlimentar || !imagem64) return null;

      const raw = item as Record<string, unknown>;
      console.log("[searchFoodService] item keys:", Object.keys(raw));
      console.log("[searchFoodService] qtdMedidaCaseira:", raw["qtdMedidaCaseira"], "unidadeMedidaCaseira:", raw["unidadeMedidaCaseira"]);

      return {
        ...candidate,
        nomePrincipal,
        grupoAlimentar,
        imagem64,
        qtdParaUmCoracao: candidate.qtdParaUmCoracao ?? undefined,
        unidade: candidate.unidade ?? "",
        unidadeMedidaCaseira: candidate.unidadeMedidaCaseira ?? undefined,
        qtdMedidaCaseira: candidate.qtdMedidaCaseira ?? undefined,
        heartColor: resolveHeartColor(grupoAlimentar),
      } satisfies SearchFoodItem;
    })
    .filter(Boolean) as SearchFoodItem[];
}

export async function fetchFoodsByGroup(grupoAlimentar: string, size = 4): Promise<SearchFoodItem[]> {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) return [];

  try {
    const { data: payload } = await apiClient.get<unknown>("alimento", {
      params: { grupoAlimentar, size: Math.max(1, Math.min(4, Math.floor(size || 4))) },
    });
    return normalizeApiPayload(payload);
  } catch {
    return [];
  }
}

export async function fetchSearchFoods(
  buscaLivre: string,
  options?: { excludeRedGroup?: boolean },
): Promise<SearchFoodItem[]> {
  const normalizedSearch = buscaLivre.trim();

  if (!normalizedSearch) {
    return [];
  }

  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    return [];
  }

  try {
    const { data: payload } = await apiClient.get<unknown>("alimento/busca", {
      params: { buscaLivre: normalizedSearch },
    });

    const foods = normalizeApiPayload(payload);

    if (options?.excludeRedGroup) {
      return foods.filter((item) => !isRedGroup(item.grupoAlimentar));
    }

    return foods;
  } catch (error) {
    if (error && typeof error === "object" && "isAxiosError" in error) {
      const responseStatus = (error as { response?: { status?: number } }).response?.status;
      const message = (error as { message?: string }).message ?? "Erro ao buscar alimentos.";
      throw new Error(responseStatus ? `HTTP ${responseStatus}` : message);
    }

    throw error;
  }
}
