import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootPath = dirname(fileURLToPath(import.meta.url)).replace(/[\\/]scripts$/, '')
const readJson = async path => JSON.parse(await readFile(join(rootPath, path), 'utf8'))
const fail = message => { console.error('FAIL: ' + message); process.exitCode = 1 }
const pass = message => console.log('PASS: ' + message)

const pkg = await readJson('package.json')
if (pkg.name !== '@mulqizamzam/dsh-get-fable') fail('unexpected package name')
else pass('package identity')
if (pkg.dsh?.manifestVersion !== 1 || pkg.dsh?.bundle?.patch !== './cordis.patch.yml') fail('invalid DSH bundle manifest')
else pass('DSH manifest contract')
if (pkg.engines?.dsh !== '0.2.1-rc.2') fail('engines.dsh must target exactly 0.2.1-rc.2')
else pass('exact DSH compatibility target')
const patch = await readFile(join(rootPath, 'cordis.patch.yml'), 'utf8')
if (!patch.includes("name: '@mulqizamzam/dsh-get-fable'") || !patch.includes('id: dsh-get-fable-skills')) fail('Cordis patch does not register this package')
else pass('Cordis patch registration')

const skillRoot = join(rootPath, 'skills')
const dirs = (await readdir(skillRoot, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
if (dirs.length !== 75) fail('expected 75 bundled skills (47 original/port-specific skills plus 28 flattened Wise specialists), found ' + dirs.length)
else pass('47 bundled skill directories found')
const names = new Set()
for (const dir of dirs) {
  const path = join(skillRoot, dir, 'SKILL.md')
  try {
    const file = await readFile(path, 'utf8')
    const fm = file.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/)
    if (!fm) { fail(dir + '/SKILL.md has no valid frontmatter block'); continue }
    const name = fm[1].match(/^name:\s*['"]?([^'\"\r\n]+)['"]?\s*$/m)?.[1]?.trim()
    const description = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim()
    if (name !== dir) fail(dir + ': frontmatter name mismatch (' + (name || 'missing') + ')')
    if (!description) fail(dir + ': missing description')
    for (const key of ['disable-model-invocation', 'user-invocable']) {
      const flag = fm[1].match(new RegExp('^' + key + ':\\s*(\\S+)\\s*$', 'm'))
      if (flag && flag[1] !== 'true' && flag[1] !== 'false') fail(dir + ': invalid boolean frontmatter value for ' + key)
    }
    if (names.has(name)) fail('duplicate skill name ' + name)
    names.add(name)
    if (file.slice(fm[0].length).trim().length < 100) fail(dir + ': suspiciously short skill body')
    if (!file.includes('## DSH host and authorization boundary')) fail(dir + ': missing DSH host/authorization boundary')
    await stat(path)
  } catch (error) {
    fail(dir + ': ' + (error instanceof Error ? error.message : String(error)))
  }
}
const registry = await readJson('skills/get-fable/registry.json')
if (registry.schemaVersion !== 2 || registry.entry !== 'get-fable' || !Array.isArray(registry.skills)) {
  fail('invalid canonical routing registry')
} else {
  const ids = new Set(registry.skills.map(skill => skill.id))
  if (ids.size !== 75 || ids.size !== registry.skills.length) fail('routing registry must contain 75 unique skills')
  if (dirs.some(dir => !ids.has(dir)) || [...ids].some(id => !dirs.includes(id))) fail('routing registry and skill directories differ')
  for (const skill of registry.skills) {
    const targets = [...(skill.next || []), ...(skill.fallback ? [skill.fallback] : [])]
    for (const target of targets) if (!ids.has(target)) fail(skill.id + ': dangling routing target ' + target)
  }
  if (!process.exitCode) pass('canonical routing registry and graph references')
}
const router = await readFile(join(skillRoot, 'get-fable/SKILL.md'), 'utf8')
const bugHunt = await readFile(join(skillRoot, 'fable-bug-hunt/SKILL.md'), 'utf8')
const wise = await readFile(join(skillRoot, 'fable-wise/SKILL.md'), 'utf8')
const redteam = await readFile(join(skillRoot, 'fable-redteam/SKILL.md'), 'utf8')
const expectedWiseSkills = ["re0-upgrade","ssotize","catchup","nba","re0-loop","re0-memo","re0-plan","re0-work","aim","autobahn","debloat","dedash","detool","factchk","feynman","hate","macrothink","mandela","modelchk","re0-git","re0-merge","re0-release","re0","readchk","reorder","shower","sip","prism"]
const userInvokedOnly = new Set(['re0-upgrade', 're0-plan', 'debloat', 'dedash', 'feynman', 'hate', 'macrothink', 're0-git', 're0-merge', 're0-release', 'reorder', 'prism'])
for (const id of expectedWiseSkills) {
  if (!ids.has(id) || !dirs.includes(id) || !wise.includes('`' + id + '`')) fail('missing Wise specialist route or bundle entry: ' + id)
  const source = await readFile(join(skillRoot, id, 'SKILL.md'), 'utf8')
  const flag = /^disable-model-invocation:\\s*true\\s*$/m.test(source.match(/^---\\s*\\n([\\s\\S]*?)\\n---/m)?.[1] || '')
  if (flag !== userInvokedOnly.has(id)) fail(id + ': upstream user-invoked-only policy was not preserved')
}
if (!redteam.includes('guidance-only security-review procedure') || redteam.includes('Full Audit Mode') || redteam.includes('Use native TS HTTP probe') || redteam.includes('Cloudflare Audit Adapter') || redteam.includes('report-schema.json compliance')) fail('red-team skill still claims a scanner/runtime that is not shipped')

const bugRouteIndex = router.indexOf('bug report with unknown causal mechanism → `fable-bug-hunt`')
const designRouteIndex = router.indexOf('blocking unknown that changes design on a non-bug task → discover/research/plan')
if (!router.includes('fable-bug-hunt') || !router.includes('skill being found, named, or loaded is not evidence that diagnosis has happened') || bugRouteIndex < 0 || designRouteIndex < 0 || bugRouteIndex > designRouteIndex) fail('router is missing the diagnosis dispatch/closure contract or gives generic discovery higher precedence')
if (!bugHunt.includes('## Diagnosis Packet') || !bugHunt.includes('### 6. Window and context budget protocol') || !bugHunt.includes('Skill load is not diagnosis completion.')) fail('fable-bug-hunt is missing its packet or window-closure contract')
if (process.exitCode) process.exit(process.exitCode)
pass('frontmatter, authorization boundary, diagnosis dispatch, packet, and window-closure checks completed')
