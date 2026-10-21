// Every docs page for the site search (⌘K), grouped like the sidebar. SiteHeader's CommandPalette
// fetches it on first open; agent-files.mjs reads it for the llms.txt groups.
import { docsNav } from '../components/docs-nav.ts'

export async function GET() {
  const nav = await docsNav()
  return Response.json(nav.flatMap((g) => g.items.map((i) => ({ label: i.title, href: i.href, group: g.group }))))
}
