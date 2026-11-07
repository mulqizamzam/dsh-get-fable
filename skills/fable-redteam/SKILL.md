---
name: fable-redteam
description: "Perform a read-only, source-grounded security review and threat assessment of an authorized repository. Use when examining trust boundaries, authentication and authorization logic, input handling, sensitive data flows, security controls, or a candidate vulnerability. This bundled skill provides review instructions only; it does not include a scanner, active HTTP probe engine, or automated SARIF/report generator."
---

# Fable RedTeam — guidance-only security review

## Capability boundary

This bundled skill is a **read-only security-review procedure**. It can guide repository inspection, threat modeling, source tracing, and review of existing test evidence. It does not ship or activate the upstream red-team runtime, HTTP probe engine, Cloudflare adapter, fuzzers, CVSS calculator, report schema, run attestation, or remediation automation.

Do not describe this skill as an active penetration-testing engine. Do not claim that a target has been scanned, that an endpoint was probed, or that a vulnerability was experimentally confirmed unless a separately available and authorized tool actually performed that operation and returned evidence.

## When to use

- Reviewing source code for authorization, authentication, tenant-isolation, input-validation, injection, SSRF, data-exposure, or unsafe deserialization risks.
- Mapping trust boundaries, privileged operations, sensitive data flows, and external entry points.
- Reviewing an existing security test, scanner result, patch, or candidate finding.
- Preparing a safe, bounded test plan for an explicitly authorized environment.

## When not to use

- Active network probing, exploitation, fuzzing, credential testing, or endpoint scanning. This bundle does not provide those capabilities.
- Stress testing, denial-of-service testing, stealth, persistence, or evasion.
- Testing a public or third-party target without explicit authorization and a dedicated approved test capability.
- Treating a missing test or unavailable runtime as evidence that a vulnerability is absent.

## Required inputs

- Repository or source scope to inspect.
- Security question or asset under review.
- Relevant authorization and operational constraints.
- Existing test/scanner evidence, when the task is a result review.

If the scope or authorization is unclear, stay read-only and ask for the minimum missing constraint before any test plan that could create side effects.

## Procedure

1. **Scope:** Identify the repository, commit, included paths, excluded paths, relevant environment assumptions, and the user's authorization. Do not access external targets as part of this skill.
2. **Map:** Identify assets, actors, trust boundaries, entry points, data flows, privilege transitions, and sensitive sinks from repository evidence.
3. **Trace:** Follow untrusted input to security-sensitive operations. Inspect authentication, authorization, tenant/object ownership checks, canonicalization, validation, error handling, logging, and secret handling where relevant.
4. **Challenge:** Form a small set of falsifiable vulnerability hypotheses. For each, state the source path and data/control-flow condition that would make it exploitable.
5. **Check evidence:** Inspect existing tests and available local fixtures. Run only read-only or already-authorized local checks exposed by the environment. Do not invent a test result.
6. **Classify:**
   - **Source-confirmed defect:** the source path demonstrates a violated security invariant; state whether runtime exploitability remains untested.
   - **Needs validation:** a plausible source-grounded path depends on runtime, configuration, or deployment facts not available here.
   - **Refuted:** a concrete guard or test evidence defeats the stated hypothesis; describe its scope.
7. **Recommend:** Propose the smallest mitigation and a focused regression test. Do not modify files or create remediation cards unless the user separately authorizes implementation.
8. **Handoff:** If active testing is required, identify the exact missing capability and the safe, authorized test conditions needed. Do not silently substitute an unapproved network probe.

## Output: Security Review Packet

Return the following:

- **Scope and revision:** exact repository/commit and reviewed paths.
- **Assets and trust boundaries:** relevant actors, entry points, data flows, and sensitive sinks.
- **Findings:** each with status, severity rationale, confidence, exact path/line, invariant violated, source trace, and conditions still unverified.
- **Existing evidence:** tests or tool outputs actually inspected, with their scope and limitations.
- **Recommended mitigation:** smallest corrective change and regression-test objective.
- **Unresolved validation:** exact runtime or deployment fact required next.

Use qualitative severity unless the evidence supports a defensible scoring method. Do not fabricate CVSS vectors, HTTP status codes, curl reproductions, SARIF, cryptographic attestations, or coverage ledgers.

## Safety and authorization

- Review only repositories and assets that the user owns or is authorized to assess.
- Never request, store, or print secrets, bearer tokens, private keys, or sensitive production data.
- Do not conduct active testing against a remote system from this workflow.
- Keep all proposed probes bounded, non-destructive, and explicitly authorized.
- A source-level finding is not automatically proof of live exploitability; distinguish code evidence from runtime evidence.

## DSH host and authorization boundary

Use only capabilities the active DSH profile actually exposes. This package supplies instructions, not a security scanner or network-testing service. Inspect repository guidance before mutation; obtain separate explicit authorization before destructive changes, publication, remote side effects, or active security testing. Never claim a command or test ran without fresh execution evidence. Do not expose secrets or hidden reasoning.
