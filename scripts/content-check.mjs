import assert from 'node:assert/strict'
import { isSafeImageUrl, safeImageUrl, safeRoutePart } from '../src/services/safeContent.ts'

for (const url of ['/assets/products/basmati-rice.png', 'https://images.example.com/rice.png', 'http://localhost:8000/media/milk.png']) assert(isSafeImageUrl(url), url)
for (const url of ['', null, {}, 'data:text/plain,example', 'file:///tmp/rice.png', '//images.example.com/rice.png', '/assets/../private.png', 'https://user:password@images.example.com/rice.png', 'https://images.example.com/a b.png']) {
  assert(!isSafeImageUrl(url), String(url))
  assert.equal(safeImageUrl(url), '/assets/brand/griha-mart-logo.png')
}
assert(safeRoutePart('GM-ABC_123'))
for (const id of ['', '../account', 'some/path', '?route=account', null]) assert(!safeRoutePart(id))
console.log('PASS: shared image URL policy, safe fallback and route-segment validation.')
