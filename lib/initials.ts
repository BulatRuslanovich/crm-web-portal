const LEGAL_FORM_RE = /^(ООО|ЗАО|ОАО|ПАО|ИП|АО|МУП|ГБУЗ|ФГУП)$/i;
const QUOTE_RE = /["«»]/g;

export function orgInitials(name: string): string {
  const words = name
    .replace(QUOTE_RE, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !LEGAL_FORM_RE.test(w));

  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function physInitials(lastName?: string | null, firstName?: string | null): string {
  return ((lastName?.[0] ?? '') + (firstName?.[0] ?? '')).toUpperCase();
}

export function physFullName(
  lastName?: string | null,
  firstName?: string | null,
  middleName?: string | null,
): string {
  return [lastName, firstName, middleName].filter(Boolean).join(' ');
}
