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
assert.equal(skills.length, 47, 'expected 46 upstream skills plus the DSH fable-bug-hunt specialist')
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
  if (skill.name === 'get-fable') {
    assert.ok(definition.content.includes('fable-bug-hunt'), 'router must dispatch unknown-root-cause bugs to the specialist')
    assert.ok(definition.content.includes('skill being found, named, or loaded is not evidence that diagnosis has happened'), 'router must not treat loading as diagnosis completion')
    assert.ok(definition.content.indexOf('bug report with unknown causal mechanism → `fable-bug-hunt`') < definition.content.indexOf('blocking unknown that changes design on a non-bug task → discover/research/plan'), 'bug diagnosis must precede generic discovery routing')
  }
  if (skill.name === 'fable-bug-hunt') {
    assert.ok(definition.content.includes('## Diagnosis Packet'), 'bug-hunt must define a structured diagnosis result')
    assert.ok(definition.content.includes('### 6. Window and context budget protocol'), 'bug-hunt must guard against context-window exhaustion')
    assert.ok(definition.content.includes('Skill load is not diagnosis completion.'), 'bug-hunt must reject load-only completion')
  }
}

assert.equal(await provider.get({ locator: '../package.json' }), undefined, 'path traversal locator must be rejected')

const aborted = new AbortController()
aborted.abort(new Error('test abort'))
await assert.rejects(provider.list({ signal: aborted.signal }), /test abort/)
console.log('PASS: DSH skill provider smoke test (47 skills, list/get, diagnosis closure, policy, resource hint, abort, path traversal)')
