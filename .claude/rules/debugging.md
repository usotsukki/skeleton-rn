# Debugging

**Emitter gate (every warning/error, before any theory).**

1. Take the exact string and locate its source. For JS/dependency messages, use `rg -n '<unique substring>' node_modules src`; for native, build, or remote failures, inspect the corresponding source/logs/tool output. Do not keep searching JS directories for an emitter owned by another system.
2. Read the emitting line and enough surrounding context to understand it; cite `path:line` and the literal line. If source is unavailable, cite the relevant log/tool evidence and state that limitation.
3. Only then propose a cause. User-flagged warnings are grep pointers, not hypotheses to weigh.

`node_modules` is local truth. Wrapper layers (NativeWind/css-interop, Sentry wraps, Reanimated shims) are frequent culprits. No stack trace in the log? Grep for the *caller* of the deprecated getter/API.

**Loops.**

- After **2 failed fixes** in the same layer: stop. Write hypothesis, evidence for/against, 2 alternative frames, the layer above/below, and the smallest failing check that defines "fixed".
- Before **fix #3**: a failing test (or a one-shot diagnostic with expected output) must exist and fail for the intended reason.
- Cap any architecture/provider/ABI theory at ~10 minutes, then return to the emitter.
- Probe before theorizing: a 5-line component or one log line beats an explanation.

**Traps seen in this stack.**

- **Dev ≠ release.** Dev polyfills hide release bugs (e.g. `parse(process.env)` isn't inlined; only static `process.env.EXPO_PUBLIC_X` is). Env/config/native issues need a release build (`release-check` skill).
- **Hermes bundles are binary:** `grep -a`, or you'll get false "not in bundle".
- **Working sibling repo:** diff `node_modules/<lib>` and installed versions, not just lockfiles.
- **Native registration / portals / sheets:** read the library path end-to-end; treat virtualized children as multi-instance.
- **Upstream noise:** if the emitter is a dependency and our code doesn't trigger it, say so and leave it (or patch via `patches/` with a comment).

**Why.** Pattern-matched "known fixes" were wrong for the actual emitter across multiple sessions; two-fix loops without reframing burned hours.
