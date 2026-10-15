import { test } from 'node:test'
import assert from 'node:assert/strict'
import { acceptsFile, readableSize } from './files.ts'

test('acceptsFile matches extensions, wildcards and exact types, case-insensitively', () => {
  assert.equal(acceptsFile('image/*', { name: 'a.exe', type: 'application/x-msdownload' }), false)
  assert.equal(acceptsFile('image/*', { name: 'a.png', type: 'image/png' }), true)
  assert.equal(acceptsFile('.pdf,.PNG', { name: 'a.png', type: 'image/png' }), true)
  assert.equal(acceptsFile('.pdf, .docx', { name: 'cv.PDF', type: '' }), true)
  assert.equal(acceptsFile('image/png', { name: 'a.jpg', type: 'image/jpeg' }), false)
  assert.equal(acceptsFile(undefined, { name: 'anything', type: '' }), true)
  assert.equal(acceptsFile('', { name: 'anything', type: '' }), true)
})

test('readableSize uses B, KB, MB, GB with one decimal below ten', () => {
  assert.equal(readableSize(0), '0 B')
  assert.equal(readableSize(512), '512 B')
  assert.equal(readableSize(1536), '1.5 KB')
  assert.equal(readableSize(1024 * 1024), '1 MB')
  assert.equal(readableSize(2.5 * 1024 * 1024), '2.5 MB')
  assert.equal(readableSize(15.7 * 1024 * 1024), '16 MB')
})
