---
paths:
  - src/components/**/*.tsx
  - src/screens/**/*.tsx
  - src/features/**/*.tsx
---

# React Component Structure

## Constants at top

Component-level constants go immediately below imports, before the component. Static sizing, debounce values, limits, labels. Avoid burying in component body unless they depend on runtime values.

## `useEffect` placement

Place `useEffect` near the bottom, just above `return`, unless a strong readability reason argues otherwise. Keeps state, derived values, handlers grouped first. Effects grouped, easy to audit.

## `expo-image` dimensions

Use `style` prop for width/height on `Image` from `expo-image`. Do not use `className` for dimensions.

## Banned APIs

`InteractionManager` — deprecated, removed in modern RN. Use `requestAnimationFrame`.

## React Compiler

Enabled. Pure component-local helpers can stay inside component body.

Keep inline when:

- pure
- only used in this component
- moving them out wouldn't improve clarity

Move out when:

- reused
- carry meaningful domain behavior deserving a named utility
- component becomes harder to scan with them inline

## Accessibility

- Icon-only pressables need `accessibilityLabel` (i18n `a11y.*`) and `accessibilityRole="button"`; prefer `AppButton` (it derives the label from string children only). Disabled controls set `accessibilityState={{ disabled }}`.
- Touch targets ≥ 44pt: pad small visuals with `hitSlop`.
- Never set `allowFontScaling={false}`. System text size is on and capped at 1.4× in `src/theme/textShim.ts`; give text-bearing controls `min-h-*`, not fixed heights, so larger text doesn't clip.
- Colors come from theme tokens; text pairs meet WCAG AA 4.5:1 (`text`, `text-secondary`, `text-muted`, `accent` on `bg`/`bg-elevated`/`bg-grouped`; `text-on-accent` on `accent`; `text-on-success` / `text-on-danger` on their fills; `danger` as text on every surface). A new pairing needs a contrast check.
- Motion: Reanimated animations follow the system Reduce Motion setting by default (`ReduceMotion.System`); override only with a reason (see `AnimatedSplash`). Non-Reanimated animation checks `useReducedMotion()`.
