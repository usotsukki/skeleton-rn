# Debugging

When the user reports — or you encounter — a runtime warning, error, or log message: it emit from a specific file. Find that file before theorizing.

## Hard gate (do this first, every time)

Before proposing a fix, theory, architectural cause, or "likely culprit":

1. Take the exact warning/error string the user gave you.
2. Run: `grep -rn '<exact substring>' node_modules src` (or `rg -n` if available). Trim string to a unique substring if too long.
3. Open the emitter file. Read the line that produce the message and the surrounding 30–50 lines.
4. Quote the emitter line in your reply (path:line and the literal source line).
5. Only then propose a cause or fix.

No exceptions. Not "I'm pretty sure I know this one." Not "this is a known RNKC/Reanimated/NativeWind issue." Pattern-match memory has a documented failure mode (see history) where the most-frequent training-data fix is wrong for the actual emitter. Always read the emitter.

## Why

- Warnings are strings. Strings are greppable. The emitter is always findable.
- `node_modules` is part of local repo truth, same as `src`. Treat third-party source as readable, not opaque. Bugs frequently live in wrapper/HOC layers (NativeWind / `react-native-css-interop`, Sentry wraps, Reanimated wrappers, animated-component shims) that sit between the consumer and the native primitive.
- Pattern-matching from memory bias toward the most narratively coherent explanation, which is often not the actual emitter's logic.

## When user-flagged warning, weight it

If the user explicitly says "this warning is the cause" or "this is likely related" — that is a high-signal pointer to grep, not a hypothesis to evaluate against your prior. Translate it into a grep, not into a theory.

## Comparing working vs broken sibling repos

When a working sibling exists (user say "X works in the other project"):

- Diff `node_modules/<suspect-lib>` between the two, not just `package.json` / `yarn.lock`. Lockfiles can lie when they're stale.
- Confirm the actual installed version with `cat node_modules/<lib>/package.json | grep version` on both sides.
- Diff the file that emit the warning across both copies.

## Probe before theorize

When a hypothesis can be cheaply disproved with a probe (a 5-line component, a console log, a single hook call), run the probe before writing a long explanation. If the probe disprove the theory, drop the theory immediately — do not refine it.

## Budget

Cap any single architecture/provider/ABI hypothesis at 10 minutes of investigation. If not resolved in that window, abandon the theory and return to the emitter file. Three sessions of provider-order theorizing have produced wrong fixes; one grep of the warning string would have located the bug in minutes.
