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
