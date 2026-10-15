// Page and block examples: every file in registry/pages and registry/blocks, keyed by its
// registry name ("log-in/SplitQuote.astro" → "log-in/split-quote"). The /examples route and
// PagePreview read this; a block's preview frame fits its height, a page's is fixed.
const modules = import.meta.glob<{ default: any }>(['../../../registry/pages/**/*.astro', '../../../registry/blocks/**/*.astro'], { eager: true })
const sources = import.meta.glob<string>(['../../../registry/pages/**/*.astro', '../../../registry/blocks/**/*.astro'], { eager: true, query: '?raw', import: 'default' })

const slugOf = (path: string) =>
  path.replace(/^.*\/registry\/(pages|blocks)\//, '').replace(/\.astro$/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

export const examples = Object.fromEntries(
  Object.entries(modules).map(([path, m]) => {
    const slug = slugOf(path)
    // Show imports the way they read in a project (the `@/` alias to src/).
    const source = sources[path]
      .replaceAll("'../../sections/", "'@/components/apogee/sections/")
      .replaceAll("'../../components/", "'@/components/apogee/")
    const kind = path.includes('/registry/blocks/') ? 'block' : 'page'
    return [slug, { title: slug.split('/').pop()!.replace(/-/g, ' '), kind, Page: m.default, source }]
  }),
) as Record<string, { title: string; kind: 'page' | 'block'; Page: any; source: string }>
