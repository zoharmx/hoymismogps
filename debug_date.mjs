import Hebcal from 'hebcal';
import { DateTime } from 'luxon';

console.log('=== Debugging 4 enero 1988 13:25 ===');
const date1 = new Date('1988-01-04T13:25:00');
console.log('Date object:', date1);
console.log('ISO:', date1.toISOString());

const dt1 = DateTime.fromJSDate(date1, { zone: 'Asia/Jerusalem' });
console.log('Luxon DateTime:', dt1.toString());
console.log('Hour:', dt1.hour);

const hdate1 = new Hebcal.HDate(dt1.toJSDate());
console.log('Hebcal day:', hdate1.getDate());
console.log('Hebcal month:', hdate1.getMonthName());
console.log('Hebcal year:', hdate1.getFullYear());

console.log('\n=== Debugging 4 enero 1988 21:25 ===');
const date2 = new Date('1988-01-04T21:25:00');
const dt2 = DateTime.fromJSDate(date2, { zone: 'Asia/Jerusalem' });
console.log('Luxon DateTime:', dt2.toString());
console.log('Hour:', dt2.hour);

const hdate2 = new Hebcal.HDate(dt2.toJSDate());
console.log('Hebcal day:', hdate2.getDate());
console.log('Hebcal month:', hdate2.getMonthName());
