import { describe, expect, it } from "vitest";
import {
  getMazalProfile,
  generateMazalAnalysis,
  calculateCompatibility,
  MAZAL_PROFILES,
} from "../shared/mazalAnalysis";

describe("Mazal Analysis", () => {
  it("should return valid mazal profile for each day of the week", () => {
    for (let day = 0; day < 7; day++) {
      const profile = getMazalProfile(day);
      
      expect(profile).toBeDefined();
      expect(profile.dayOfWeek).toBe(day);
      expect(profile.planet).toBeDefined();
      expect(profile.sefira).toBeDefined();
      expect(profile.primaryTrait).toBeDefined();
      expect(profile.characteristics).toBeInstanceOf(Array);
      expect(profile.strengths).toBeInstanceOf(Array);
      expect(profile.challenges).toBeInstanceOf(Array);
      expect(profile.talmudReference).toBeDefined();
      expect(profile.talmudQuote).toBeDefined();
      expect(profile.zoharInsight).toBeDefined();
    }
  });

  it("should generate complete mazal analysis", () => {
    const analysis = generateMazalAnalysis(0, 5784); // Sunday
    
    expect(analysis).toBeDefined();
    expect(analysis.profile).toBeDefined();
    expect(analysis.planetInfo).toBeDefined();
    expect(analysis.summary).toBeDefined();
    expect(analysis.spiritualPath).toBeDefined();
    expect(analysis.lifeGuidance).toBeInstanceOf(Array);
    expect(analysis.lifeGuidance.length).toBeGreaterThan(0);
  });

  it("should have correct Talmud references for each day", () => {
    // Sunday - first day
    const sunday = getMazalProfile(0);
    expect(sunday.talmudReference).toContain("Shabat 156");
    expect(sunday.talmudQuote).toContain("primer día");
    
    // Monday - second day
    const monday = getMazalProfile(1);
    expect(monday.talmudQuote).toContain("segundo día");
    
    // Saturday - Shabat
    const saturday = getMazalProfile(6);
    expect(saturday.dayName).toBe("Shabat");
    expect(saturday.talmudQuote).toContain("Shabat");
  });

  it("should calculate compatibility between two birth days", () => {
    const compatibility = calculateCompatibility(0, 3); // Sunday and Wednesday
    
    expect(compatibility).toBeDefined();
    expect(compatibility.score).toBeGreaterThanOrEqual(0);
    expect(compatibility.score).toBeLessThanOrEqual(100);
    expect(compatibility.description).toBeDefined();
    expect(compatibility.profile1).toBeDefined();
    expect(compatibility.profile2).toBeDefined();
  });

  it("should return symmetric compatibility scores", () => {
    const comp1 = calculateCompatibility(1, 4);
    const comp2 = calculateCompatibility(4, 1);
    
    expect(comp1.score).toBe(comp2.score);
  });

  it("should have all 7 mazal profiles defined", () => {
    expect(Object.keys(MAZAL_PROFILES)).toHaveLength(7);
    
    for (let i = 0; i < 7; i++) {
      expect(MAZAL_PROFILES[i]).toBeDefined();
    }
  });

  it("should map planets correctly according to Hebrew system", () => {
    const sunday = getMazalProfile(0);
    expect(sunday.planet).toBe("Júpiter");
    expect(sunday.sefira).toContain("Jesed");
    
    const monday = getMazalProfile(1);
    expect(monday.planet).toBe("Marte");
    expect(monday.sefira).toContain("Guevurah");
    
    const tuesday = getMazalProfile(2);
    expect(tuesday.planet).toBe("Sol");
    expect(tuesday.sefira).toContain("Tifferet");
    
    const wednesday = getMazalProfile(3);
    expect(wednesday.planet).toBe("Venus");
    expect(wednesday.sefira).toContain("Netzaj");
    
    const thursday = getMazalProfile(4);
    expect(thursday.planet).toBe("Mercurio");
    expect(thursday.sefira).toContain("Hod");
    
    const friday = getMazalProfile(5);
    expect(friday.planet).toBe("Luna");
    expect(friday.sefira).toContain("Yesod");
    
    const saturday = getMazalProfile(6);
    expect(saturday.planet).toBe("Saturno");
    expect(saturday.sefira).toContain("Binah");
  });

  it("should include Zohar insights for each profile", () => {
    for (let day = 0; day < 7; day++) {
      const profile = getMazalProfile(day);
      expect(profile.zoharInsight).toBeDefined();
      expect(profile.zoharInsight.length).toBeGreaterThan(50); // Should be substantial text
    }
  });

  it("should provide spiritual path guidance", () => {
    const analysis = generateMazalAnalysis(2, 5784); // Tuesday
    
    expect(analysis.spiritualPath).toBeDefined();
    expect(analysis.spiritualPath.length).toBeGreaterThan(100);
  });

  it("should include creation elements for each day", () => {
    const sunday = getMazalProfile(0);
    expect(sunday.creationElement).toBe("Luz y Oscuridad");
    
    const monday = getMazalProfile(1);
    expect(monday.creationElement).toBe("División de las Aguas");
    
    const saturday = getMazalProfile(6);
    expect(saturday.creationElement).toBe("Descanso Divino");
  });
});
