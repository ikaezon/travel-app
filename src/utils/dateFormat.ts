const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Format YYYY-MM-DD (from calendar) to short display e.g. "Oct 15, 2024" */
export function formatCalendarDateToDisplay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return ymd;
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

/** Format YYYY-MM-DD to long display e.g. "February 26, 2026" (for saving to reservation) */
export function formatCalendarDateToLongDisplay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return ymd;
  return `${MONTH_NAMES_LONG[m - 1]} ${d}, ${y}`;
}

/** Parse display string or partial date to YYYY-MM-DD for calendar, or null */
export function parseToCalendarDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Already YYYY-MM-DD
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (iso) {
    const [, y, m, d] = iso;
    const month = parseInt(m!, 10);
    const day = parseInt(d!, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return trimmed;
  }
  // "Oct 15, 2024" or "January 15, 2026"
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

export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff) + 1;
}
