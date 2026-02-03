import { describe, expect, it } from "vitest";
import { convertToHebrewDate } from "../shared/hebrewCalendar";

describe("Date Conversion Bug Fix", () => {
  it("should correctly convert January 4, 1988 13:25 Jerusalem to 14 Tevet 5748", () => {
    // Caso reportado: Lunes 4 de enero 1988 a las 13:25 en Jerusalem
    // Fecha correcta según Hebcal.com: 14 de Tevet 5748
    
    // Crear fecha especificando timezone de Jerusalem (UTC+2 en invierno)
    const date = new Date('1988-01-04T13:25:00+02:00');
    const result = convertToHebrewDate(date, 'Asia/Jerusalem');
    
    // Validar fecha hebrea
    expect(result.hebrewDay).toBe(14);
    expect(result.hebrewMonth).toBe('Tevet');
    expect(result.hebrewYear).toBe(5748);
    
    // Validar que es Lunes (1)
    expect(result.dayOfWeek).toBe(1);
    expect(result.dayName).toBe('Lunes');
    expect(result.planet).toBe('Marte');
    
    // A las 13:25 (antes de las 19:00), el día hebreo ajustado debe ser el mismo
    expect(result.adjustedHebrewDay).toBe(14);
  });

  it("should correctly adjust Hebrew day after 7pm (19:00)", () => {
    // Mismo día pero a las 21:25 (después de 7pm)
    // Debería ser 15 de Tevet 5748 (siguiente día hebreo)
    
    const date = new Date('1988-01-04T21:25:00+02:00');
    const result = convertToHebrewDate(date, 'Asia/Jerusalem');
    
    // La fecha base sigue siendo 14 de Tevet
    expect(result.hebrewDay).toBe(14);
    
    // Pero el día ajustado debe ser 15 (siguiente día hebreo)
    expect(result.adjustedHebrewDay).toBe(15);
    expect(result.hebrewMonth).toBe('Tevet');
    expect(result.hebrewYear).toBe(5748);
  });

  it("should correctly identify day of week for January 4, 1988", () => {
    // 4 de enero 1988 fue Lunes
    const date = new Date('1988-01-04T12:00:00');
    const result = convertToHebrewDate(date, 'Asia/Jerusalem');
    
    expect(result.dayOfWeek).toBe(1); // 1 = Lunes
    expect(result.dayName).toBe('Lunes');
    expect(result.planet).toBe('Marte');
    expect(result.sefira).toBe('Guevurah');
  });

  it("should correctly identify Sunday (day 0)", () => {
    // 3 de enero 1988 fue Domingo
    const date = new Date('1988-01-03T12:00:00');
    const result = convertToHebrewDate(date, 'Asia/Jerusalem');
    
    expect(result.dayOfWeek).toBe(0); // 0 = Domingo
    expect(result.dayName).toBe('Domingo');
    expect(result.planet).toBe('Júpiter');
    expect(result.sefira).toBe('Jesed');
  });

  it("should correctly identify Saturday (day 6)", () => {
    // 2 de enero 1988 fue Sábado
    const date = new Date('1988-01-02T12:00:00');
    const result = convertToHebrewDate(date, 'Asia/Jerusalem');
    
    expect(result.dayOfWeek).toBe(6); // 6 = Sábado
    expect(result.dayName).toBe('Shabat');
    expect(result.planet).toBe('Saturno');
    expect(result.sefira).toBe('Binah');
  });
});
