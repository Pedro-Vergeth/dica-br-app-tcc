import { apiClient, resolveApiBaseUrl } from "./apiClient";

export type RecipeItem = {
  id: string;
  titulo: string;
  tipoRefeicao: string;
  tempoPreparoMinutos: number | null;
  porcao: string;
  rendimento: string;
  grupoAlimentar: string;
  ingredientes: string;
  modoPreparo: string;
  imagem64: string;
  estado: string;
};

export type RecipeSortOption = "recentes" | "menorTempo" | "maiorTempo" | "tituloAZ";

export type FetchRecipesParams = {
  page?: number;
  size?: number;
  buscaLivre?: string;
  tipoRefeicao?: string;
  grupoAlimentar?: string;
  estadoId?: number | string;
  estado?: string;
  sort?: RecipeSortOption | null;
};

export function normalizeRecipeItem(item: RecipeResponseItem): RecipeItem | null {
  return toRecipeItem(item);
}

type RecipeResponseItem = Partial<{
  id: number | string;
  titulo: string;
  tipoRefeicao: string;
  tempoPreparoMinutos: number | string;
  porcao: string;
  rendimento: string;
  grupoAlimentar: string;
  ingredientes: string;
  modoPreparo: string;
  imagem64: string;
  file64: string;
  estado: string;
}>;

function toRecipeItem(item: RecipeResponseItem): RecipeItem | null {
  const id = item.id;
  const titulo = item.titulo ?? "";
  const tipoRefeicao = item.tipoRefeicao ?? "";
  const grupoAlimentar = item.grupoAlimentar ?? "";
  const ingredientes = item.ingredientes ?? "";
  const modoPreparo = item.modoPreparo ?? "";
  const imagem64 = item.imagem64 ?? item.file64 ?? "";
  const estado = item.estado ?? "";
  const rendimento = item.rendimento ?? "";

  if (id === undefined || !titulo || !tipoRefeicao || !grupoAlimentar || !imagem64) {
    return null;
  }

  const tempoPreparoMinutos = typeof item.tempoPreparoMinutos === "string" ? Number(item.tempoPreparoMinutos) : item.tempoPreparoMinutos ?? null;

  return {
    id: String(id),
    titulo,
    tipoRefeicao,
    tempoPreparoMinutos: Number.isFinite(tempoPreparoMinutos as number) ? Number(tempoPreparoMinutos) : null,
    porcao: item.porcao ?? "",
    rendimento,
    grupoAlimentar,
    ingredientes,
    modoPreparo,
    imagem64,
    estado,
  };
}

function readRecipeList(payload: unknown): RecipeResponseItem[] {
  if (Array.isArray(payload)) {
    return payload as RecipeResponseItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { content?: unknown; data?: unknown; items?: unknown; results?: unknown };

    if (Array.isArray(candidate.content)) {
      return candidate.content as RecipeResponseItem[];
    }

    if (Array.isArray(candidate.data)) {
      return candidate.data as RecipeResponseItem[];
    }

    if (Array.isArray(candidate.items)) {
      return candidate.items as RecipeResponseItem[];
    }

    if (Array.isArray(candidate.results)) {
      return candidate.results as RecipeResponseItem[];
    }
  }

  return [];
}

function buildSortParam(sort?: RecipeSortOption | null) {
  switch (sort) {
    case "menorTempo":
      return "tempoPreparoMinutos,asc";
    case "maiorTempo":
      return "tempoPreparoMinutos,desc";
    case "tituloAZ":
      return "titulo,asc";
    case "recentes":
    default:
      return "id,desc";
  }
}

export async function fetchRecipes(params: FetchRecipesParams = {}): Promise<RecipeItem[]> {
  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is missing");
  }

  const page = Math.max(0, params.page ?? 0);
  const size = Math.max(1, params.size ?? 10);
  const estadoId = params.estadoId === undefined || params.estadoId === null ? undefined : Number(params.estadoId);
  const hasEstadoId = estadoId !== undefined && Number.isInteger(estadoId) && estadoId > 0;
  const endpoint = hasEstadoId ? "receita/regiao" : "receita";

  const response = await apiClient.get<unknown>(endpoint, {
    params: {
      page,
      size,
      buscaLivre: params.buscaLivre?.trim() || undefined,
      tipoRefeicao: params.tipoRefeicao?.trim() || undefined,
      grupoAlimentar: params.grupoAlimentar?.trim() || undefined,
      ...(hasEstadoId ? { estado_id: estadoId } : {}),
      estado: params.estado?.trim() || undefined,
      sort: buildSortParam(params.sort),
    },
  });

  const list = readRecipeList(response.data);
  return list.map(toRecipeItem).filter((item): item is RecipeItem => Boolean(item));
}

export async function fetchRecipeById(recipeId: string): Promise<RecipeItem | null> {
  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is missing");
  }

  const response = await apiClient.get<unknown>(`receita/${encodeURIComponent(recipeId)}`);
  const payload = response.data;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const candidate = payload as { data?: unknown; content?: unknown; items?: unknown; results?: unknown };

    if (candidate.data && typeof candidate.data === "object") {
      return toRecipeItem(candidate.data as RecipeResponseItem);
    }

    if (candidate.content && typeof candidate.content === "object") {
      return toRecipeItem(candidate.content as RecipeResponseItem);
    }

    if (candidate.items && typeof candidate.items === "object") {
      return toRecipeItem(candidate.items as RecipeResponseItem);
    }

    if (candidate.results && typeof candidate.results === "object") {
      return toRecipeItem(candidate.results as RecipeResponseItem);
    }

    return toRecipeItem(payload as RecipeResponseItem);
  }

  if (Array.isArray(payload)) {
    return toRecipeItem(payload[0] as RecipeResponseItem) ?? null;
  }

  return null;
}