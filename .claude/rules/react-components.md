---
paths:
  - src/features/**/*.tsx
  - src/shared/**/*.tsx
  - src/app-shell/**/*.tsx
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
- Touch targets ≥ 44pt (48dp Android): pad small visuals with `hitSlop`, and size the control itself with explicit pixels (`min-h-[48px]`). NativeWind's `inlineRem` is 14, so spacing units are 3.5px (`min-h-12` = 42px).
- Never set `allowFontScaling={false}`. System text size is on and capped at 1.4× in `src/shared/theme/textShim.ts`; give text-bearing controls `min-h-*`, not fixed heights, so larger text doesn't clip.
- Colors come from theme tokens; text pairs meet WCAG AA 4.5:1 (`text`, `text-secondary`, `text-muted`, `accent` on `bg`/`bg-elevated`/`bg-grouped`; `text-on-accent` on `accent`; `text-on-success` / `text-on-danger` on their fills; `danger` as text on every surface). A new pairing needs a contrast check.
- Motion: Reanimated animations follow the system Reduce Motion setting by default (`ReduceMotion.System`); override only with a reason (see `AnimatedSplash`). Non-Reanimated animation checks `useReducedMotion()`.

## Server-data lists

Render query-backed lists with `CachedList` (`src/shared/ui/CachedList.tsx`): pass the `useQuery` result as `query`. It owns the loading skeleton, offline and blocking-error states, the empty state, pull-to-refresh, and the "couldn't refresh" notice over cached rows. Map errors for users with `requestErrorMessage`, never `err.message`.

<!-- #region template:list-demo -->
Demo: Home → "Open list states demo" (`src/features/home/ListDemoScreen.tsx`).
<!-- #endregion template:list-demo -->

## Feature flags and analytics

- Gate new behavior with `useFeatureGate(FEATURE_FLAGS.x)` and keep the current experience as the fallback (flags read off until loaded, and always without a PostHog token). Where the fallback is itself visible, use `useFeatureGateState` and render nothing for `loading`.
- Product events go through `trackEvent` with a name registered in `src/shared/api/analytics/events.ts`. Never send names, emails or free text as properties.

## Forms and confirmations

- New forms use `useAppForm` (`src/shared/form`): `<form.AppField name>{f => <f.TextField />}</form.AppField>` and `<form.AppForm><form.SubmitButton /></form.AppForm>`. Add input adapters to `fields.tsx` and register them in `useAppForm.ts`; validators return i18n keys.
- Validation: schema in `validators.onChange`. Submit is never disabled for invalid input: an invalid submit shows every error and focuses the first invalid field (`onSubmitInvalid` → `focusFirstInvalid`). A field's error shows once it was typed into and left, then updates live; fresh fields stay quiet (`getDisplayedError`).
- Keyboard flow: every field gets `submitBehavior="submit"` (the default blurs and drops the keyboard before an invalid submit can refocus); each but the last gets `returnKeyType="next"` and `onSubmitEditing` focusing the next field's `inputRef`, the last gets `returnKeyType="go"` (or `send`) and `onSubmitEditing={() => submitForm(form, busy)}`. The keyboard closes when a submit passes validation.
- Request errors show in the form, not a toast: catch in `onSubmit`, then `setSubmitError(formApi, { key, field? })` + `focusFirstInvalid`. A field-specific error goes under that input; anything else (wrong credentials, network, rate limit) above the submit button, announced to screen readers. Inputs are kept; the error clears on the next edit. Auth errors map via `getAuthFormError`; don't reveal whether an account exists: wrong-credential messages stay generic ("email or password"), and sign-up answers an existing email with the same "check your email" result.
- Screens holding unsaved edits call `useUnsavedChangesGuard({ isDirty, isSubmitting })`.
- In-app dialogs go through `useAlert().showAlert` (rendered by `AppAlert`); destructive actions use `showDeleteConfirmation`. Native `Alert.alert` only for pickers with more than two options.
