import assert from 'node:assert/strict'
import { apply, inject, name } from '../index.js'

const controller = new AbortController()
let provider
const ctx = {
  skills: {
    registerProvider(factory) {
      provider = factory({ signal: controller.signal, invalidate() {} })
      return () => {}
    },
  },
}

assert.equal(name, 'dsh-get-fable')
assert.deepEqual(inject, ['skills'])
apply(ctx)

const skills = await provider.list({ signal: controller.signal })
assert.equal(skills.length, 46, 'expected all 46 canonical skills')
const names = new Set(skills.map(skill => skill.name))
assert.equal(names.size, skills.length, 'skill names must be unique')

for (const skill of skills) {
  assert.ok(skill.description.length > 0, skill.name + ': missing description')
  assert.equal(skill.provider, 'dsh-get-fable')
  assert.equal(skill.invocation.modelInvocable, true)
  assert.equal(skill.invocation.userInvocable, true)
  assert.equal(skill.resourceBase.kind, 'opaque')

  const definition = await provider.get(skill, { signal: controller.signal })
  assert.ok(definition, skill.name + ': provider did not load skill body')
  assert.equal(definition.name, skill.name)
  assert.equal(definition.description, skill.description)
  assert.ok(definition.content.length > 1000, skill.name + ': body unexpectedly short')
  assert.ok(definition.content.includes('## DSH host and authorization boundary'), skill.name + ': missing safety boundary')
}

assert.equal(await provider.get({ locator: '../package.json' }), undefined, 'path traversal locator must be rejected')

const aborted = new AbortController()
aborted.abort(new Error('test abort'))
await assert.rejects(provider.list({ signal: aborted.signal }), /test abort/)
console.log('PASS: DSH skill provider smoke test (46 skills, list/get, policy, resource hint, abort, path traversal)')
