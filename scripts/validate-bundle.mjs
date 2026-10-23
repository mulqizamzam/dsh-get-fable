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
if (dirs.length !== 46) fail('expected 46 canonical skills, found ' + dirs.length)
else pass('46 skill directories found')
const names = new Set()
for (const dir of dirs) {
  const path = join(skillRoot, dir, 'SKILL.md')
  try {
    const file = await readFile(path, 'utf8')
    const fm = file.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/)
    if (!fm) { fail(dir + '/SKILL.md has no valid frontmatter block'); continue }
    const name = fm[1].match(/^name:\s*['"]?([^'"]+)['"]?\s*$/m)?.[1]?.trim()
    const description = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim()
    if (name !== dir) fail(dir + ': frontmatter name mismatch (' + (name || 'missing') + ')')
    if (!description) fail(dir + ': missing description')
    if (names.has(name)) fail('duplicate skill name ' + name)
    names.add(name)
    if (file.slice(fm[0].length).trim().length < 100) fail(dir + ': suspiciously short skill body')
    await stat(path)
  } catch (error) {
    fail(dir + ': ' + (error instanceof Error ? error.message : String(error)))
  }
}
if (process.exitCode) process.exit(process.exitCode)
pass('frontmatter and body checks completed')
