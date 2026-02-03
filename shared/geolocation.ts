/**
 * Sistema de Geolocalización con Ajuste a Jerusalem
 * Calcula diferencias horarias y ajusta fechas según cosmogonología cabalística
 */

import { DateTime } from 'luxon';

/**
 * Coordenadas de Jerusalem (referencia temporal cabalística)
 */
export const JERUSALEM_COORDS = {
  latitude: 31.7683,
  longitude: 35.2137,
  timezone: 'Asia/Jerusalem',
  name: 'Jerusalem, Israel',
} as const;

/**
 * Información de ubicación
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
  country?: string;
}

/**
 * Resultado de ajuste de tiempo a Jerusalem
 */
export interface JerusalemTimeAdjustment {
  originalDate: Date;
  originalTimezone: string;
  jerusalemDate: Date;
  jerusalemTimezone: string;
  timeDifference: number; // en horas
  dateDifference: number; // en días (puede ser 0, 1, o -1)
  isNextDay: boolean;
  isPreviousDay: boolean;
  explanation: string;
}

/**
 * Obtiene la zona horaria IANA basada en coordenadas
 * Esta es una aproximación simple. En producción se usaría una API como Google Maps
 * @param latitude Latitud
 * @param longitude Longitud
 * @returns Zona horaria IANA aproximada
 */
export function getTimezoneFromCoordinates(
  latitude: number,
  longitude: number
): string {
  // Aproximación simple basada en longitud
  // En producción, usar una API de timezone lookup
  const timezoneOffset = Math.round(longitude / 15);
  
  // Mapeo aproximado de zonas horarias comunes
  const timezoneMap: Record<number, string> = {
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Mexico_City',
    '-5': 'America/New_York',
    '-4': 'America/Caracas',
    '-3': 'America/Argentina/Buenos_Aires',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Athens',
    '3': 'Asia/Jerusalem',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Noumea',
    '12': 'Pacific/Auckland',
  };
  
  const key = timezoneOffset.toString();
  return (timezoneMap as Record<string, string>)[key] || 'UTC';
}

/**
 * Ajusta una fecha/hora local a hora de Jerusalem
 * @param localDate Fecha en zona horaria local
 * @param localTimezone Zona horaria IANA local
 * @returns Información completa del ajuste
 */
export function adjustToJerusalemTime(
  localDate: Date,
  localTimezone: string
): JerusalemTimeAdjustment {
  // Crear DateTime en zona local
  const localDateTime = DateTime.fromJSDate(localDate, { zone: localTimezone });
  
  // Convertir a hora de Jerusalem
  const jerusalemDateTime = localDateTime.setZone(JERUSALEM_COORDS.timezone);
  
  // Calcular diferencia en horas
  const timeDifference = (jerusalemDateTime.offset - localDateTime.offset) / 60;
  
  // Calcular diferencia en días
  const localDay = localDateTime.startOf('day');
  const jerusalemDay = jerusalemDateTime.startOf('day');
  const dateDifference = Math.round(jerusalemDay.diff(localDay, 'days').days);
  
  // Determinar si cambió el día
  const isNextDay = dateDifference > 0;
  const isPreviousDay = dateDifference < 0;
  
  // Generar explicación
  let explanation = `Fecha local: ${localDateTime.toFormat('dd/MM/yyyy HH:mm')} (${localTimezone})\n`;
  explanation += `Fecha Jerusalem: ${jerusalemDateTime.toFormat('dd/MM/yyyy HH:mm')} (${JERUSALEM_COORDS.timezone})\n`;
  explanation += `Diferencia horaria: ${timeDifference > 0 ? '+' : ''}${timeDifference} horas\n`;
  
  if (isNextDay) {
    explanation += `⚠️ En Jerusalem ya es el día siguiente`;
  } else if (isPreviousDay) {
    explanation += `⚠️ En Jerusalem aún es el día anterior`;
  } else {
    explanation += `✓ Mismo día en ambas ubicaciones`;
  }
  
  return {
    originalDate: localDate,
    originalTimezone: localTimezone,
    jerusalemDate: jerusalemDateTime.toJSDate(),
    jerusalemTimezone: JERUSALEM_COORDS.timezone,
    timeDifference,
    dateDifference,
    isNextDay,
    isPreviousDay,
    explanation,
  };
}

/**
 * Calcula la distancia entre dos coordenadas usando fórmula de Haversine
 * @param lat1 Latitud punto 1
 * @param lon1 Longitud punto 1
 * @param lat2 Latitud punto 2
 * @param lon2 Longitud punto 2
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convierte grados a radianes
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula la distancia desde una ubicación a Jerusalem
 * @param location Información de ubicación
 * @returns Distancia en kilómetros
 */
export function distanceFromJerusalem(location: LocationInfo): number {
  return calculateDistance(
    location.latitude,
    location.longitude,
    JERUSALEM_COORDS.latitude,
    JERUSALEM_COORDS.longitude
  );
}

/**
 * Obtiene información de ubicación desde el navegador (frontend)
 * Esta función debe ser llamada desde el cliente
 */
export async function getCurrentLocation(): Promise<LocationInfo | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        resolve({
          latitude,
          longitude,
          timezone,
        });
      },
      () => {
        resolve(null);
      }
    );
  });
}

/**
 * Formatea coordenadas para visualización
 * @param latitude Latitud
 * @param longitude Longitud
 * @returns String formateado
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lonDir}`;
}

/**
 * Lista de zonas horarias comunes con sus nombres
 */
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Nueva York (EST/EDT)', offset: -5 },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (PST/PDT)', offset: -8 },
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST)', offset: -6 },
  { value: 'America/Bogota', label: 'Bogotá (COT)', offset: -5 },
  { value: 'America/Lima', label: 'Lima (PET)', offset: -5 },
  { value: 'America/Santiago', label: 'Santiago (CLT)', offset: -4 },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)', offset: -3 },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: -3 },
  { value: 'Europe/London', label: 'Londres (GMT/BST)', offset: 0 },
  { value: 'Europe/Paris', label: 'París (CET/CEST)', offset: 1 },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: 1 },
  { value: 'Europe/Rome', label: 'Roma (CET/CEST)', offset: 1 },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST)', offset: 2 },
  { value: 'Asia/Dubai', label: 'Dubái (GST)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: 5.5 },
  { value: 'Asia/Shanghai', label: 'Shanghái (CST)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokio (JST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sídney (AEDT)', offset: 11 },
] as const;

/**
 * Obtiene el offset actual de una zona horaria
 * @param timezone Zona horaria IANA
 * @returns Offset en horas
 */
export function getTimezoneOffset(timezone: string): number {
  const now = DateTime.now().setZone(timezone);
  return now.offset / 60;
}

/**
 * Valida si una zona horaria es válida
 * @param timezone Zona horaria IANA
 * @returns true si es válida
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    DateTime.now().setZone(timezone);
    return true;
  } catch {
    return false;
  }
}
