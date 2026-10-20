// Shared base for anchored panels (Popover, Tooltip, Dropdown, ContextMenu,
// Menubar, Select and Combobox listboxes). The panel is a native `popover`
// (top layer, light dismiss) positioned with CSS anchor positioning; the inline
// style below is ignored where unsupported and the browser's centred popover
// position remains. Transition and anchor reset live in tokens/theme.css as
// `.apogee-panel`. Every class string is a literal so Tailwind sees it.
export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'start' | 'start-top' | 'start-bottom'
  | 'end' | 'end-top' | 'end-bottom'

export const placementArea: Record<Placement, string> = {
  top: 'block-start', 'top-start': 'block-start span-inline-end', 'top-end': 'block-start span-inline-start',
  bottom: 'block-end', 'bottom-start': 'block-end span-inline-end', 'bottom-end': 'block-end span-inline-start',
  start: 'inline-start', 'start-top': 'inline-start span-block-end', 'start-bottom': 'inline-start span-block-start',
  end: 'inline-end', 'end-top': 'inline-end span-block-end', 'end-bottom': 'inline-end span-block-start',
}

// The margin that pushes the panel away from the anchor, per side.
const gapSide = { top: 'margin-block-end', bottom: 'margin-block-start', start: 'margin-inline-end', end: 'margin-inline-start' } as const

export function panelStyle({ anchor, placement = 'bottom', gap = 2, width, maxHeight }: {
  anchor: string
  placement?: Placement | undefined
  gap?: number | undefined
  width?: 'trigger' | string | undefined
  maxHeight?: string | undefined
}): string {
  const side = placement.split('-')[0] as keyof typeof gapSide
  const out = [
    `position-anchor: ${anchor}`,
    `position-area: ${placementArea[placement]}`,
    `${gapSide[side]}: calc(var(--spacing) * ${gap})`,
    'position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline',
  ]
  if (width) out.push(`width: ${width === 'trigger' ? 'anchor-size(width)' : width}`)
  if (maxHeight) out.push(`max-height: ${maxHeight}`)
  return out.join('; ') + ';'
}

export const panelClass = 'apogee-panel rounded-lg border border-neutral text-sm text-neutral'
export const panelSurface = {
  raised: 'bg-elevation-raised shadow-[var(--shadow-raised),var(--shadow-surface)]',
  overlay: 'bg-elevation-overlay shadow-[var(--shadow-overlay),var(--shadow-surface)]',
} as const
export const panelPadding = { 0: 'p-0', 1: 'p-1', 2: 'p-2', 3: 'p-3', 4: 'p-4', 5: 'p-5', 6: 'p-6' } as const
// `display` only while open: a bare `flex` utility would beat the UA `display: none` of a closed popover.
export const menuClass = 'min-w-44 flex-col gap-0.5 p-1 [&:popover-open]:flex'

// Menu and listbox items (DropdownItem, Menubar, Select options, Combobox options).
export const itemBase =
  'press flex w-full items-center rounded text-start transition-colors focus-visible:outline-none ' +
  'disabled:cursor-not-allowed disabled:text-disabled aria-disabled:cursor-not-allowed aria-disabled:text-disabled [&_svg]:shrink-0'
export const itemSizes = {
  small: 'gap-1.5 px-2 py-1 text-xs [&_svg]:size-3.5',
  medium: 'gap-2 px-2 py-1.5 text-sm [&_svg]:size-4',
  large: 'gap-2.5 px-3 py-2 text-base [&_svg]:size-5',
} as const satisfies Record<ItemSize, string>
export const itemColors = {
  neutral: 'text-neutral hover:bg-neutral-faded-highlighted focus-visible:bg-neutral-faded-highlighted',
  primary: 'text-primary hover:bg-primary-faded focus-visible:bg-primary-faded',
  critical: 'text-critical hover:bg-critical-faded focus-visible:bg-critical-faded',
} as const satisfies Record<ItemColor, string>
export const itemSelected = { neutral: 'bg-neutral-faded', primary: 'bg-primary-faded', critical: 'bg-critical-faded' } as const
export type ItemSize = 'small' | 'medium' | 'large'
export type ItemColor = 'neutral' | 'primary' | 'critical'
