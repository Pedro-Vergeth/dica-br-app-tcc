import axios from "axios";

import { apiClient, resolveApiBaseUrl } from "./apiClient";

export type ApiFoodItem = {
  nomePrincipal: string;
  grupoAlimentar: string;
  imagem64: string;
  qtdParaUmCoracao?: number;
  unidade?: string;
  unidadeMedidaCaseira?: string;
  qtdMedidaCaseira?: number;
};

type ApiFoodResponseItem = Partial<{
  nomePrincipal: string;
  grupoAlimentar: string;
  imagem64: string;
  file64: string;
  unidade: string;
  qtdParaUmCoracao: number;
  unidadeMedidaCaseira: string;
  qtdMedidaCaseira: number;
}>;

function normalizeFoodItem(item: ApiFoodResponseItem): ApiFoodItem | null {
  const nomePrincipal = item.nomePrincipal ?? "";
  const grupoAlimentar = item.grupoAlimentar ?? "";
  const imagem64 = item.imagem64 ?? item.file64 ?? "";

  if (!nomePrincipal || !grupoAlimentar || !imagem64) {
    return null;
  }

  return {
    nomePrincipal,
    grupoAlimentar,
    imagem64,
    qtdParaUmCoracao: item.qtdParaUmCoracao ?? undefined,
    unidade: item.unidade ?? "",
    unidadeMedidaCaseira: item.unidadeMedidaCaseira ?? undefined,
    qtdMedidaCaseira: item.qtdMedidaCaseira ?? undefined,
  };
}

export async function fetchGameFoods(): Promise<ApiFoodItem[]> {
  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    return [];
  }

  const endpoint = "/alimento/pegar-alimentos-aleatorios";

  try {
    const { data: payload } = await apiClient.get<unknown>(endpoint);

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

    if (candidateList.length === 0) {
      return [];
    }

    return candidateList
      .map((item) => normalizeFoodItem(item as ApiFoodResponseItem))
      .filter((item): item is ApiFoodItem => Boolean(item));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.status ? `HTTP ${error.response.status}` : error.message);
    }

    throw error;
  }
}
