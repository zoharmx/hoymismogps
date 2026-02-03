import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createBirthChart,
  getBirthChartById,
  getBirthChartsByUserId,
  createMazalAnalysis,
  getMazalAnalysisByChartId,
  createReport,
  getReportsByUserId,
  createCompatibilityAnalysis,
  getCompatibilityAnalysesByUserId,
} from "./db";
import { convertToHebrewDate, getIntercalationCycleInfo } from "../shared/hebrewCalendar";
import { generateMazalAnalysis, calculateCompatibility } from "../shared/mazalAnalysis";
import { adjustToJerusalemTime } from "../shared/geolocation";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  birthChart: router({
    /**
     * Crear una nueva carta natal cabalística
     */
    create: protectedProcedure
      .input(
        z.object({
          personName: z.string().optional(),
          gregorianDate: z.date(),
          birthHour: z.number().min(0).max(23),
          birthMinute: z.number().min(0).max(59),
          birthCity: z.string().optional(),
          birthCountry: z.string().optional(),
          birthLatitude: z.number(),
          birthLongitude: z.number(),
          birthTimezone: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Crear fecha completa con hora
        const birthDateTime = new Date(input.gregorianDate);
        birthDateTime.setHours(input.birthHour, input.birthMinute, 0, 0);

        // Ajustar a hora de Jerusalem
        const jerusalemAdjustment = adjustToJerusalemTime(birthDateTime, input.birthTimezone);

        // Convertir a fecha hebrea
        const hebrewDate = convertToHebrewDate(birthDateTime, input.birthTimezone);

        // Obtener información del ciclo
        const cycleInfo = getIntercalationCycleInfo(hebrewDate.hebrewYear);

        // Crear carta natal en la base de datos
        const chart = await createBirthChart({
          userId: ctx.user.id,
          personName: input.personName || null,
          gregorianDate: input.gregorianDate,
          gregorianYear: input.gregorianDate.getFullYear(),
          gregorianMonth: input.gregorianDate.getMonth() + 1,
          gregorianDay: input.gregorianDate.getDate(),
          birthHour: input.birthHour,
          birthMinute: input.birthMinute,
          birthCity: input.birthCity || null,
          birthCountry: input.birthCountry || null,
          birthLatitude: input.birthLatitude,
          birthLongitude: input.birthLongitude,
          birthTimezone: input.birthTimezone,
          hebrewDate: hebrewDate.hebrewDate,
          hebrewYear: hebrewDate.hebrewYear,
          hebrewMonth: hebrewDate.hebrewMonth,
          hebrewDay: hebrewDate.hebrewDay,
          adjustedHebrewDay: hebrewDate.adjustedHebrewDay,
          isLeapYear: hebrewDate.isLeapYear,
          yearInCycle: hebrewDate.yearInCycle,
          cycleNumber: cycleInfo.cycleNumber,
          jerusalemDate: hebrewDate.jerusalemTime,
          jerusalemHour: hebrewDate.jerusalemTime.getHours(),
          jerusalemMinute: hebrewDate.jerusalemTime.getMinutes(),
          timeDifferenceHours: jerusalemAdjustment.timeDifference,
          dayOfWeek: hebrewDate.dayOfWeek,
          dayName: hebrewDate.dayName,
          planet: hebrewDate.planet,
          sefira: hebrewDate.sefira,
          primaryTrait: null,
          talmudReference: null,
          creationElement: null,
        });

        // Generar análisis de mazal
        const mazalAnalysis = generateMazalAnalysis(hebrewDate.dayOfWeek, hebrewDate.hebrewYear);

        // Guardar análisis de mazal
        await createMazalAnalysis({
          birthChartId: chart.id,
          characteristics: JSON.stringify(mazalAnalysis.profile.characteristics),
          strengths: JSON.stringify(mazalAnalysis.profile.strengths),
          challenges: JSON.stringify(mazalAnalysis.profile.challenges),
          talmudQuote: mazalAnalysis.profile.talmudQuote,
          zoharInsight: mazalAnalysis.profile.zoharInsight,
          spiritualPath: mazalAnalysis.spiritualPath,
          lifeGuidance: JSON.stringify(mazalAnalysis.lifeGuidance),
        });

        return {
          chart,
          mazalAnalysis,
          hebrewDate,
          jerusalemAdjustment,
        };
      }),

    /**
     * Obtener todas las cartas natales del usuario
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const charts = await getBirthChartsByUserId(ctx.user.id);
      return charts;
    }),

    /**
     * Obtener una carta natal específica con su análisis
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const chart = await getBirthChartById(input.id);
        if (!chart) {
          throw new Error("Carta natal no encontrada");
        }

        const mazalAnalysis = await getMazalAnalysisByChartId(input.id);

        return {
          chart,
          mazalAnalysis: mazalAnalysis
            ? {
                ...mazalAnalysis,
                characteristics: JSON.parse(mazalAnalysis.characteristics || '[]'),
                strengths: JSON.parse(mazalAnalysis.strengths || '[]'),
                challenges: JSON.parse(mazalAnalysis.challenges || '[]'),
                lifeGuidance: JSON.parse(mazalAnalysis.lifeGuidance || '[]'),
              }
            : null,
        };
      }),
  }),

  compatibility: router({
    /**
     * Calcular compatibilidad entre dos cartas natales
     */
    calculate: protectedProcedure
      .input(
        z.object({
          chart1Id: z.number(),
          chart2Id: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const chart1 = await getBirthChartById(input.chart1Id);
        const chart2 = await getBirthChartById(input.chart2Id);

        if (!chart1 || !chart2) {
          throw new Error("Una o ambas cartas natales no fueron encontradas");
        }

        const compatibility = calculateCompatibility(chart1.dayOfWeek, chart2.dayOfWeek);

        // Guardar análisis de compatibilidad
        const analysis = await createCompatibilityAnalysis({
          userId: ctx.user.id,
          birthChart1Id: input.chart1Id,
          birthChart2Id: input.chart2Id,
          compatibilityScore: compatibility.score,
          compatibilityLevel: compatibility.description,
          analysis: JSON.stringify({
            chart1: {
              name: chart1.personName || 'Persona 1',
              planet: chart1.planet,
              sefira: chart1.sefira,
            },
            chart2: {
              name: chart2.personName || 'Persona 2',
              planet: chart2.planet,
              sefira: chart2.sefira,
            },
            compatibility,
          }),
        });

        return {
          analysis,
          compatibility,
          chart1,
          chart2,
        };
      }),

    /**
     * Obtener análisis de compatibilidad del usuario
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const analyses = await getCompatibilityAnalysesByUserId(ctx.user.id);
      return analyses;
    }),
  }),

  report: router({
    /**
     * Obtener reportes del usuario
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const reports = await getReportsByUserId(ctx.user.id);
      return reports;
    }),
  }),
});

export type AppRouter = typeof appRouter;
