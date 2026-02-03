import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabla de cartas natales cabalísticas
 * Almacena información completa de análisis astrológico hebreo
 */
export const birthCharts = mysqlTable("birthCharts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Información personal
  personName: varchar("personName", { length: 255 }),
  
  // Fecha gregoriana
  gregorianDate: timestamp("gregorianDate").notNull(),
  gregorianYear: int("gregorianYear").notNull(),
  gregorianMonth: int("gregorianMonth").notNull(),
  gregorianDay: int("gregorianDay").notNull(),
  
  // Hora de nacimiento
  birthHour: int("birthHour").notNull(),
  birthMinute: int("birthMinute").notNull(),
  
  // Ubicación de nacimiento
  birthCity: varchar("birthCity", { length: 255 }),
  birthCountry: varchar("birthCountry", { length: 255 }),
  birthLatitude: float("birthLatitude").notNull(),
  birthLongitude: float("birthLongitude").notNull(),
  birthTimezone: varchar("birthTimezone", { length: 100 }).notNull(),
  
  // Fecha hebrea
  hebrewDate: varchar("hebrewDate", { length: 255 }).notNull(),
  hebrewYear: int("hebrewYear").notNull(),
  hebrewMonth: varchar("hebrewMonth", { length: 100 }).notNull(),
  hebrewDay: int("hebrewDay").notNull(),
  adjustedHebrewDay: int("adjustedHebrewDay").notNull(),
  
  // Información del ciclo hebreo
  isLeapYear: boolean("isLeapYear").notNull(),
  yearInCycle: int("yearInCycle").notNull(),
  cycleNumber: int("cycleNumber").notNull(),
  
  // Ajuste a Jerusalem
  jerusalemDate: timestamp("jerusalemDate").notNull(),
  jerusalemHour: int("jerusalemHour").notNull(),
  jerusalemMinute: int("jerusalemMinute").notNull(),
  timeDifferenceHours: float("timeDifferenceHours").notNull(),
  
  // Día de la semana y planeta
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (0=Domingo)
  dayName: varchar("dayName", { length: 50 }).notNull(),
  planet: varchar("planet", { length: 50 }).notNull(),
  sefira: varchar("sefira", { length: 50 }).notNull(),
  
  // Análisis de mazal
  primaryTrait: text("primaryTrait"),
  talmudReference: varchar("talmudReference", { length: 255 }),
  creationElement: varchar("creationElement", { length: 255 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BirthChart = typeof birthCharts.$inferSelect;
export type InsertBirthChart = typeof birthCharts.$inferInsert;

/**
 * Tabla de análisis de mazal detallado
 * Almacena el perfil completo de personalidad y características
 */
export const mazalAnalyses = mysqlTable("mazalAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  birthChartId: int("birthChartId").notNull(),
  
  // Características
  characteristics: text("characteristics").notNull(), // JSON array
  strengths: text("strengths").notNull(), // JSON array
  challenges: text("challenges").notNull(), // JSON array
  
  // Citas y referencias
  talmudQuote: text("talmudQuote"),
  zoharInsight: text("zoharInsight"),
  
  // Guía espiritual
  spiritualPath: text("spiritualPath"),
  lifeGuidance: text("lifeGuidance"), // JSON array
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MazalAnalysis = typeof mazalAnalyses.$inferSelect;
export type InsertMazalAnalysis = typeof mazalAnalyses.$inferInsert;

/**
 * Tabla de reportes PDF generados
 * Almacena información de reportes exportados
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  birthChartId: int("birthChartId").notNull(),
  userId: int("userId").notNull(),
  
  // Información del reporte
  reportType: mysqlEnum("reportType", ["natal_chart", "mazal_analysis", "complete"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  
  // Archivo
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 500 }),
  fileSize: int("fileSize"),
  
  // Metadata
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Tabla de análisis de compatibilidad
 * Almacena comparaciones entre dos cartas natales
 */
export const compatibilityAnalyses = mysqlTable("compatibilityAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Cartas natales comparadas
  birthChart1Id: int("birthChart1Id").notNull(),
  birthChart2Id: int("birthChart2Id").notNull(),
  
  // Resultado de compatibilidad
  compatibilityScore: int("compatibilityScore").notNull(), // 0-100
  compatibilityLevel: varchar("compatibilityLevel", { length: 100 }).notNull(),
  analysis: text("analysis"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompatibilityAnalysis = typeof compatibilityAnalyses.$inferSelect;
export type InsertCompatibilityAnalysis = typeof compatibilityAnalyses.$inferInsert;
