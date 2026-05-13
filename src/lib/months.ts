const RO_MONTHS = [
  'Ianuarie',
  'Februarie',
  'Martie',
  'Aprilie',
  'Mai',
  'Iunie',
  'Iulie',
  'August',
  'Septembrie',
  'Octombrie',
  'Noiembrie',
  'Decembrie',
];

const RO_MONTHS_SHORT = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];

export function monthKey(date: Date): string {
  // YYYY-MM
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function monthStartDate(year: number, month: number): Date {
  // month is 1-12
  return new Date(Date.UTC(year, month - 1, 1));
}

export function currentMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function formatMonthRo(date: Date): string {
  return `${RO_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatMonthShortRo(date: Date): string {
  return `${RO_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function parseMonthKey(key: string): Date | null {
  const m = key.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  if (month < 1 || month > 12) return null;
  return monthStartDate(year, month);
}

export function previousMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}
