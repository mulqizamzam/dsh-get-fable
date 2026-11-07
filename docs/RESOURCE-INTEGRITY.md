# Supporting Resource Integrity

**Audit scope:** `mulqizamzam/dsh-get-fable`, PR branch `feature/redteam-guidance-wise-subskills`  
**Upstream source pin:** `36920932251ffc619da6073eb02cb35a9a2f2dbf`  
**Bundle shape:** 75 top-level `SKILL.md` files

## Findings

The 75 skill instructions contained 129 explicit supporting-file references:

| Classification | Count | Treatment |
|---|---:|---|
| Explicit references present in the pinned upstream source | 117 | Copied into the repository at matching paths |
| Additional files in the linked domain-adapter directory | 8 | Copied locally; `TEMPLATE.md` was already part of the 117 |
| Port-only references absent from the pinned upstream source | 12 | Remain unavailable; no invented replacements |
| **Total local supporting files** | **125** | Bundled and available offline |

The 12 unavailable references belong to port-only specialists:

- `fable-core-test`: four reference guides.
- `fable-eval`: two reference guides and one example.
- `fable-skill-creator`: one depth-standard reference.
- `fable-test`: four reference guides. The corresponding source paths were checked at the pinned revision and were absent.

These files are not replaced with invented documents or placeholders. The corresponding skills state that their supporting material is unavailable and that the procedure in the skill body is authoritative.

## Local vendoring and links

- All 117 explicitly referenced upstream files are copied at their original repository-relative paths.
- The domain adapter directory contains nine files. Its `TEMPLATE.md` is already in the explicit 117-file set, so the other eight files are included as additional local resources.
- 121 links across 29 skill documents were converted from remote GitHub links into relative local links.
- The source revision is immutable and recorded in `RESOURCE-MANIFEST.json`.
- Loading the 125 bundled resources does not require network access after this repository has been cloned. Other external references in skill content may still point to public websites.

## License and attribution

The main get-fable resources are covered by the upstream `AGPL-3.0-or-later` license. Its source license text is preserved at `LICENSES/GET-FABLE-AGPL-3.0-or-later.txt`.

The repository also carries separately licensed upstream material. The MIT license and NOTICE for Fable Wise, and the MIT license for Fable Council, are preserved verbatim under `LICENSES/`. Do not treat the repository-level AGPL identifier as removing those file-level MIT permissions or attribution requirements.

## Reproducible validation

Run:

```bash
node scripts/check-skill-resources.mjs
```

The check scans all 75 skill instructions, validates all 125 manifest files, checks relative resource links and the domain-adapter directory, rejects remaining remote source links in skill documents, and confirms that unavailable resources are not represented as bundled files.

Machine-readable inventory: [`RESOURCE-MANIFEST.json`](RESOURCE-MANIFEST.json).
