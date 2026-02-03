import Hebcal from 'hebcal';

// Caso reportado: Lunes 4 de enero 1988 a las 13:25 en Jerusalem
const date1 = new Date('1988-01-04T13:25:00+02:00'); // Jerusalem timezone
console.log('=== Caso 1: 4 enero 1988, 13:25 Jerusalem ===');
console.log('Gregoriano:', date1.toISOString());

const hdate1 = new Hebcal.HDate(date1);
console.log('Hebreo:', hdate1.getDate(), hdate1.getMonthName(), hdate1.getFullYear());
console.log('Esperado: 15 Tevet 5748');
console.log('');

// Probar sin timezone
const date2 = new Date('1988-01-04T13:25:00');
console.log('=== Caso 2: Sin timezone ===');
const hdate2 = new Hebcal.HDate(date2);
console.log('Hebreo:', hdate2.getDate(), hdate2.getMonthName(), hdate2.getFullYear());
