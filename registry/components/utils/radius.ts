// Inner radius = outer radius − padding, so chips inside a rounded tray keep
// concentric corners instead of looking rounder than their container.
// Key = outer radius token + tray padding in Tailwind steps (0.5 = 2px, 1 = 4px, 2 = 8px).
export const innerRadius = {
  'md-0.5': 'rounded-[calc(var(--radius-md)-0.125rem)]',
  'md-1': 'rounded-[calc(var(--radius-md)-0.25rem)]',
  'lg-1': 'rounded-[calc(var(--radius-lg)-0.25rem)]',
  'lg-2': 'rounded-[calc(var(--radius-lg)-0.5rem)]',
} as const
export type InnerRadius = keyof typeof innerRadius
