import * as SQLite from "expo-sqlite";

export type RecentHistoryScreenKey = "search" | "recipes";
export type RecentHistoryKind = "query" | "item";

export type RecentHistoryEntry = {
  id: string;
  screenKey: RecentHistoryScreenKey;
  kind: RecentHistoryKind;
  title: string;
  subtitle: string | null;
  imageUri: string | null;
  payload: Record<string, unknown> | null;
  updatedAt: number;
};

type RecentHistoryRow = {
  id: string;
  screenKey: RecentHistoryScreenKey;
  kind: RecentHistoryKind;
  title: string;
  subtitle: string | null;
  imageUri: string | null;
  payloadJson: string | null;
  updatedAt: number;
};

type SaveRecentHistoryInput = {
  id: string;
  kind: RecentHistoryKind;
  title: string;
  subtitle?: string | null;
  imageUri?: string | null;
  payload?: Record<string, unknown> | null;
};

const DATABASE_NAME = "dica-br-history.db";
const TABLE_NAME = "recent_history";
const DEFAULT_LIMIT = 20;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  const database = await databasePromise;

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id TEXT PRIMARY KEY NOT NULL,
      screenKey TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      imageUri TEXT,
      payloadJson TEXT,
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

function toRow(entry: RecentHistoryEntry): RecentHistoryRow {
  return {
    id: entry.id,
    screenKey: entry.screenKey,
    kind: entry.kind,
    title: entry.title,
    subtitle: entry.subtitle,
    imageUri: entry.imageUri,
    payloadJson: entry.payload ? JSON.stringify(entry.payload) : null,
    updatedAt: entry.updatedAt,
  };
}

function fromRow(row: RecentHistoryRow): RecentHistoryEntry {
  let payload: Record<string, unknown> | null = null;

  if (typeof row.payloadJson === "string" && row.payloadJson.trim()) {
    try {
      const parsed = JSON.parse(row.payloadJson) as unknown;

      if (parsed && typeof parsed === "object") {
        payload = parsed as Record<string, unknown>;
      }
    } catch {
      payload = null;
    }
  }

  return {
    id: row.id,
    screenKey: row.screenKey,
    kind: row.kind,
    title: row.title,
    subtitle: row.subtitle,
    imageUri: row.imageUri,
    payload,
    updatedAt: row.updatedAt,
  };
}

async function trimHistory(screenKey: RecentHistoryScreenKey, limit: number) {
  const database = await getDatabase();

  await database.runAsync(
    `
      DELETE FROM ${TABLE_NAME}
      WHERE screenKey = ?
        AND id NOT IN (
          SELECT id
          FROM ${TABLE_NAME}
          WHERE screenKey = ?
          ORDER BY updatedAt DESC
          LIMIT ?
        )
    `,
    [screenKey, screenKey, limit],
  );
}

export async function saveRecentHistoryEntry(
  screenKey: RecentHistoryScreenKey,
  input: SaveRecentHistoryInput,
  limit = DEFAULT_LIMIT,
) {
  const title = input.title.trim();

  if (!title) {
    return;
  }

  const database = await getDatabase();
  const updatedAt = Date.now();
  const row = toRow({
    id: input.id,
    screenKey,
    kind: input.kind,
    title,
    subtitle: input.subtitle ?? null,
    imageUri: input.imageUri ?? null,
    payload: input.payload ?? null,
    updatedAt,
  });

  await database.runAsync(
    `
      INSERT INTO ${TABLE_NAME} (id, screenKey, kind, title, subtitle, imageUri, payloadJson, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        screenKey = excluded.screenKey,
        kind = excluded.kind,
        title = excluded.title,
        subtitle = excluded.subtitle,
        imageUri = excluded.imageUri,
        payloadJson = excluded.payloadJson,
        updatedAt = excluded.updatedAt
    `,
    [row.id, row.screenKey, row.kind, row.title, row.subtitle, row.imageUri, row.payloadJson, row.updatedAt],
  );

  await trimHistory(screenKey, normalizeLimit(limit));
}

export async function getRecentHistoryEntries(screenKey: RecentHistoryScreenKey, limit = DEFAULT_LIMIT) {
  const database = await getDatabase();
  const rows = await database.getAllAsync<RecentHistoryRow>(
    `
      SELECT id, screenKey, kind, title, subtitle, imageUri, payloadJson, updatedAt
      FROM ${TABLE_NAME}
      WHERE screenKey = ?
      ORDER BY updatedAt DESC
      LIMIT ?
    `,
    [screenKey, normalizeLimit(limit)],
  );

  return rows.map(fromRow);
}

export async function saveRecentSearchQuery(screenKey: RecentHistoryScreenKey, query: string) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return;
  }

  await saveRecentHistoryEntry(
    screenKey,
    {
      id: `${screenKey}:query:${normalizedQuery.toLowerCase()}`,
      kind: "query",
      title: normalizedQuery,
      subtitle: "Busca recente",
      payload: { query: normalizedQuery },
    },
    DEFAULT_LIMIT,
  );
}

export async function saveRecentAccessedItem(
  screenKey: RecentHistoryScreenKey,
  input: {
    id: string;
    title: string;
    subtitle?: string | null;
    imageUri?: string | null;
    payload?: Record<string, unknown> | null;
  },
) {
  await saveRecentHistoryEntry(
    screenKey,
    {
      id: `${screenKey}:item:${input.id}`,
      kind: "item",
      title: input.title,
      subtitle: input.subtitle ?? null,
      imageUri: input.imageUri ?? null,
      payload: input.payload ?? null,
    },
    DEFAULT_LIMIT,
  );
}
