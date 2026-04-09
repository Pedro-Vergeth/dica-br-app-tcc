export type ApiFoodItem = {
  name: string;
  file64: string;
};

type ApiFoodResponseItem = Partial<{
  name: string;
  nome: string;
  file64: string;
  image: string;
  imageBase64: string;
}>;

function normalizeFoodItem(item: ApiFoodResponseItem): ApiFoodItem | null {
  const name = item.name ?? item.nome ?? "";
  const file64 = item.file64 ?? item.image ?? item.imageBase64 ?? "";

  if (!name || !file64) {
    return null;
  }

  return {
    name,
    file64,
  };
}

export async function fetchGameFoods(): Promise<ApiFoodItem[]> {
  const apiUrl = process.env.BACKEND_A;

  if (!apiUrl) {
    return [];
  }

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch game foods: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    return [];
  }
  console.log(payload);


  return payload.map((item) => normalizeFoodItem(item as ApiFoodResponseItem)).filter((item): item is ApiFoodItem => Boolean(item));
}
