// Agent and crawler files, written after every build from the finished HTML, so any page
// (docs, the landing page, pages added later) gets them without extra work:
//   <page>.md       the page's <main> as Markdown; live previews become their source code
//   llms.txt        index for agents (llmstxt.org), grouped like the docs sidebar (from search.json)
//   llms-full.txt   guides, foundations, components and section/page overviews in one file
//   sitemap.xml     every indexable page, lastmod from the page's article:modified_time
// Skipped: /examples/* (the frames docs previews load) and pages marked noindex.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import TurndownService from 'turndown'

const SUMMARY = 'Accessible, responsive Astro components, sections and page blocks that you copy into your project and own. Tailwind v4, zero JS unless a component needs it.'
const INTRO = 'New site: `npx @ava-ui/apogee create my-site`. Existing Astro + Tailwind project: `npx @ava-ui/apogee init`, then `npx @ava-ui/apogee add <name>`. Source: https://github.com/avaui-dev/apogee. Every page below is also available as Markdown at the same URL plus `.md`.'

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' })
td.remove(['script', 'style', 'svg', 'button', 'iframe', 'nav', 'form'])
td.remove((n) => n.nodeType === 1 && (n.hasAttribute('data-md-skip') || n.classList.contains('sr-only')))
const fence = (code, lang = 'astro') => `\n\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n\n`
// A live component example: keep its source, drop the rendered demo.
td.addRule('preview', {
  filter: (n) => n.nodeType === 1 && n.hasAttribute('data-preview'),
  replacement: (_, n) => fence(n.querySelector('details pre')?.textContent ?? ''),
})
// A framed page or block example: link to it, then its source.
td.addRule('page-preview', {
  filter: (n) => n.nodeType === 1 && n.hasAttribute('data-page-preview'),
  replacement: (_, n) => {
    const src = n.querySelector('[data-page-preview-frame]')?.getAttribute('src')
    return (src ? `\n\nLive example: ${src}\n` : '') + fence(n.querySelector('template[data-page-preview-source]')?.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') ?? '')
  },
})
td.addRule('pre', {
  filter: (n) => n.nodeName === 'PRE',
  replacement: (_, n) => fence(n.textContent ?? '', n.getAttribute('data-language') ?? ''),
})
// Tables as GFM pipes; cell line breaks become spaces.
td.addRule('table', {
  filter: 'table',
  replacement: (_, n) => {
    const rows = Array.from(n.querySelectorAll('tr')).map((tr) => Array.from(tr.childNodes).filter((c) => c.nodeType === 1).map((c) => td.turndown(c.innerHTML).replace(/\n+/g, ' ').replace(/\|/g, '\\|').trim()))
    if (!rows.length) return ''
    const head = `| ${rows[0].join(' | ')} |\n| ${rows[0].map(() => '---').join(' | ')} |`
    return `\n\n${[head, ...rows.slice(1).map((r) => `| ${r.join(' | ')} |`)].join('\n')}\n\n`
  },
})

const attr = (html, re) => html.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : e.name === 'index.html' ? [join(d, e.name)] : []))

// The work runs in its own Node process: by build:done Astro's heap is close to full.
export function generate(out, site) {
  const pages = []
  for (const file of walk(out)) {
    const path = '/' + relative(out, file).replace(/index\.html$/, '').replace(/\/$/, '')
    if (path.startsWith('/examples')) continue
    const html = readFileSync(file, 'utf8')
    if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]
    if (!main) continue
    const page = {
      path,
      url: site + (path === '/' ? '/' : path),
      md: site + (path === '/' ? '/index.md' : `${path}.md`),
      title: (attr(html, /<meta property="og:title" content="([^"]*)"/) ?? path).replace(/ — Apogee$/, ''),
      description: attr(html, /<meta name="description" content="([^"]*)"/) ?? '',
      modified: attr(html, /<meta property="article:modified_time" content="([^"]*)"/),
    }
    const body = td.turndown(main)
      .replace(/^# [^\n]+\n/m, '') // the page's own H1 repeats the title below
      .replace(/(\]\(|Live example: )\//g, `$1${site}/`) // absolute links: the file gets read out of context
      .replace(/\n{3,}/g, '\n\n').trim()
    const head = [`# ${page.title}`, '', `> ${page.description}`, '', `URL: ${page.url}`, ...(page.modified ? [`Last updated: ${page.modified.slice(0, 10)}`] : [])]
    page.body = `${head.join('\n')}\n\n${body}\n`
    writeFileSync(join(out, path === '/' ? 'index.md' : `${path.slice(1)}.md`), page.body)
    pages.push(page)
  }

  // Docs groups and their pages, in sidebar order, from the site search index.
  const byUrl = new Map(pages.map((p) => [p.path, p]))
  const groups = []
  for (const { href, group } of JSON.parse(readFileSync(join(out, 'search.json'), 'utf8'))) {
    if (groups.at(-1)?.name !== group) groups.push({ name: group, pages: [] })
    const page = byUrl.get(href)
    if (page) groups.at(-1).pages.push(page)
  }
  // Guides, foundations and components in full; for section and page families, the overview.
  const full = (g) => ['Getting started', 'Foundations', 'Components'].includes(g.name)
  const line = (p) => `- [${p.title}](${p.md})${p.description ? `: ${p.description}` : ''}`
  const core = groups.filter(full)
  const families = groups.filter((g) => !full(g) && g.pages.length)
  const top = byUrl.get('/')
  writeFileSync(join(out, 'llms.txt'), [
    '# Apogee', '', `> ${SUMMARY}`, '', INTRO, '',
    ...(top ? ['## Site', '', line(top), ''] : []),
    ...core.flatMap((g) => [`## ${g.name}`, '', ...g.pages.map(line), '']),
    '## Sections and pages', '', ...families.map((g) => line(g.pages[0])), '',
    // Every single block and page: links only, which keeps this file under ~100k characters.
    '## Optional', '', ...families.flatMap((g) => g.pages.slice(1).map((p) => `- [${g.name}: ${p.title}](${p.md})`)), '',
  ].join('\n'))
  const fullPages = [...core.flatMap((g) => g.pages), ...families.map((g) => g.pages[0])]
  writeFileSync(join(out, 'llms-full.txt'), `# Apogee\n\n> ${SUMMARY}\n\n${INTRO}\n\n${fullPages.map((p) => p.body).join('\n---\n\n')}`)

  writeFileSync(join(out, 'sitemap.xml'), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map((p) => `  <url><loc>${p.url}</loc>${p.modified ? `<lastmod>${p.modified}</lastmod>` : ''}</url>`),
    '</urlset>', '',
  ].join('\n'))
  console.log(`${pages.length} .md pages, llms.txt (${groups.length} groups), llms-full.txt (${fullPages.length} pages), sitemap.xml`)
}

export default function agentFiles() {
  let site
  return {
    name: 'apogee-agent-files',
    hooks: {
      'astro:config:done': ({ config }) => { site = config.site?.replace(/\/$/, '') ?? '' },
      'astro:build:done': ({ dir }) => {
        execFileSync(process.execPath, [fileURLToPath(import.meta.url), fileURLToPath(dir), site], { stdio: 'inherit' })
      },
    },
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) generate(process.argv[2], process.argv[3])
