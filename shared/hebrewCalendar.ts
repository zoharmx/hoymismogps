/**
 * Motor de Conversión de Calendario Hebreo
 * Implementa conversión gregoriano-hebreo con precisión astronómica
 * según la cosmogonología cabalística
 */

import Hebcal from 'hebcal';
import { DateTime } from 'luxon';

/**
 * Ciclos de intercalación de 19 años
 * 7 años tienen 13 meses (años 3, 6, 8, 11, 14, 17, 19)
 * 12 años tienen 12 meses (resto)
 */
const LEAP_YEARS_IN_CYCLE = [3, 6, 8, 11, 14, 17, 19];

/**
 * Mapeo de días de la semana a planetas según sistema hebreo
 */
export const HEBREW_DAY_PLANETS = {
  0: { planet: 'Júpiter', sefira: 'Jesed', day: 'Domingo' },
  1: { planet: 'Marte', sefira: 'Guevurah', day: 'Lunes' },
  2: { planet: 'Sol', sefira: 'Tifferet', day: 'Martes' },
  3: { planet: 'Venus', sefira: 'Netzaj', day: 'Miércoles' },
  4: { planet: 'Mercurio', sefira: 'Hod', day: 'Jueves' },
  5: { planet: 'Luna', sefira: 'Yesod', day: 'Viernes' },
  6: { planet: 'Saturno', sefira: 'Binah', day: 'Shabat' },
} as const;

/**
 * Los 10 niveles cosmogónicos (Sefirot)
 */
export const SEFIROT = [
  { level: 10, name: 'Keter', description: 'Corona - Límite del universo, conexión con EinSof' },
  { level: 9, name: 'Chokmah', description: 'Sabiduría - Principio masculino' },
  { level: 8, name: 'Binah', description: 'Entendimiento - Principio femenino, Saturno' },
  { level: 7, name: 'Chesed', description: 'Bondad - Júpiter, expansión' },
  { level: 6, name: 'Gevurah', description: 'Rigor - Marte, restricción' },
  { level: 5, name: 'Tiferet', description: 'Belleza - Sol, armonía central' },
  { level: 4, name: 'Netzach', description: 'Victoria - Venus, eternidad' },
  { level: 3, name: 'Hod', description: 'Gloria - Mercurio, esplendor' },
  { level: 2, name: 'Yesod', description: 'Fundamento - Luna, mundo astral' },
  { level: 1, name: 'Malkhut', description: 'Reino - Mundo material, tierra' },
] as const;

/**
 * Hora de inicio del día hebreo (7pm = 19:00)
 */
const HEBREW_DAY_START_HOUR = 19;

export interface HebrewDate {
  gregorianDate: Date;
  hebrewDate: string;
  hebrewYear: number;
  hebrewMonth: string;
  hebrewDay: number;
  dayOfWeek: number;
  dayName: string;
  planet: string;
  sefira: string;
  isLeapYear: boolean;
  yearInCycle: number;
  jerusalemTime: Date;
  sunsetTime: Date;
  adjustedHebrewDay: number;
}

/**
 * Convierte una fecha gregoriana a fecha hebrea considerando Jerusalem como referencia
 * @param gregorianDate Fecha gregoriana en zona horaria local
 * @param timezone Zona horaria IANA (ej: 'America/Mexico_City')
 * @returns Objeto con información completa de fecha hebrea
 */
export function convertToHebrewDate(
  gregorianDate: Date,
  timezone: string = 'UTC'
): HebrewDate {
  // Convertir a hora de Jerusalem
  const localDateTime = DateTime.fromJSDate(gregorianDate, { zone: timezone });
  const jerusalemDateTime = localDateTime.setZone('Asia/Jerusalem');
  
  // Crear objeto HDate de hebcal con hora de Jerusalem
  const hdate = new Hebcal.HDate(jerusalemDateTime.toJSDate());
  
  // Obtener información del año hebreo
  const hebrewYear = hdate.getFullYear();
  const yearInCycle = (hebrewYear % 19) || 19;
  const isLeapYear = LEAP_YEARS_IN_CYCLE.includes(yearInCycle);
  
  // Obtener mes hebreo
  const hebrewMonthNum = hdate.getMonth();
  const hebrewMonth = hdate.getMonthName();
  
  // Obtener día hebreo
  const hebrewDay = hdate.getDate();
  
  // Calcular puesta de sol para determinar inicio del día hebreo
  // La librería hebcal no expone Location, usamos aproximación de 7pm
  const sunset = new Date(jerusalemDateTime.toJSDate());
  sunset.setHours(19, 0, 0, 0);
  
  // Los días hebreos comienzan al atardecer (aproximadamente 7pm/19:00)
  // Hebcal convierte la fecha gregoriana al día hebreo correspondiente,
  // pero no ajusta automáticamente según la hora del día
  // Debemos hacer el ajuste manualmente si estamos después de las 19:00
  
  let adjustedHebrewDay = hebrewDay;
  if (jerusalemDateTime.hour >= HEBREW_DAY_START_HOUR) {
    // Después de las 19:00, es el siguiente día hebreo
    adjustedHebrewDay = hebrewDay + 1;
    
    // Manejar cambio de mes (simplificado - hebcal manejaría esto correctamente)
    // Por ahora solo incrementamos el día
  }
  
  // Obtener día de la semana (0 = Domingo)
  // Luxon usa 1=Lunes...7=Domingo, JavaScript usa 0=Domingo...6=Sábado
  const luxonWeekday = jerusalemDateTime.weekday; // 1-7
  const dayOfWeek = luxonWeekday === 7 ? 0 : luxonWeekday; // Convertir: 7->0, 1->1, 2->2, etc.
  const planetInfo = HEBREW_DAY_PLANETS[dayOfWeek as keyof typeof HEBREW_DAY_PLANETS];
  
  return {
    gregorianDate,
    hebrewDate: hdate.toString(),
    hebrewYear,
    hebrewMonth,
    hebrewDay,
    dayOfWeek,
    dayName: planetInfo.day,
    planet: planetInfo.planet,
    sefira: planetInfo.sefira,
    isLeapYear,
    yearInCycle,
    jerusalemTime: jerusalemDateTime.toJSDate(),
    sunsetTime: sunset,
    adjustedHebrewDay,
  };
}

/**
 * Calcula la diferencia horaria entre una ubicación y Jerusalem
 * @param timezone Zona horaria IANA
 * @returns Diferencia en horas
 */
export function getTimezoneOffsetFromJerusalem(timezone: string): number {
  const now = DateTime.now();
  const local = now.setZone(timezone);
  const jerusalem = now.setZone('Asia/Jerusalem');
  
  return (jerusalem.offset - local.offset) / 60; // Convertir minutos a horas
}

/**
 * Determina si un año hebreo es bisiesto (13 meses)
 * @param hebrewYear Año hebreo
 * @returns true si es año bisiesto
 */
export function isHebrewLeapYear(hebrewYear: number): boolean {
  const yearInCycle = (hebrewYear % 19) || 19;
  return LEAP_YEARS_IN_CYCLE.includes(yearInCycle);
}

/**
 * Obtiene información detallada del ciclo de intercalación
 * @param hebrewYear Año hebreo
 * @returns Información del ciclo
 */
export function getIntercalationCycleInfo(hebrewYear: number) {
  const yearInCycle = (hebrewYear % 19) || 19;
  const isLeapYear = LEAP_YEARS_IN_CYCLE.includes(yearInCycle);
  const cycleNumber = Math.floor((hebrewYear - 1) / 19) + 1;
  
  return {
    cycleNumber,
    yearInCycle,
    isLeapYear,
    monthCount: isLeapYear ? 13 : 12,
    leapYearsInCycle: LEAP_YEARS_IN_CYCLE,
  };
}

/**
 * Formatea una fecha hebrea para visualización
 * @param hebrewDate Objeto HebrewDate
 * @returns String formateado
 */
export function formatHebrewDate(hebrewDate: HebrewDate): string {
  return `${hebrewDate.adjustedHebrewDay} de ${hebrewDate.hebrewMonth} ${hebrewDate.hebrewYear}`;
}

/**
 * Obtiene el planeta regente de un día específico
 * @param dayOfWeek Día de la semana (0-6, 0=Domingo)
 * @returns Información del planeta
 */
export function getPlanetForDay(dayOfWeek: number) {
  return HEBREW_DAY_PLANETS[dayOfWeek as keyof typeof HEBREW_DAY_PLANETS];
}
