import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareCells } from './table-enhance.ts'

test('compareCells orders formatted numbers numerically and text naturally', () => {
  assert.deepEqual(['900', '1,200', '80'].sort(compareCells), ['80', '900', '1,200'])
  assert.deepEqual(['$34.50', '$12.00', '$5'].sort(compareCells), ['$5', '$12.00', '$34.50'])
  assert.deepEqual(['item 10', 'item 9', 'Item 1'].sort(compareCells), ['Item 1', 'item 9', 'item 10'])
})
