import { apiClient, resolveApiBaseUrl } from "./apiClient";

export type EducationalVideoItem = {
  id: string;
  titulo: string;
  duracaoSegundos: number | null;
  descricao: string;
  videoUrl: string;
};

export type FetchEducationalVideosParams = {
  page?: number;
  size?: number;
};

type EducationalVideoResponseItem = Partial<{
  id: number | string;
  titulo: string;
  duracaoSegundos: number | string;
  descricao: string;
  videoUrl: string;
}>;

const VIDEO_ENDPOINTS = ["video-educativo", "videoEducativo", "videos-educativos", "video"];

function normalizePage(page?: number) {
  if (page === undefined || Number.isNaN(page) || page < 0) {
    return 0;
  }

  return Math.floor(page);
}

function normalizeSize(size?: number) {
  if (size === undefined || Number.isNaN(size) || size <= 0) {
    return 20;
  }

  return Math.floor(size);
}

function readVideoList(payload: unknown): EducationalVideoResponseItem[] {
  if (Array.isArray(payload)) {
    return payload as EducationalVideoResponseItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { content?: unknown; data?: unknown; items?: unknown; results?: unknown };

    if (Array.isArray(candidate.content)) {
      return candidate.content as EducationalVideoResponseItem[];
    }

    if (Array.isArray(candidate.data)) {
      return candidate.data as EducationalVideoResponseItem[];
    }

    if (Array.isArray(candidate.items)) {
      return candidate.items as EducationalVideoResponseItem[];
    }

    if (Array.isArray(candidate.results)) {
      return candidate.results as EducationalVideoResponseItem[];
    }
  }

  return [];
}

function toVideoItem(item: EducationalVideoResponseItem): EducationalVideoItem | null {
  const id = item.id;
  const titulo = item.titulo ?? "";
  const descricao = item.descricao ?? "";
  const videoUrl = item.videoUrl ?? "";

  if (id === undefined || !titulo || !descricao || !videoUrl) {
    return null;
  }

  const duracaoSegundos = typeof item.duracaoSegundos === "string" ? Number(item.duracaoSegundos) : item.duracaoSegundos ?? null;

  return {
    id: String(id),
    titulo,
    duracaoSegundos: Number.isFinite(duracaoSegundos as number) ? Number(duracaoSegundos) : null,
    descricao,
    videoUrl,
  };
}

export function formatVideoDuration(duracaoSegundos: number | null) {
  if (duracaoSegundos === null || duracaoSegundos < 0 || Number.isNaN(duracaoSegundos)) {
    return "Duração não informada";
  }

  const totalSeconds = Math.floor(duracaoSegundos);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${seconds}s`;
}

export async function fetchEducationalVideos(params: FetchEducationalVideosParams = {}): Promise<EducationalVideoItem[]> {
  const baseUrl = resolveApiBaseUrl();

  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is missing");
  }

  const page = normalizePage(params.page);
  const size = normalizeSize(params.size);

  let lastError: unknown = null;

  for (const endpoint of VIDEO_ENDPOINTS) {
    try {
      const response = await apiClient.get<unknown>(endpoint, {
        params: {
          page,
          size,
        },
      });

      const payload = response.data;
      const list = readVideoList(payload);

      const pagedList = Array.isArray(payload)
        ? list.slice(page * size, page * size + size)
        : list;

      const normalizedVideos = pagedList.map(toVideoItem).filter((item): item is EducationalVideoItem => Boolean(item));

      if (normalizedVideos.length > 0 || page === 0) {
        return normalizedVideos;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}

export async function fetchEducationalVideoById(id: string): Promise<EducationalVideoItem | null> {
  const normalizedId = id.trim();

  if (!normalizedId) {
    return null;
  }

  const videos = await fetchEducationalVideos();
  return videos.find((item) => item.id === normalizedId) ?? null;
}
