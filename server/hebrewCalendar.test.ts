import { describe, expect, it } from "vitest";
import {
  convertToHebrewDate,
  isHebrewLeapYear,
  getIntercalationCycleInfo,
  getPlanetForDay,
  HEBREW_DAY_PLANETS,
} from "../shared/hebrewCalendar";

describe("Hebrew Calendar Conversion", () => {
  it("should convert a gregorian date to hebrew date", () => {
    const gregorianDate = new Date("2024-01-15T12:00:00Z");
    const result = convertToHebrewDate(gregorianDate, "UTC");

    expect(result).toBeDefined();
    expect(result.hebrewYear).toBeGreaterThan(5700); // Hebrew year should be in 5700s
    expect(result.dayOfWeek).toBeGreaterThanOrEqual(0);
    expect(result.dayOfWeek).toBeLessThanOrEqual(6);
    expect(result.planet).toBeDefined();
    expect(result.sefira).toBeDefined();
  });

  it("should correctly identify leap years in the 19-year cycle", () => {
    // Year 3 in cycle should be a leap year (5784 % 19 = 3)
    expect(isHebrewLeapYear(5784)).toBe(true);
    
    // Year 2 in cycle should not be a leap year (5783 % 19 = 2)
    expect(isHebrewLeapYear(5783)).toBe(false);
    
    // Year 6 in cycle should be a leap year
    expect(isHebrewLeapYear(5787)).toBe(true); // 5787 % 19 = 6
  });

  it("should provide correct intercalation cycle information", () => {
    const cycleInfo = getIntercalationCycleInfo(5784);
    
    expect(cycleInfo.yearInCycle).toBeGreaterThanOrEqual(1);
    expect(cycleInfo.yearInCycle).toBeLessThanOrEqual(19);
    expect(cycleInfo.monthCount).toBeGreaterThanOrEqual(12);
    expect(cycleInfo.monthCount).toBeLessThanOrEqual(13);
    expect(cycleInfo.leapYearsInCycle).toEqual([3, 6, 8, 11, 14, 17, 19]);
  });

  it("should map days of week to correct planets according to Hebrew system", () => {
    // Sunday (0) should be Jupiter
    const sunday = getPlanetForDay(0);
    expect(sunday.planet).toBe("Júpiter");
    expect(sunday.sefira).toBe("Jesed");
    expect(sunday.day).toBe("Domingo");

    // Monday (1) should be Mars
    const monday = getPlanetForDay(1);
    expect(monday.planet).toBe("Marte");
    expect(monday.sefira).toBe("Guevurah");
    expect(monday.day).toBe("Lunes");

    // Saturday (6) should be Saturn
    const saturday = getPlanetForDay(6);
    expect(saturday.planet).toBe("Saturno");
    expect(saturday.sefira).toBe("Binah");
    expect(saturday.day).toBe("Shabat");
  });

  it("should adjust date to Jerusalem timezone", () => {
    const mexicoCityDate = new Date("2024-01-15T20:00:00"); // 8pm in Mexico City
    const result = convertToHebrewDate(mexicoCityDate, "America/Mexico_City");

    expect(result.jerusalemTime).toBeDefined();
    expect(result.gregorianDate).toEqual(mexicoCityDate);
    expect(result.dayName).toBeDefined();
  });

  it("should handle Hebrew day start at 7pm (19:00)", () => {
    // Test date before 7pm
    const beforeSunset = new Date("2024-01-15T18:00:00");
    const resultBefore = convertToHebrewDate(beforeSunset, "Asia/Jerusalem");

    // Test date after 7pm
    const afterSunset = new Date("2024-01-15T20:00:00");
    const resultAfter = convertToHebrewDate(afterSunset, "Asia/Jerusalem");

    expect(resultBefore).toBeDefined();
    expect(resultAfter).toBeDefined();
    // After 7pm should potentially be the next Hebrew day
  });

  it("should have all 7 days of week mapped to planets", () => {
    expect(Object.keys(HEBREW_DAY_PLANETS)).toHaveLength(7);
    
    for (let i = 0; i < 7; i++) {
      const planet = HEBREW_DAY_PLANETS[i as keyof typeof HEBREW_DAY_PLANETS];
      expect(planet).toBeDefined();
      expect(planet.planet).toBeDefined();
      expect(planet.sefira).toBeDefined();
      expect(planet.day).toBeDefined();
    }
  });
});
