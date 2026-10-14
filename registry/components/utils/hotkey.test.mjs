import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseHotkey, matchesHotkey } from './hotkey.ts'

const ev = (o) => ({ key: 'k', metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, target: { tagName: 'BODY', isContentEditable: false, closest: () => null }, ...o })

test('parseHotkey splits modifiers and the key', () => {
  assert.deepEqual(parseHotkey('mod+k'), { key: 'k', mod: true, shift: false, alt: false })
  assert.deepEqual(parseHotkey('Shift+Alt+P'), { key: 'p', mod: false, shift: true, alt: true })
  assert.deepEqual(parseHotkey('escape'), { key: 'escape', mod: false, shift: false, alt: false })
})
test('mod is Meta on mac and Control elsewhere', () => {
  assert.equal(matchesHotkey(ev({ metaKey: true }), 'mod+k', true), true)
  assert.equal(matchesHotkey(ev({ ctrlKey: true }), 'mod+k', true), false)
  assert.equal(matchesHotkey(ev({ ctrlKey: true }), 'mod+k', false), true)
  assert.equal(matchesHotkey(ev({ metaKey: true }), 'mod+k', false), false)
})
test('typing targets are ignored unless asked', () => {
  const typing = ev({ metaKey: true, target: { tagName: 'INPUT', isContentEditable: false, closest: () => null } })
  assert.equal(matchesHotkey(typing, 'mod+k', true), false)
  assert.equal(matchesHotkey(typing, 'mod+k', true, false), true)
})
