// Dates arrive as ISO strings (`2026-09-18`); format them in UTC so the day
// never shifts with the build machine's time zone.
export const formatDate = (iso: string, locale = 'en', style: 'long' | 'short' = 'long') =>
  new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: style, day: 'numeric', timeZone: 'UTC' })
