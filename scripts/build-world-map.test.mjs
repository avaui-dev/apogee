import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inPolygon, runsToPath, buildRegion } from './build-world-map.mjs'
import { maps } from '../registry/components/WorldMap/land.ts'

const square = [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]
const withHole = [...square, [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]]

test('inPolygon is even-odd over rings, so holes are water', () => {
  assert.equal(inPolygon(square, 5, 5), true)
  assert.equal(inPolygon(square, 15, 5), false)
  assert.equal(inPolygon(withHole, 5, 5), false)
  assert.equal(inPolygon(withHole, 2, 2), true)
})

test('runsToPath writes one subpath per run of dots, centred on half cells', () => {
  assert.equal(runsToPath([[1, 1, 0, 1], [0, 0, 0, 0], [0, 1, 1, 1]]), 'M0.5 0.5h1M3.5 0.5h0M1.5 2.5h2')
})

test('a region frames only its own land, with one cell of air around it', () => {
  const island = { type: 'Feature', properties: { CONTINENT: 'Here' }, geometry: { type: 'Polygon', coordinates: [[[10, 10], [20, 10], [20, 20], [10, 20], [10, 10]]] } }
  const other = { type: 'Feature', properties: { CONTINENT: 'There' }, geometry: { type: 'Polygon', coordinates: [[[30, 10], [40, 10], [40, 20], [30, 20], [30, 10]]] } }
  const m = buildRegion([island, other], { take: (p) => p.CONTINENT === 'Here', window: [0, 50, 0, 30], cols: 12 })
  assert.ok(m.west < 10 && m.west > 8 && m.east > 20 && m.east < 22, `west ${m.west} east ${m.east}`)
  assert.ok(!m.d.includes('M11.5') && !m.d.includes('M0.5 '), 'no dots in the padding cells')
})

test('land that runs past the window is framed flush and faded on that side only', () => {
  const big = { type: 'Feature', properties: { CONTINENT: 'Here' }, geometry: { type: 'Polygon', coordinates: [[[10, 10], [60, 10], [60, 20], [10, 20], [10, 10]]] } }
  const m = buildRegion([big], { take: () => true, window: [0, 40, 0, 30], cols: 20 })
  assert.deepEqual(m.fade, { west: false, east: true, north: false, south: false })
  assert.equal(m.east, 40)
})

// Is there a dot at this place on a committed map? Rows of runs → the cell under (lon, lat).
const dotAt = (m, lon, lat) => {
  const x = Math.floor(((lon - m.west) / (m.east - m.west)) * m.cols), y = Math.floor(((m.north - lat) / (m.north - m.south)) * m.rows)
  return [...m.d.matchAll(/M([\d.]+) ([\d.]+)h(\d+)/g)].some(([, rx, ry, n]) => Math.floor(+ry) === y && x >= Math.floor(+rx) && x <= Math.floor(+rx) + +n)
}

test('narrow land keeps its dots: Italy, Greece and Turkey are on the Europe map', () => {
  for (const [place, lon, lat] of [['Rome', 12.5, 41.9], ['Naples', 14.3, 40.85], ['Athens', 23.7, 38.0], ['Sicily', 14.2, 37.5], ['Istanbul', 28.97, 41.0], ['Ankara', 32.8, 39.9]]) {
    assert.ok(dotAt(maps.europe, lon, lat), `${place} has a dot`)
  }
})

test('regional shapes come out true: rows follow the cosine of the middle latitude', () => {
  const m = maps.europe, mid = ((m.north + m.south) / 2) * Math.PI / 180
  const expected = ((m.north - m.south) / ((m.east - m.west) / m.cols)) / Math.cos(mid)
  assert.ok(Math.abs(m.rows - expected) <= 1, `europe rows ${m.rows}, expected about ${expected.toFixed(1)}`)
  assert.equal(maps.world.rows, 72)
})

test('the committed maps: every region has the same columns but the world, and dots', () => {
  for (const [name, m] of Object.entries(maps)) {
    assert.equal(m.cols, name === 'world' ? 180 : 120, name)
    assert.ok(m.d.length > 500 && m.rows > 10, name)
    assert.ok(m.west < m.east && m.south < m.north, name)
  }
  // Europe stops at 45°E and Russia fades out; North America leaves Greenland to the world map.
  assert.equal(maps.europe.fade.east, true)
  assert.equal(maps.europe.east, 45)
  assert.ok(maps['north-america'].east < -50, `north-america east ${maps['north-america'].east}`)
  assert.equal(maps.oceania.fade.east, false, 'New Zealand is not faded')
  assert.equal(maps.africa.fade.west || maps.africa.fade.east || maps.africa.fade.north || maps.africa.fade.south, false)
})
