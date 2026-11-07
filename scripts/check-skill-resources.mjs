import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'

const root = process.cwd()
const manifest = JSON.parse(await readFile(resolve(root, 'docs/RESOURCE-MANIFEST.json'), 'utf8'))
const fail = message => { console.error('FAIL: ' + message); process.exitCode = 1 }
const pass = message => console.log('PASS: ' + message)

if (manifest.schemaVersion !== 2) fail('unsupported resource manifest schema')
if (manifest.upstreamCommit !== '36920932251ffc619da6073eb02cb35a9a2f2dbf') fail('resource manifest upstream pin changed without review')
if (manifest.upstreamLicense !== 'AGPL-3.0-or-later') fail('upstream resource license is not recorded')
if (manifest.localCopiesBundled !== 125) fail('expected 125 bundled resources, found ' + manifest.localCopiesBundled)

const skillDirs = (await readdir(resolve(root, 'skills'), { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
const docs = []
for (const name of skillDirs) {
  const path = 'skills/' + name + '/SKILL.md'
  try {
    docs.push({ name, path, content: await readFile(resolve(root, path), 'utf8') })
  } catch {
    // A directory without a SKILL.md is not a registered skill document.
  }
}
if (docs.length !== 75) fail('expected 75 top-level SKILL.md files, found ' + docs.length)

const resolved = new Set(manifest.resolvedPaths)
const unavailable = new Set(manifest.unavailablePaths)
const directoryTargets = new Set(manifest.directoryTargets)
const linkedFiles = new Set()
const linkedDirectories = new Set()
const localResourceLink = /\]\(((?:\.\.\/)?(?:references|examples|templates|scripts|assets|fable-method\/references)\/[^)]+)\)/g

async function inspectPath(path, expectedType) {
  try {
    const info = await stat(resolve(root, path))
    if (expectedType === 'file' && !info.isFile()) fail('expected file: ' + path)
    if (expectedType === 'directory' && !info.isDirectory()) fail('expected directory: ' + path)
    return true
  } catch {
    fail('missing local resource: ' + path)
    return false
  }
}

for (const doc of docs) {
  if (/https:\/\/github\.com\/imMamdouhaboammar\/get-fable\/(blob|tree)\//.test(doc.content)) {
    fail(doc.name + ': remote upstream resource URL remains in SKILL.md')
  }
  for (const match of doc.content.matchAll(localResourceLink)) {
    const target = match[1].replace(/\/$/, '')
    const localPath = resolve(root, dirname(doc.path), target)
    const relativePath = relative(root, localPath).split(sep).join('/')
    if (relativePath === '..' || relativePath.startsWith('../')) {
      fail(doc.name + ': resource path escapes repository: ' + target)
      continue
    }
    try {
      const info = await stat(localPath)
      if (info.isFile()) linkedFiles.add(relativePath)
      else if (info.isDirectory()) linkedDirectories.add(relativePath)
      else fail(doc.name + ': resource target is not a file or directory: ' + target)
    } catch {
      fail(doc.name + ': broken relative resource link ' + target)
    }
  }
}

for (const path of resolved) await inspectPath(path, 'file')
for (const path of resolved) {
  if (!path.startsWith('skills/fable-method/references/domains/') && !linkedFiles.has(path)) {
    fail('manifest file is not linked by any skill: ' + path)
  }
}
for (const path of directoryTargets) {
  await inspectPath(path, 'directory')
  if (!linkedDirectories.has(path)) fail('domain/resource directory is not linked: ' + path)
}
for (const path of unavailable) {
  try {
    await stat(resolve(root, path))
    fail('unavailable path is incorrectly bundled: ' + path)
  } catch {
    // Expected: missing upstream material must remain unavailable.
  }
}

if (unavailable.size !== 12) fail('expected 12 unavailable port-only references, found ' + unavailable.size)
if (resolved.size !== 125) fail('expected 125 manifest files, found ' + resolved.size)
if (manifest.resourceCounts?.explicitResolvedReferences !== 117) fail('explicit upstream resource count drifted')
if (manifest.resourceCounts?.additionalDomainDirectoryFiles !== 8) fail('additional domain resource count drifted')
if (manifest.licenseFiles?.length !== 4) fail('expected four preserved upstream license/notice files')
for (const path of manifest.licenseFiles ?? []) await inspectPath(path, 'file')

if (process.exitCode) process.exit(process.exitCode)
pass(docs.length + ' skill docs scanned')
pass(resolved.size + ' bundled supporting files verified')
pass(linkedFiles.size + ' local resource file links resolved')
pass(linkedDirectories.size + ' local resource directory links resolved')
pass(unavailable.size + ' unavailable port-only references explicitly excluded')
pass('upstream license and third-party notices are present')
