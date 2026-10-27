---
name: fable-bug-hunt
description: 'Trace an unknown software defect from symptom to an evidence-backed root-cause diagnosis within one bounded task window. Use when expected and actual behavior diverge and the causal mechanism is not established. Do NOT use for materially repeated failed fixes (fable-recover), security-first investigations (fable-security), or implementation after diagnosis (fable-tdd).'
---

# Fable Bug Hunt

Own the diagnostic job from the observed symptom to a useful causal verdict. This is a domain specialist, not a router: do not finish by recommending another skill or by saying the skill was loaded. **Skill load is not diagnosis completion.**

## Mission and boundary

Answer: what exactly is broken, under what conditions, through which execution path, and what evidence supports the proposed cause? Keep the work bounded and bias toward high-information probes. Diagnose first; do not modify production code as part of diagnosis. If the user explicitly requested a fix, hand the completed diagnosis packet to Fable TDD or the narrowest implementation specialist.

Use only repository, shell, test, browser, and runtime capabilities actually exposed by the active host. A tool name or instruction is not proof that a tool ran.

## Activate when

- a bug report, regression, wrong result, crash, hang, or unexpected behavior has an unknown root cause;
- the user asks why something is broken, where a failure originates, or wants a diagnosis before a fix;
- routing to discovery would otherwise stop after explaining how to inspect the repository instead of diagnosing the defect.

Do not own security-first investigations, where the explicit trust-boundary/security request routes to Fable Security. If the same or materially similar repair attempt has already failed twice, Fable Recover takes precedence and can route back here only if a distinct domain diagnosis is still needed.

## Bounded diagnostic protocol

### 1. Freeze the claim and scope

Write a compact working frame from what is already available:
- observed symptom and exact expected-versus-actual behavior;
- affected command, request, test, user path, or artifact;
- reproduction steps and failure conditions;
- latest relevant change, environment, and constraints;
- whether production edits are forbidden until diagnosis.

Do not ask the user to repeat facts already present in the prompt, logs, or repository. Ask one focused question only when a missing fact blocks every safe discriminating probe.

### 2. Establish the real execution path

Read applicable repository instructions and the narrowest relevant manifests, entry points, tests, handlers, and recent diff. Trace the actual path from trigger to the incorrect branch, state transition, or side effect. Check registration, dependency injection, generated artifacts, configuration and runtime selection when applicable.

Label material claims as observed, inferred, or unresolved. An import, filename, search hit, or plausible code path alone does not prove that the code executes.

### 3. Reproduce or characterize

Prefer the smallest read-only command or existing test that can reproduce the symptom. Preserve the exact command, relevant environment/version, actual output, and exit status when available. If the failure is intermittent or cannot safely be reproduced, characterize its conditions and say exactly what remains unproved. Do not invent a successful reproduction.

### 4. Maintain a small hypothesis ledger

Keep at most three leading hypotheses at a time. For each, record:
- proposed mechanism;
- evidence for and against it;
- one observation that would distinguish it from the other leading causes;
- the cheapest safe probe that can produce that observation.

Prioritize probes by information gain and safety. Common layers are test harness, environment/build artifact, actual execution path, input/state, dependency contract, product logic, and cross-component invariant. Skip a layer only when evidence already settles it.

Run one meaningful probe at a time. After each result, reject, strengthen, or revise the hypothesis ledger. Do not accumulate guesses, repeat an unchanged failed command, or make speculative production edits to see whether the symptom disappears.

### 5. Close the causal loop

A root-cause claim must explain the observed symptom and its triggering condition, identify the reachable code/state path, and be supported by concrete evidence. Prefer a discriminating reproduction, failing assertion, trace, minimal test, or controlled before/after observation. State whether the cause is confirmed, strongly supported, or unresolved.

Do not call the most plausible hypothesis a confirmed root cause merely because alternatives were not explored. If available evidence cannot distinguish the leading causes, declare the blocker and the exact next probe instead of filling the gap with speculation.

### 6. Window and context budget protocol

This is a bounded end-to-end diagnosis, not an open-ended repository tour:
- Reuse prompt, logs, diff, and prior session evidence before repeating discovery.
- Keep exploration to the narrowest execution path and at most three live hypotheses.
- Reserve enough of the available turn/context budget to write the diagnosis packet.
- When the window is getting tight, stop broadening the search. Run the single highest-information safe probe that can still change the verdict; otherwise produce the continuation packet immediately.
- Do not bounce back to get-fable between every probe. Continue diagnosis under this specialist until a precedence gate changes or the packet is ready.
- If the diagnosis cannot be finished in this window, explicitly mark it incomplete and provide a resumable packet with the exact next file/symbol/command and the observation that would change the verdict. Never imply that a skill-load event, search pass, or handoff is a finished diagnosis.

If durable project state exists and writing it is permitted and useful, save the small continuation packet in the project’s established handoff location. Otherwise return it inline. Do not invent a repository convention or write a new state file without need.

## Diagnosis Packet

Return this structure at the end of every invocation:

- **Status:** confirmed / strongly supported / unresolved.
- **Symptom:** exact observed behavior versus expectation.
- **Reproduction:** minimal command or steps, environment, and result; or why reproduction is unavailable.
- **Causal path:** trigger → relevant state/data → code/branch → observed failure.
- **Root cause:** mechanism and triggering condition, or the unresolved competing causes.
- **Evidence:** concrete file/symbol, test/log/trace/output, and what each proves.
- **Hypotheses rejected:** important alternatives and the observation that rejected them.
- **Confidence and limits:** what is measured versus inferred and the remaining uncertainty.
- **Smallest next action:** regression test and repair direction if diagnosis is established; otherwise one next discriminating probe.
- **Next Skill:** Fable TDD/Execute only if repair is requested and the diagnosis is sufficiently grounded; Fable Recover for repeated/contradictory failures; Fable Security for a security-first result; Fable Handoff when the window or missing access blocks progress.

## Decision rules

- Unknown root cause means diagnose before implementation. A request phrased as “fix this” does not itself prove the cause is known.
- Stop after diagnosis when the user asked only why; do not edit code or silently expand the task to repair.
- If the user requested diagnosis and repair, pass the packet forward instead of making the next specialist rediscover the repository.
- A diagnosis is not complete merely because tests pass, a scanner is green, a relevant file was found, or one hypothesis sounds plausible.
- If the next probe requires destructive cleanup, production mutation, publication, or external side effects, obtain explicit authorization and preserve evidence first.

## Completion criteria

Diagnosis is complete only when the Diagnosis Packet exists and its status matches the evidence. If the root cause cannot be confirmed in this window, an explicit unresolved verdict plus one precise, resumable next probe is a valid bounded outcome; silently stopping after routing or skill loading is not.

## DSH host and authorization boundary

Use only capabilities the active DSH profile actually exposes. Inspect repository instructions and relevant files before mutation. Obtain explicit authorization before destructive changes, release or publication actions, remote side effects, or testing systems outside the approved scope. Run security and red-team workflows only against systems you own or are expressly authorized to test. Never claim a command, test, or verification ran without execution evidence; rerun relevant proof after the last mutation. Do not expose secrets or hidden reasoning.
