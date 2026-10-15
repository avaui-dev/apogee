// An icon component prop: any Astro component (Lucide's or your own set's).
// ponytail: only checks it is callable; Astro components have no narrower public type.
export type IconComponent = (...args: any[]) => any
