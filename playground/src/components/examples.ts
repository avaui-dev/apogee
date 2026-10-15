// Page examples: every page in registry/pages, keyed by its registry name
// ("log-in/SplitQuote.astro" → "log-in/split-quote"). The /examples route and PagePreview read this.
const modules = import.meta.glob<{ default: any }>('../../../registry/pages/**/*.astro', { eager: true })
const sources = import.meta.glob<string>('../../../registry/pages/**/*.astro', { eager: true, query: '?raw', import: 'default' })

const slugOf = (path: string) =>
  path.replace(/^.*\/registry\/pages\//, '').replace(/\.astro$/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

export const examples = Object.fromEntries(
  Object.entries(modules).map(([path, m]) => {
    const slug = slugOf(path)
    // Show imports the way they read in a project (the `@/` alias to src/).
    const source = sources[path]
      .replaceAll("'../../sections/", "'@/components/apogee/sections/")
      .replaceAll("'../../components/", "'@/components/apogee/")
    return [slug, { title: slug.split('/').pop()!.replace(/-/g, ' '), Page: m.default, source }]
  }),
) as Record<string, { title: string; Page: any; source: string }>
