import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-get-fable'
export const inject = ['skills']

const pluginRoot = dirname(fileURLToPath(import.meta.url))
const skillsRoot = join(pluginRoot, 'skills')
const providerName = 'dsh-get-fable'
const resourceBase = { kind: 'opaque', description: 'The lifecycle routing registry is bundled under skills/get-fable/registry.json. Other upstream companion reference files are not bundled locally; follow the pinned GitHub links included in each skill body when source detail is needed.' }
const skillNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/

function parseQuotedScalar(value) {
  const trimmed = value.trim()
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'")
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try { return JSON.parse(trimmed) } catch { return trimmed.slice(1, -1).replace(/\\(["\\])/g, '$1') }
  }
  return trimmed
}

function readSkillMetadata(source, filePath) {
  const match = source.match(frontmatterPattern)
  if (!match) throw new Error('Missing YAML frontmatter in ' + filePath)
  const lines = match[1].split(/\r?\n/)
  const nameLine = lines.find(line => /^name:\s*/.test(line))
  const descriptionIndex = lines.findIndex(line => /^description:\s*/.test(line))
  if (!nameLine || descriptionIndex < 0) throw new Error('Skill requires name and description: ' + filePath)

  const skillName = parseQuotedScalar(nameLine.replace(/^name:\s*/, ''))
  let rawDescription = lines[descriptionIndex].replace(/^description:\s*/, '')
  if (/^(?:[>|][+-]?)$/.test(rawDescription.trim())) {
    const block = []
    for (const line of lines.slice(descriptionIndex + 1)) {
      if (/^[A-Za-z][A-Za-z0-9_-]*:\s*/.test(line)) break
      if (line.trim()) block.push(line.trim())
    }
    rawDescription = block.join(' ')
  }
  const description = parseQuotedScalar(rawDescription)
  if (!skillNamePattern.test(skillName) || !description) {
    throw new Error('Invalid skill name or empty description in ' + filePath)
  }
  return { name: skillName, description, frontmatter: match[0] }
}

function throwIfAborted(signal) {
  if (signal && signal.aborted) throw signal.reason || new Error('Skill operation aborted')
}

async function loadSkillFiles() {
  const children = await readdir(skillsRoot, { withFileTypes: true })
  const dirs = children.filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))
  const results = []
  for (const dir of dirs) {
    if (!skillNamePattern.test(dir.name)) continue
    const filePath = join(skillsRoot, dir.name, 'SKILL.md')
    try {
      const source = await readFile(filePath, 'utf8')
      const metadata = readSkillMetadata(source, filePath)
      if (metadata.name !== dir.name) {
        throw new Error('Skill directory/name mismatch: ' + dir.name + ' vs ' + metadata.name)
      }
      results.push({ ...metadata, slug: dir.name, filePath, resourceBase: dirname(filePath) })
    } catch (error) {
      throw new Error('Cannot load bundled skill ' + dir.name + ': ' + (error instanceof Error ? error.message : String(error)))
    }
  }
  return results
}

/**
 * Register the packaged Fable skill set with DSH's native skill registry.
 * The registry and model-facing loader remain owned by DSH; this plugin is a
 * portable, read-only provider of the skill catalog and instruction bodies.
 */
export function apply(ctx) {
  ctx.skills.registerProvider(() => {
    let cache
    const load = async (signal) => {
      throwIfAborted(signal)
      cache ??= loadSkillFiles()
      const entries = await cache
      throwIfAborted(signal)
      return entries
    }

    return {
      name: providerName,
      async list(options = {}) {
        const entries = await load(options.signal)
        return entries.map(skill => ({
          name: skill.name,
          description: skill.description,
          whenToUse: skill.description,
          rank: 600,
          locator: skill.slug,
          source: 'bundled',
          provider: providerName,
          invocation: { modelInvocable: true, userInvocable: true },
          resourceBase,
        }))
      },
      async get(candidate, options = {}) {
        throwIfAborted(options.signal)
        if (typeof candidate?.locator !== 'string' || !skillNamePattern.test(candidate.locator)) return undefined
        const filePath = join(skillsRoot, candidate.locator, 'SKILL.md')
        const source = await readFile(filePath, 'utf8')
        throwIfAborted(options.signal)
        const metadata = readSkillMetadata(source, filePath)
        if (metadata.name !== candidate.locator) return undefined
        return {
          name: metadata.name,
          description: metadata.description,
          whenToUse: metadata.description,
          content: source.slice(metadata.frontmatter.length).trimStart(),
          source: 'bundled',
          provider: providerName,
          invocation: { modelInvocable: true, userInvocable: true },
          resourceBase,
        }
      },
    }
  })
}
