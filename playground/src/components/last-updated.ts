// When a file last changed in git, for "Last updated", dateModified and the sitemap's lastmod.
// One `git log` covers every docs page. The site build runs on a copy without .git, so it
// points APOGEE_SOURCE at the real checkout. No git or an uncommitted file → no date.
import { execFileSync } from 'node:child_process'

let dates: Map<string, string> | undefined

function load() {
  const map = new Map<string, string>()
  try {
    const root = process.env.APOGEE_SOURCE ?? execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
    const log = execFileSync('git', ['-C', root, 'log', '--format=%x00%cI', '--name-only', '--', 'playground/src/content/docs'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    // Newest commit first, so the first date seen for a file is its latest change.
    for (const chunk of log.split('\0').slice(1)) {
      const [date, ...files] = chunk.trim().split('\n')
      for (const f of files) if (f && !map.has(f)) map.set(f, date!)
    }
  } catch {}
  return map
}

/** `file` is relative to the playground, e.g. `src/content/docs/button.mdx`. */
export function lastUpdated(file: string): string | undefined {
  dates ??= load()
  return dates.get(`playground/${file.replace(/^\.\//, '')}`)
}
