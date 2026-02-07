const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatCalendarDateToDisplay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return ymd;
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

export function formatCalendarDateToLongDisplay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return ymd;
  return `${MONTH_NAMES_LONG[m - 1]} ${d}, ${y}`;
}

export function parseToCalendarDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (iso) {
    const [, y, m, d] = iso;
    const month = parseInt(m!, 10);
    const day = parseInt(d!, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return trimmed;
  }
  const display = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/i.exec(trimmed);
  if (display) {
    const [, monthStr, d, y] = display;
    let mi = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthStr!.toLowerCase());
    if (mi === -1) {
      mi = MONTH_NAMES_LONG.findIndex((m) => m.toLowerCase() === monthStr!.toLowerCase());
    }
    if (mi === -1) return null;
    const year = parseInt(y!, 10);
    const yearFull = year < 100 ? 2000 + year : year;
    const month = mi + 1;
    const day = parseInt(d!, 10);
    if (day < 1 || day > 31) return null;
    return `${yearFull}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null;
}

function parseTimeToMinutes(value: string): number {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed || trimmed === 'TBD') return 24 * 60;
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];
  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function sortTimelineItemsByDateAndTime<T extends { date: string; time: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const dateA = parseToCalendarDate(a.date) ?? '9999-12-31';
    const dateB = parseToCalendarDate(b.date) ?? '9999-12-31';
    const dateCmp = dateA.localeCompare(dateB);
    if (dateCmp !== 0) return dateCmp;
    const timeA = parseTimeToMinutes(a.time);
    const timeB = parseTimeToMinutes(b.time);
    return timeA - timeB;
  });
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff) + 1;
}

export function formatTimeTo12Hour(time: string): string {
  const trimmed = time.trim();
  if (!trimmed || trimmed === 'TBD') {
    return trimmed;
  }
  const match12Hour = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12Hour) {
    let hours = parseInt(match12Hour[1], 10);
    const minutes = match12Hour[2];
    const period = match12Hour[3].toUpperCase();
    return `${hours}:${minutes} ${period}`;
  }
  const match24Hour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match24Hour) {
    return trimmed;
  }
  
  let hours = parseInt(match24Hour[1], 10);
  const minutes = match24Hour[2];
  if (hours < 0 || hours > 23) {
    return trimmed;
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }
  
  return `${hours}:${minutes} ${period}`;
}
