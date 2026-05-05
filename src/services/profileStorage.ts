import * as SQLite from "expo-sqlite";

export type ProfileInput = {
  age: number;
  height: number;
  weight: number;
};

export type ProfileClassification =
  | "Baixo Peso"
  | "Eutrofia"
  | "Sobrepeso"
  | "Obesidade"
  | "Excesso de Peso";

export type ProfileObjective = "Ganhar peso" | "Manter peso" | "Perder peso";

export type ProfileGoalPlan = {
  calorieTierLabel: string;
  calories: number;
  greenCount: number;
  yellowCount: number;
  blueCount: number;
};

export type ProfileSummary = {
  age: number;
  height: number;
  weight: number;
  bmi: number;
  classification: ProfileClassification;
  objective: ProfileObjective;
  calorieGoal: number;
  goalPlan: ProfileGoalPlan;
  updatedAt: number;
};

type ProfileRow = {
  id: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  classification: ProfileClassification;
  objective: ProfileObjective;
  calorieGoal: number;
  calorieTierLabel: string;
  greenCount: number;
  yellowCount: number;
  blueCount: number;
  updatedAt: number;
};

const DATABASE_NAME = "dica-br-profile.db";
const TABLE_NAME = "profile_summary";
const CURRENT_PROFILE_ID = "current";

const caloriePlans: Array<Pick<ProfileGoalPlan, "calorieTierLabel" | "greenCount" | "yellowCount" | "blueCount"> & { maxCalories: number }> = [
  { maxCalories: 1300, calorieTierLabel: "Até 1200 kcal", greenCount: 3, yellowCount: 2, blueCount: 1 },
  { maxCalories: 1500, calorieTierLabel: "Em torno de 1400 kcal", greenCount: 4, yellowCount: 2, blueCount: 1 },
  { maxCalories: 1700, calorieTierLabel: "Em torno de 1600 kcal", greenCount: 5, yellowCount: 3, blueCount: 1 },
  { maxCalories: 1900, calorieTierLabel: "Em torno de 1800 kcal", greenCount: 5, yellowCount: 3, blueCount: 2 },
  { maxCalories: 2100, calorieTierLabel: "Em torno de 2000 kcal", greenCount: 6, yellowCount: 4, blueCount: 2 },
  { maxCalories: 2300, calorieTierLabel: "Em torno de 2200 kcal", greenCount: 7, yellowCount: 4, blueCount: 2 },
  { maxCalories: Number.POSITIVE_INFINITY, calorieTierLabel: "Acima de 2400 kcal", greenCount: 8, yellowCount: 5, blueCount: 2 },
];

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  const database = await databasePromise;

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id TEXT PRIMARY KEY NOT NULL,
      age INTEGER NOT NULL,
      height REAL NOT NULL,
      weight REAL NOT NULL,
      bmi REAL NOT NULL,
      classification TEXT NOT NULL,
      objective TEXT NOT NULL,
      calorieGoal INTEGER NOT NULL,
      calorieTierLabel TEXT NOT NULL,
      greenCount INTEGER NOT NULL,
      yellowCount INTEGER NOT NULL,
      blueCount INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  return database;
}

function normalizeNumber(value: number | string) {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number(value.replace(",", "."));
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function calculateClassification(age: number, bmi: number): ProfileClassification {
  if (age < 60) {
    if (bmi < 18.5) {
      return "Baixo Peso";
    }

    if (bmi <= 24.9) {
      return "Eutrofia";
    }

    if (bmi <= 29.9) {
      return "Sobrepeso";
    }

    return "Obesidade";
  }

  if (bmi < 22) {
    return "Baixo Peso";
  }

  if (bmi <= 27) {
    return "Eutrofia";
  }

  return "Excesso de Peso";
}

function classifyObjective(classification: ProfileClassification): ProfileObjective {
  if (classification === "Baixo Peso") {
    return "Ganhar peso";
  }

  if (classification === "Eutrofia") {
    return "Manter peso";
  }

  return "Perder peso";
}

function getCalorieMultiplier(objective: ProfileObjective) {
  if (objective === "Ganhar peso") {
    return 35;
  }

  if (objective === "Manter peso") {
    return 25;
  }

  return 20;
}

function getGoalPlan(calories: number): ProfileGoalPlan {
  const plan = caloriePlans.find((candidate) => calories <= candidate.maxCalories) ?? caloriePlans[caloriePlans.length - 1];

  return {
    calorieTierLabel: plan.calorieTierLabel,
    calories,
    greenCount: plan.greenCount,
    yellowCount: plan.yellowCount,
    blueCount: plan.blueCount,
  };
}

function toSummary(row: ProfileRow): ProfileSummary {
  return {
    age: row.age,
    height: row.height,
    weight: row.weight,
    bmi: row.bmi,
    classification: row.classification,
    objective: row.objective,
    calorieGoal: row.calorieGoal,
    goalPlan: {
      calorieTierLabel: row.calorieTierLabel,
      calories: row.calorieGoal,
      greenCount: row.greenCount,
      yellowCount: row.yellowCount,
      blueCount: row.blueCount,
    },
    updatedAt: row.updatedAt,
  };
}

function toRow(summary: ProfileSummary): ProfileRow {
  return {
    id: CURRENT_PROFILE_ID,
    age: summary.age,
    height: summary.height,
    weight: summary.weight,
    bmi: summary.bmi,
    classification: summary.classification,
    objective: summary.objective,
    calorieGoal: summary.calorieGoal,
    calorieTierLabel: summary.goalPlan.calorieTierLabel,
    greenCount: summary.goalPlan.greenCount,
    yellowCount: summary.goalPlan.yellowCount,
    blueCount: summary.goalPlan.blueCount,
    updatedAt: summary.updatedAt,
  };
}

export function calculateProfileSummary(input: ProfileInput): ProfileSummary {
  const bmi = roundToOneDecimal(input.weight / (input.height * input.height));
  const classification = calculateClassification(input.age, bmi);
  const objective = classifyObjective(classification);
  const calorieGoal = Math.round(input.weight * getCalorieMultiplier(objective));
  const goalPlan = getGoalPlan(calorieGoal);

  return {
    age: input.age,
    height: input.height,
    weight: input.weight,
    bmi,
    classification,
    objective,
    calorieGoal,
    goalPlan,
    updatedAt: Date.now(),
  };
}

export async function loadProfileSummary(): Promise<ProfileSummary | null> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<ProfileRow>(
    `
      SELECT id, age, height, weight, bmi, classification, objective, calorieGoal, calorieTierLabel, greenCount, yellowCount, blueCount, updatedAt
      FROM ${TABLE_NAME}
      WHERE id = ?
      LIMIT 1
    `,
    [CURRENT_PROFILE_ID],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return toSummary(row);
}

export async function saveProfileSummary(input: ProfileInput): Promise<ProfileSummary> {
  const summary = calculateProfileSummary(input);
  const database = await getDatabase();
  const row = toRow(summary);

  await database.runAsync(
    `
      INSERT INTO ${TABLE_NAME} (id, age, height, weight, bmi, classification, objective, calorieGoal, calorieTierLabel, greenCount, yellowCount, blueCount, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        age = excluded.age,
        height = excluded.height,
        weight = excluded.weight,
        bmi = excluded.bmi,
        classification = excluded.classification,
        objective = excluded.objective,
        calorieGoal = excluded.calorieGoal,
        calorieTierLabel = excluded.calorieTierLabel,
        greenCount = excluded.greenCount,
        yellowCount = excluded.yellowCount,
        blueCount = excluded.blueCount,
        updatedAt = excluded.updatedAt
    `,
    [
      row.id,
      row.age,
      row.height,
      row.weight,
      row.bmi,
      row.classification,
      row.objective,
      row.calorieGoal,
      row.calorieTierLabel,
      row.greenCount,
      row.yellowCount,
      row.blueCount,
      row.updatedAt,
    ],
  );

  return summary;
}

export function parseProfileInput(values: { age: string; height: string; weight: string }) {
  const rawAge = normalizeNumber(values.age);
  const height = normalizeNumber(values.height);
  const weight = normalizeNumber(values.weight);

  return {
    age: Number.isFinite(rawAge) ? Math.floor(rawAge) : Number.NaN,
    height,
    weight,
  };
}
