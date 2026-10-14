import { test } from 'node:test'
import assert from 'node:assert/strict'
import { responsive } from './responsive.ts'
import { tables } from './responsive-tables.ts'

test('a bare value maps to the base class', () => {
  assert.deepEqual(responsive('row', tables.direction), ['flex-row'])
})
test('an object maps each breakpoint to its prefixed literal', () => {
  assert.deepEqual(responsive({ base: 'column', md: 'row' }, tables.direction), ['flex-col', 'md:flex-row'])
})
test('undefined yields nothing', () => {
  assert.deepEqual(responsive(undefined, tables.direction), [])
})
test('every table cell is a literal class with the breakpoint prefix', () => {
  for (const [name, table] of Object.entries(tables)) {
    for (const [bp, row] of Object.entries(table)) {
      for (const [value, cls] of Object.entries(row)) {
        assert.ok(typeof cls === 'string' && cls.length > 0, `${name}.${bp}.${value}`)
        if (bp !== 'base') assert.ok(cls.startsWith(`${bp}:`), `${name}.${bp}.${value} = ${cls}`)
      }
    }
  }
})

test('divided follows the direction at every breakpoint', () => {
  assert.deepEqual(responsive({ base: 'column', md: 'row' }, tables.divided), [
    '[&>*+*]:border-t [&>*+*]:border-s-0',
    'md:[&>*+*]:border-s md:[&>*+*]:border-t-0',
  ])
})
