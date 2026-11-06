# Porting and verification record

## Target and source

- Source: [imMamdouhaboammar/get-fable](https://github.com/imMamdouhaboammar/get-fable)
- Source behavior inspected: project README, DSH integration guide, package metadata, native DSH manifest/patch, lifecycle router skill, and canonical skill inventory.
- Target: DeepSeek Harness **0.2.1-rc.2**
- Destination: [mulqizamzam/dsh-get-fable](https://github.com/mulqizamzam/dsh-get-fable)
- Architecture: **native Cordis bundle + DSH skill-provider registry**; no MCP server or external service is required for skill discovery.

## Workflow disposition

| Source capability | Disposition | Rationale |
|---|---|---|
| Lifecycle routing and specialist skill catalog | preserve as bundled skills | Core repeatable user workflow; consumed through DSH's native ctx.skills registry and skill tool. |
| Discovery, source-grounded research, planning, TDD, bounded execution, verification, recovery | preserve as bundled skills | Core engineering lifecycle, useful across repositories and coding tasks. |
| Unknown-root-cause diagnosis through a bounded probe loop and structured Diagnosis Packet | added DSH-specific `fable-bug-hunt` adapter | Closes the gap between routing/loading a skill and actually returning a diagnosis; if the current window cannot prove the cause, it requires a resumable next-probe packet. |
| Review, security, static red-team guidance, remediation, test engineering, evidence judging, anti-churn | preserve as bundled instructions; `fable-redteam` is guidance-only | Active HTTP scanning, the Cloudflare adapter, report schema, SARIF generation, and the source red-team engine are not included in this bundle. |
| Release readiness, handoff, finish-turn, evaluation, learning, repository stewardship | preserve as bundled skills | Continuity, quality, and delivery workflows. |
| Architecture, delegation, context thrift, council, dataviz, artifacts, simplification, loops, runtime verification, memory/config/simulation/cowork, skill creation/domain adaptation | preserve as bundled skills | Useful productivity and platform-agnostic engineering workflows. |
| Runtime /api/fable/* services and dashboard UI | not carried in this initial port | The source guide documents these, but their implementation bundle was not available for full inspection in the source snapshot; reimplementing them without the actual contract risks fabricating behavior. |
| Optional OpenAI-compatible local request proxy, gRPC/Rust engines, cross-platform installers and host-specific lifecycle hooks | excluded from DSH bundle | They are separate runtime/platform surfaces, are not necessary for native skill discovery, and need their own compatibility/security review. |
| Upstream package/release automation | reference only | Release mechanics for the upstream product must not silently publish or mutate another repository from a DSH skill. |

## DSH-native design

The package root has a package.json with dsh.manifestVersion: 1, an explicit Cordis bundle patch, a module entry point, and the exact engines.dsh compatibility target. The patch registers the entry module. The module then registers one provider named dsh-get-fable with the existing DSH skill registry and loads each skills/<slug>/SKILL.md instruction body on demand. The schema-v2 routing registry is bundled at skills/get-fable/registry.json. The initial catalog has 41 IDs from the upstream registry plus six port-specific IDs (47 total). This port additionally flattens 28 nested `fable-wise` specialists into top-level skill directories, bringing the bundled catalog and registry to 75 unique IDs. The nested specialists preserve upstream `disable-model-invocation` flags; the provider translates these into DSH's model/user invocation policy. The registry has no dangling next/fallback targets. The router contract explicitly says loading a skill is not diagnosis completion; the bug-hunt skill owns a bounded diagnosis loop and must return a structured Diagnosis Packet or an explicit resumable continuation.

Skills are advertised to the model and users. Host-native workspace, shell, browser, network, or Python operations remain dependent on what the DSH profile actually exposes. The plugin grants no permissions of its own. Mutation, release, and security actions must observe repository instructions, available approvals, and authorization boundaries.

## Important differences from upstream

- The port exposes 41 canonical registry skills, six port-specific skills, and 28 nested wisdom specialists as DSH skills; it does not claim to reproduce upstream Rust/gRPC engines, stateful REST services, dashboard telemetry, or lifecycle hooks.
- `fable-redteam` is guidance-only for source review and threat modeling. The active HTTP probe engine, Cloudflare adapter, report schema/validator, SARIF writer, run attestation, and 14 attack-class guide resources are not shipped; the skill must not claim that remote scanning or automated audit artifacts were produced.
- Source references that require companion files should be checked during validation. A copied skill body is not evidence that an upstream service or referenced runtime asset was ported.
- The plugin's version (0.1.0) is separate from its target DSH version (0.2.1-rc.2).
- AGPL-3.0-or-later licensing and upstream attribution are retained; see LICENSE and NOTICE.

## Validation status

The bundle now contains 75 top-level skill directories and 75 unique routing-registry IDs: 41 IDs from the upstream canonical registry, six existing port-only skills, and 28 flattened nested wisdom specialists. Static validation checks directory/registry parity, invocation-frontmatter booleans, the exact model-disabled subskill set, routing targets, the diagnosis closure contract, the red-team guidance-only boundary, and the provider's stale-candidate behavior. The provider smoke test covers `list()`, on-demand `get()`, invocation-policy propagation, stale candidates, abort handling, path traversal rejection, and the red-team/diagnosis boundaries. GitHub Actions for this revision must be checked after the commit; earlier successful runs are not evidence for this new tree. A live install and boot on DSH 0.2.1-rc.2 remains a separate integration gate.

Expected local checks:

    node --check index.js
    node --check scripts/validate-bundle.mjs
    node --check scripts/smoke-provider.mjs
    node scripts/validate-bundle.mjs
    node scripts/smoke-provider.mjs
    dsh --version
    dsh plugin --help
    dsh plugin add .

After installation, verify that DSH's skill catalog lists all bundled Fable skills and that invoking at least one read-only skill loads its full instructions. Then verify mutation-sensitive workflows in a disposable test repository.
