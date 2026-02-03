declare module 'hebcal' {
  export class HDate {
    constructor(date?: Date | number);
    getFullYear(): number;
    getMonth(): number;
    getMonthName(): string;
    getDate(): number;
    toString(): string;
  }

  export class Location {
    constructor(
      latitude: number,
      longitude: number,
      il: boolean,
      tzid: string,
      cityName: string,
      countryCode: string
    );
  }

  export namespace HebrewCalendar {
    function getSunset(date: Date, location: Location): Date;
  }

  export const months: {
    [key: string]: number;
  };
}
