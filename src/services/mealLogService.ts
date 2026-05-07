import * as SQLite from "expo-sqlite";

export type MealType = "CAFE_DA_MANHA" | "ALMOCO" | "JANTAR" | "LANCHE";

export const mealTypeLabels: Record<MealType, string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO: "Almoço",
  JANTAR: "Jantar",
  LANCHE: "Lanche",
};

export const HEART_MULTIPLIERS = [0.5, 1, 2] as const;

export type MealFoodEntry = {
  id: string;
  title: string;
  group: string;
  imageUri: string | null;
  heartColor?: string;
  quantity: number;
  unit: string;
  medidaCaseira?: string;
  heartQuantity: number;
  createdAt?: number;
};

export type MealRecord = {
  id: string;
  mealType: MealType;
  mealLabel: string;
  foods: MealFoodEntry[];
  totalHeartQuantity: number;
  createdAt: number;
  updatedAt: number;
};

type MealRecordRow = {
  id: string;
  mealType: MealType;
  mealLabel: string;
  foodsJson: string;
  totalHeartQuantity: number;
  createdAt: number;
  updatedAt: number;
};

type SaveMealRecordInput = {
  mealType: MealType;
  foods: MealFoodEntry[];
  createdAt?: number;
};

const DATABASE_NAME = "dica-br-meals.db";
const TABLE_NAME = "meal_records";
const DEFAULT_LIMIT = 100;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  const database = await databasePromise;

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id TEXT PRIMARY KEY NOT NULL,
      mealType TEXT NOT NULL,
      mealLabel TEXT NOT NULL,
      foodsJson TEXT NOT NULL,
      totalHeartQuantity REAL NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  return database;
}

function normalizeLimit(limit?: number) {
  if (!limit || Number.isNaN(limit) || limit <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.floor(limit);
}

function createRecordId() {
  return `meal:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function toRow(record: MealRecord): MealRecordRow {
  return {
    id: record.id,
    mealType: record.mealType,
    mealLabel: record.mealLabel,
    foodsJson: JSON.stringify(record.foods),
    totalHeartQuantity: record.totalHeartQuantity,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function fromRow(row: MealRecordRow): MealRecord {
  let foods: MealFoodEntry[] = [];

  try {
    const parsedFoods = JSON.parse(row.foodsJson) as unknown;

    if (Array.isArray(parsedFoods)) {
      foods = parsedFoods
        .map((entry) => {
          if (!entry || typeof entry !== "object") {
            return null;
          }

          const candidate = entry as Partial<MealFoodEntry>;

          if (!candidate.id || !candidate.title) {
            return null;
          }

          return {
            id: String(candidate.id),
            title: String(candidate.title),
            group: String(candidate.group ?? ""),
            imageUri: candidate.imageUri ?? null,
            heartColor: typeof candidate.heartColor === "string" ? candidate.heartColor : undefined,
            quantity: typeof candidate.quantity === "number" ? candidate.quantity : Number(candidate.quantity ?? 0),
            unit: String(candidate.unit ?? ""),
            medidaCaseira: typeof candidate.medidaCaseira === "string" && candidate.medidaCaseira ? candidate.medidaCaseira : undefined,
            heartQuantity: typeof candidate.heartQuantity === "number" ? candidate.heartQuantity : Number(candidate.heartQuantity ?? 0),
            createdAt: typeof candidate.createdAt === "number" ? candidate.createdAt : undefined,
          };
        })
        .filter(Boolean) as MealFoodEntry[];
    }
  } catch {
    foods = [];
  }

  return {
    id: row.id,
    mealType: row.mealType,
    mealLabel: row.mealLabel,
    foods,
    totalHeartQuantity: row.totalHeartQuantity,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function formatMealTypeLabel(mealType: MealType) {
  return mealTypeLabels[mealType] ?? mealType;
}

export function formatHeartQuantity(value: number) {
  const normalizedValue = Number.isFinite(value) ? value : 0;

  if (normalizedValue === 1) {
    return "1 coração";
  }

  if (normalizedValue === 0.5) {
    return "0.5 coração";
  }

  return `${normalizedValue} corações`;
}

export function formatFoodBaseQuantity(quantity: number, unit: string) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return unit ? `Quantidade não informada • ${unit}` : "Quantidade não informada";
  }

  const formattedQuantity = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1).replace(/\.0$/, "");
  return unit ? `${formattedQuantity} ${unit}` : formattedQuantity;
}

export function getMealRecordSubtitle(record: MealRecord) {
  const date = new Date(record.createdAt);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function saveMealRecord(input: SaveMealRecordInput) {
  const foods = input.foods.filter((food) => food.title.trim());

  if (foods.length === 0) {
    throw new Error("Selecione ao menos um alimento para salvar a refeição.");
  }

  const database = await getDatabase();
  const createdAt = input.createdAt ?? Date.now();
  const updatedAt = Date.now();
  const totalHeartQuantity = foods.reduce((sum, food) => sum + (Number.isFinite(food.heartQuantity) ? food.heartQuantity : 0), 0);
  const record: MealRecord = {
    id: createRecordId(),
    mealType: input.mealType,
    mealLabel: formatMealTypeLabel(input.mealType),
    foods,
    totalHeartQuantity,
    createdAt,
    updatedAt,
  };
  const row = toRow(record);

  await database.runAsync(
    `
      INSERT INTO ${TABLE_NAME} (id, mealType, mealLabel, foodsJson, totalHeartQuantity, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [row.id, row.mealType, row.mealLabel, row.foodsJson, row.totalHeartQuantity, row.createdAt, row.updatedAt],
  );

  return record;
}

export async function getMealRecords(limit = DEFAULT_LIMIT) {
  const database = await getDatabase();
  const rows = await database.getAllAsync<MealRecordRow>(
    `
      SELECT id, mealType, mealLabel, foodsJson, totalHeartQuantity, createdAt, updatedAt
      FROM ${TABLE_NAME}
      ORDER BY createdAt DESC
      LIMIT ?
    `,
    [normalizeLimit(limit)],
  );

  return rows.map(fromRow);
}

export async function deleteMealRecord(id: string) {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
}
