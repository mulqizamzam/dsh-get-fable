import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const manifest = JSON.parse(await readFile('docs/RESOURCE-MANIFEST.json', 'utf8'))
const fail = message => { console.error('FAIL: ' + message); process.exitCode = 1 }
const pass = message => console.log('PASS: ' + message)

if (manifest.schemaVersion !== 1) fail('unsupported resource manifest schema')
if (manifest.upstreamCommit !== '36920932251ffc619da6073eb02cb35a9a2f2dbf') fail('resource manifest upstream pin changed without review')

const skillDirs = (await readdir('skills', { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
const skillDocs = await Promise.all(skillDirs.map(async name => {
  try { return { name, content: await readFile(join('skills', name, 'SKILL.md'), 'utf8') } }
  catch { return null }
}))
const docs = skillDocs.filter(Boolean)
if (docs.length !== 75) fail('expected 75 top-level SKILL.md files, found ' + docs.length)

const resolved = new Set(manifest.resolvedPaths)
const unavailable = new Set(manifest.unavailablePaths)
const directoryTargets = new Set(manifest.directoryTargets)
const linkedFiles = new Set()
const linkedDirectories = new Set()
const upstreamLink = /\]\(https:\/\/github\.com\/imMamdouhaboammar\/get-fable\/(blob|tree)\/([0-9a-f]{40})\/([^\s)]+)\)/g
const localResourceToken = /`((?:references|examples|templates|scripts|assets)\/[^\`]+)`/g
const localResourceLink = /\]\(((?:references|examples|templates|scripts|assets)\/[^)]+)\)/g

for (const doc of docs) {
  for (const match of doc.content.matchAll(localResourceToken)) {
    fail(doc.name + ': unresolved relative resource token ' + match[1])
  }
  for (const match of doc.content.matchAll(localResourceLink)) {
    fail(doc.name + ': unresolved relative resource link ' + match[1])
  }
  for (const match of doc.content.matchAll(upstreamLink)) {
    const [, kind, commit, path] = match
    if (commit !== manifest.upstreamCommit) fail(doc.name + ': unpinned or stale upstream resource URL ' + path)
    if (kind === 'blob') {
      if (!resolved.has(path)) fail(doc.name + ': resource URL missing from manifest ' + path)
      linkedFiles.add(path)
    } else {
      if (!directoryTargets.has(path)) fail(doc.name + ': directory URL missing from manifest ' + path)
      linkedDirectories.add(path)
    }
  }
}

for (const path of resolved) if (!linkedFiles.has(path)) fail('manifest resource is not linked by any skill: ' + path)
for (const path of unavailable) {
  if (linkedFiles.has(path)) fail('unavailable resource is incorrectly linked: ' + path)
}
for (const path of directoryTargets) if (!linkedDirectories.has(path)) fail('manifest directory is not linked: ' + path)

if (manifest.localCopiesBundled !== 0) fail('localCopiesBundled must describe the current no-copy policy')
if (unavailable.size !== 12) fail('expected 12 explicitly unavailable port-only resources, found ' + unavailable.size)
if (resolved.size !== 117) fail('expected 117 pinned upstream resource files, found ' + resolved.size)
if (process.exitCode) process.exit(process.exitCode)
pass(docs.length + ' skill docs scanned')
pass(linkedFiles.size + ' pinned upstream file targets verified against the manifest')
pass(linkedDirectories.size + ' pinned upstream directory targets verified')
pass(unavailable.size + ' unavailable port-only references explicitly excluded')
pass('no unresolved relative supporting-resource references')
