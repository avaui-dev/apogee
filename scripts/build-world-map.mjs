#!/usr/bin/env node
// Generates registry/components/WorldMap/land.ts: one dot grid per region, from
// Natural Earth admin-0 countries (public domain), equirectangular.
// Every continent gets the same number of columns over its own tight bounds, so
// dots are the same size and spacing in every region, and only that continent's
// land is dotted (no neighbours leaking into the frame).
//   node scripts/build-world-map.mjs path/to/ne_50m_admin_0_countries.geojson

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Which land each region dots, and the window it may look in (west, east, south, north).
// Land is only dotted inside the window. Where it runs on past the window's edge, the
// region is framed flush to that edge and the map fades it out there (\`fade\`).
export const regions = {
  world: { take: (p) => !['Antarctica', 'Seven seas (open ocean)'].includes(p.CONTINENT), window: [-180, 180, -60, 84], cols: 180, fixed: true },
  // Greenland is Danish and makes the continent twice as wide; the world map keeps it.
  'north-america': { take: (p) => p.CONTINENT === 'North America' && p.ADMIN !== 'Greenland', window: [-168, -50, 5, 84], cols: 120 },
  'south-america': { take: (p) => p.CONTINENT === 'South America', window: [-95, -25, -60, 15], cols: 120 },
  // Turkey and Cyprus are tagged Asia; they belong on a map of Europe too.
  europe: { take: (p) => p.CONTINENT === 'Europe' || ['Turkey', 'Cyprus'].includes(p.ADMIN), window: [-25, 45, 34, 72], cols: 120 },
  africa: { take: (p) => p.CONTINENT === 'Africa', window: [-30, 60, -40, 40], cols: 120 },
  asia: { take: (p) => p.CONTINENT === 'Asia' || p.ADMIN === 'Russia', window: [26, 180, -12, 82], cols: 120 },
  // Fiji and Tuvalu straddle 180°; leaving them out keeps New Zealand clear of the edge.
  oceania: { take: (p) => p.CONTINENT === 'Oceania' && !['Fiji', 'Tuvalu'].includes(p.ADMIN), window: [110, 180, -50, 0], cols: 120 },
}

// Even-odd ray cast over every ring of a polygon (holes included).
export const inPolygon = (rings, lon, lat) => {
  let inside = false
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j]
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
    }
  }
  return inside
}

// Polygons with their bounding boxes, for one region's countries.
export const polygonsOf = (features, take) =>
  features.filter((f) => take(f.properties)).flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates))
    .map((rings) => {
      const xs = rings[0].map((p) => p[0]), ys = rings[0].map((p) => p[1])
      return { rings, box: [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)] }
    })

export const isLand = (polys, lon, lat) => polys.some(({ rings, box }) => lon >= box[0] && lon <= box[1] && lat >= box[2] && lat <= box[3] && inPolygon(rings, lon, lat))

// Rows of 0/1 → one subpath per run of dots: "M{x} {y}h{n}". Dot centres sit on half
// cells; drawn with stroke-dasharray "0 1" and round caps, each run is a row of dots.
export const runsToPath = (grid) => {
  const out = []
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue
      let end = x
      while (row[end + 1]) end++
      out.push(`M${x + 0.5} ${y + 0.5}h${end - x}`)
      x = end
    }
  })
  return out.join('')
}

export const buildRegion = (features, { take, window, cols, fixed }) => {
  const polys = polygonsOf(features, take)
  let [west, east, south, north] = window
  const fade = { west: false, east: false, north: false, south: false }
  if (!fixed) {
    // Tight bounds: where this land actually is inside the window, sampled every 0.25°.
    let w = 180, e = -180, s = 90, n = -90
    for (let lon = west; lon <= east; lon += 0.25) for (let lat = south; lat <= north; lat += 0.25) {
      if (isLand(polys, lon, lat)) { w = Math.min(w, lon); e = Math.max(e, lon); s = Math.min(s, lat); n = Math.max(n, lat) }
    }
    // Land touching the window runs on past it: frame flush there and fade that side.
    // Elsewhere leave one cell of air.
    const pad = (e - w) / (cols - 2), edge = 0.5
    fade.west = w <= west + edge; fade.east = e >= east - edge; fade.south = s <= south + edge; fade.north = n >= north - edge
    ;[west, east, south, north] = [fade.west ? west : w - pad, fade.east ? east : e + pad, fade.south ? south : s - pad, fade.north ? north : n + pad]
  }
  // Longitude is scaled by the cosine of the region's middle latitude, so shapes there come
  // out true (a degree east is shorter than a degree north away from the equator). The
  // world keeps the plain projection. Cells stay square on screen; pins only need bounds.
  const k = fixed ? 1 : Math.cos((((north + south) / 2) * Math.PI) / 180)
  const step = (east - west) / cols
  const latStep = step * k
  const rows = Math.round((north - south) / latStep)
  // A cell is land when any of 9 points across it is: narrow land (Italy, Greece,
  // islands) keeps its dots, where one sample at the centre missed most of it.
  const cellIsLand = (x, y) => {
    let hits = 0
    for (const dx of [1 / 6, 1 / 2, 5 / 6]) for (const dy of [1 / 6, 1 / 2, 5 / 6]) if (isLand(polys, west + (x + dx) * step, north - (y + dy) * latStep) && ++hits >= 1) return true
    return false
  }
  const grid = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => cellIsLand(x, y)))
  const r = (v) => Math.round(v * 100) / 100
  return { west: r(west), east: r(east), north: r(north), south: r(north - rows * latStep), cols, rows, fade, d: runsToPath(grid) }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = process.argv[2]
  if (!source) throw new Error('usage: node scripts/build-world-map.mjs <ne_50m_admin_0_countries.geojson>')
  const { features } = JSON.parse(readFileSync(source, 'utf8'))
  const maps = Object.fromEntries(Object.entries(regions).map(([name, def]) => [name, buildRegion(features, def)]))
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'registry', 'components', 'WorldMap', 'land.ts')
  writeFileSync(out, `// Land as dots, one grid per region: Natural Earth 50m admin-0 countries (public
// domain), equirectangular. Each region has its own bounds and the same number of
// columns, so dots match in size. \`d\` is one subpath per run of dots, in cell units.
// Generated by scripts/build-world-map.mjs, not hand-edited.
export const maps = ${JSON.stringify(maps, null, 2)} as const
`)
  for (const [name, m] of Object.entries(maps)) console.log(`${name}: ${m.cols}×${m.rows}, ${m.west}…${m.east}°, ${m.south}…${m.north}°, ${(m.d.length / 1024).toFixed(1)} KB`)
}
