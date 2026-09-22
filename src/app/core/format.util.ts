export function fmt(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date + 'T00:00:00');
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseEmails(value: string): string[] {
  return value
    .split(/[,\s;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
