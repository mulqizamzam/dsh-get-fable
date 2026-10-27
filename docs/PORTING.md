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
| Review, security, red-team, remediation, test engineering, evidence judging, anti-churn | preserve as bundled skills | Independent proof and risk-control workflows; security workflows must only target authorized systems. |
| Release readiness, handoff, finish-turn, evaluation, learning, repository stewardship | preserve as bundled skills | Continuity, quality, and delivery workflows. |
| Architecture, delegation, context thrift, council, dataviz, artifacts, simplification, loops, runtime verification, memory/config/simulation/cowork, skill creation/domain adaptation | preserve as bundled skills | Useful productivity and platform-agnostic engineering workflows. |
| Runtime /api/fable/* services and dashboard UI | not carried in this initial port | The source guide documents these, but their implementation bundle was not available for full inspection in the source snapshot; reimplementing them without the actual contract risks fabricating behavior. |
| Optional OpenAI-compatible local request proxy, gRPC/Rust engines, cross-platform installers and host-specific lifecycle hooks | excluded from DSH bundle | They are separate runtime/platform surfaces, are not necessary for native skill discovery, and need their own compatibility/security review. |
| Upstream package/release automation | reference only | Release mechanics for the upstream product must not silently publish or mutate another repository from a DSH skill. |

## DSH-native design

The package root has a package.json with dsh.manifestVersion: 1, an explicit Cordis bundle patch, a module entry point, and the exact engines.dsh compatibility target. The patch registers the entry module. The module then registers one provider named dsh-get-fable with the existing DSH skill registry and loads each skills/<slug>/SKILL.md instruction body on demand. The schema-v2 routing registry is bundled at skills/get-fable/registry.json. It contains the 46 upstream workflows plus the DSH-specific `fable-bug-hunt` adapter (47 unique IDs) and has no dangling next/fallback targets. The router contract explicitly says loading a skill is not diagnosis completion; the bug-hunt skill owns a bounded diagnosis loop and must return a structured Diagnosis Packet or an explicit resumable continuation.

Skills are advertised to the model and users. Host-native workspace, shell, browser, network, or Python operations remain dependent on what the DSH profile actually exposes. The plugin grants no permissions of its own. Mutation, release, and security actions must observe repository instructions, available approvals, and authorization boundaries.

## Important differences from upstream

- The port exposes the source's canonical specialist workflows as DSH skills; it does not claim to reproduce upstream Rust/gRPC engines, stateful REST services, dashboard telemetry, or lifecycle hooks.
- Source references that require companion files should be checked during validation. A copied skill body is not evidence that an upstream service or referenced runtime asset was ported.
- The plugin's version (0.1.0) is separate from its target DSH version (0.2.1-rc.2).
- AGPL-3.0-or-later licensing and upstream attribution are retained; see LICENSE and NOTICE.

## Validation status

Executed local checks on a temporary harness fixture tree: node --check index.js, node --check scripts/validate-bundle.mjs, node --check scripts/smoke-provider.mjs, scripts/validate-bundle.mjs (46 generated fixture skills plus a fixture routing registry), and the provider smoke test covering list(), on-demand get(), invocation metadata, resource hint, abort behavior, and rejection of a traversal locator. The core entry point, validator, and smoke-test code used in that test were copied from the repository; fixture skill bodies were generated test data, not the canonical body content. Separately, all 46 upstream GitHub skill files were fetched and checked for frontmatter, matching name, a parsable non-empty description, substantial body, and the DSH authorization-boundary section. The DSH-specific `fable-bug-hunt` adapter is new in this change. The extended schema-v2 routing registry is configured for 47 unique IDs and zero dangling next/fallback targets; the updated static validator and provider smoke test now assert the routing/diagnosis-closure contract. A GitHub Actions workflow is committed to run the validator and provider smoke test on push and pull request, but its remote run result was not confirmed in this session. A local checkout of the exact remote tree and a live DSH 0.2.1-rc.2 boot were unavailable, so actual host installation and integration behavior remain unverified.

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
