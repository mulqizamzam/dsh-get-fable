# Supporting Resource Integrity Audit

**Audit scope:** `mulqizamzam/dsh-get-fable`, PR branch `feature/redteam-guidance-wise-subskills`  
**Upstream source pin:** `36920932251ffc619da6073eb02cb35a9a2f2dbf`  
**Bundle shape:** 75 top-level `SKILL.md` files

## Findings

The initial inspection found no local supporting-resource files under any skill directory. The skill instructions contained 140 explicit file references across the port:

| Classification | Count | Treatment |
|---|---:|---|
| Exists in pinned upstream | 128 | Rewritten as direct, immutable GitHub file links |
| Does not exist in pinned upstream | 12 | Removed as active resource links and disclosed as unavailable |
| Local copies included in this bundle | 0 | Explicitly documented; network access is required for linked material |

The 12 unavailable references belong to port-only specialists:

- `fable-core-test`: four reference guides.
- `fable-eval`: two reference guides and one example.
- `fable-skill-creator`: one depth-standard reference.
- `fable-test`: four reference guides. The source URLs were also checked at their originally pinned revision and returned 404.

These resources are not replaced with invented documents or placeholder files. The corresponding skills now state that the supporting material is unavailable and that the procedure in the skill body is authoritative.

## Link strategy

- All available upstream file links use commit `36920932251ffc619da6073eb02cb35a9a2f2dbf`, not a moving branch.
- The domain adapter directory is linked to the canonical `fable-method/references/domains` directory in upstream.
- Existing anti-churn and anti-slop-engineering links were moved from an older pin to the audited source pin.
- The red-team skill remains guidance-only; its upstream active-testing resources are intentionally not linked or packaged.
- The 128 supporting files are **not vendored**. Their links resolve to upstream GitHub content and require network access. This is a documented portability limitation, not a local-resource bundle.

## Reproducible validation

Run:

```bash
node scripts/check-skill-resources.mjs
```

The check scans all 75 skill instructions, rejects unresolved relative supporting-resource paths, verifies every upstream link uses the pinned commit and appears in the manifest, checks that every manifest file target is linked, and ensures unavailable resources are not presented as available.

Machine-readable inventory: [`RESOURCE-MANIFEST.json`](RESOURCE-MANIFEST.json).
