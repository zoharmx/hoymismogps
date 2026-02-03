import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  birthCharts, 
  InsertBirthChart, 
  BirthChart,
  mazalAnalyses,
  InsertMazalAnalysis,
  MazalAnalysis,
  reports,
  InsertReport,
  Report,
  compatibilityAnalyses,
  InsertCompatibilityAnalysis,
  CompatibilityAnalysis
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Birth Charts
// ============================================================================

export async function createBirthChart(chart: InsertBirthChart): Promise<BirthChart> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(birthCharts).values(chart);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(birthCharts).where(eq(birthCharts.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getBirthChartById(id: number): Promise<BirthChart | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(birthCharts).where(eq(birthCharts.id, id)).limit(1);
  return result[0];
}

export async function getBirthChartsByUserId(userId: number): Promise<BirthChart[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(birthCharts).where(eq(birthCharts.userId, userId)).orderBy(desc(birthCharts.createdAt));
}

export async function updateBirthChart(id: number, updates: Partial<InsertBirthChart>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(birthCharts).set(updates).where(eq(birthCharts.id, id));
}

export async function deleteBirthChart(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(birthCharts).where(eq(birthCharts.id, id));
}

// ============================================================================
// Mazal Analyses
// ============================================================================

export async function createMazalAnalysis(analysis: InsertMazalAnalysis): Promise<MazalAnalysis> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(mazalAnalyses).values(analysis);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(mazalAnalyses).where(eq(mazalAnalyses.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getMazalAnalysisByChartId(chartId: number): Promise<MazalAnalysis | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(mazalAnalyses).where(eq(mazalAnalyses.birthChartId, chartId)).limit(1);
  return result[0];
}

// ============================================================================
// Reports
// ============================================================================

export async function createReport(report: InsertReport): Promise<Report> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(reports).values(report);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(reports).where(eq(reports.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getReportsByUserId(userId: number): Promise<Report[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(reports).where(eq(reports.userId, userId)).orderBy(desc(reports.generatedAt));
}

export async function incrementReportDownloadCount(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const report = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  if (report[0]) {
    await db.update(reports).set({ downloadCount: (report[0].downloadCount || 0) + 1 }).where(eq(reports.id, id));
  }
}

// ============================================================================
// Compatibility Analyses
// ============================================================================

export async function createCompatibilityAnalysis(analysis: InsertCompatibilityAnalysis): Promise<CompatibilityAnalysis> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(compatibilityAnalyses).values(analysis);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(compatibilityAnalyses).where(eq(compatibilityAnalyses.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getCompatibilityAnalysesByUserId(userId: number): Promise<CompatibilityAnalysis[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(compatibilityAnalyses).where(eq(compatibilityAnalyses.userId, userId)).orderBy(desc(compatibilityAnalyses.createdAt));
}
