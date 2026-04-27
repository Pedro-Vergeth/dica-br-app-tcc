import { apiClient, resolveApiBaseUrl } from "./apiClient";

export type RecipeItem = {
  id: string;
  titulo: string;
  tipoRefeicao: string;
  tempoPreparoMinutos: number | null;
  porcao: string;
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
  sort?: RecipeSortOption | null;
};

type RecipeResponseItem = Partial<{
  id: number | string;
  titulo: string;
  tipoRefeicao: string;
  tempoPreparoMinutos: number | string;
  porcao: string;
  grupoAlimentar: string;
  ingredientes: string;
  modoPreparo: string;
  imagem64: string;
  estado: string;
}>;

function toRecipeItem(item: RecipeResponseItem): RecipeItem | null {
  const id = item.id;
  const titulo = item.titulo ?? "";
  const tipoRefeicao = item.tipoRefeicao ?? "";
  const grupoAlimentar = item.grupoAlimentar ?? "";
  const ingredientes = item.ingredientes ?? "";
  const modoPreparo = item.modoPreparo ?? "";
  const imagem64 = item.imagem64 ?? "";
  const estado = item.estado ?? "";

  if (id === undefined || !titulo || !tipoRefeicao || !grupoAlimentar || !ingredientes || !modoPreparo || !imagem64 || !estado) {
    return null;
  }

  const tempoPreparoMinutos = typeof item.tempoPreparoMinutos === "string" ? Number(item.tempoPreparoMinutos) : item.tempoPreparoMinutos ?? null;

  return {
    id: String(id),
    titulo,
    tipoRefeicao,
    tempoPreparoMinutos: Number.isFinite(tempoPreparoMinutos as number) ? Number(tempoPreparoMinutos) : null,
    porcao: item.porcao ?? "",
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

  const response = await apiClient.get<unknown>("receita", {
    params: {
      page,
      size,
      buscaLivre: params.buscaLivre?.trim() || undefined,
      tipoRefeicao: params.tipoRefeicao?.trim() || undefined,
      grupoAlimentar: params.grupoAlimentar?.trim() || undefined,
      sort: buildSortParam(params.sort),
    },
  });

  const list = readRecipeList(response.data);
  return list.map(toRecipeItem).filter((item): item is RecipeItem => Boolean(item));
}