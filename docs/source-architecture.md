# Source Architecture

Source of truth for `src/` layout and ownership. Code wins on disagreement; update this doc in the same change.

## Folder map

| Folder | Owns | Don't put here |
|---|---|---|
| `src/app` | Expo Router routes + layout files. Route files re-export a screen from a feature barrel | Page logic, repository calls, non-route helpers |
| `src/app-shell` | Global overlays (`components/`: AppAlert, Toast, AnimatedSplash, ErrorFallback), drawer (`drawer/`), tab stack options | Primitive UI, feature workflows |
| `src/features/<feature>` | `<Name>Screen.tsx` at the root, `components/`, `hooks/`, `api/`, schemas, types, `__tests__/`. Public API via `index.ts` | Another feature's internals |
| `src/shared/ui` | Pure props-driven UI kit (`AppButton`, `TextField`, `CachedList`, …) | Components depending on feature hooks |
| `src/shared/form` | `useAppForm`, field adapters, submit behavior (feature-blind: fields register shared inputs only) | Feature form schemas (`features/<x>/forms.ts`) |
| `src/shared/hooks` | Feature-blind hooks: alert, toast, haptics, pull-to-refresh, feature flags, screen tracking, tab insets | Feature workflow hooks, non-hook modules |
| `src/shared/utils` | Generic helpers, error surfacing, navigation constants, `validators/` (`email`, `password`) | Feature workflow utilities |
| `src/shared/api/supabase` | Supabase client, deep links, generated `database.types.ts` | Feature repositories |
| `src/shared/api/db` | `RepoError`, assertions | Feature repository implementations |
| `src/shared/api/query` | Query client, persister, retry policy, slow-query watchdog | Feature query keys |
| `src/shared/api/analytics` | PostHog client, typed events, feature-flag registry | — |
| `src/shared/storage` | MMKV instances + schema, `persistStorage.ts`, encrypted `authStorage.ts` | Feature-owned MMKV instances |
| `src/shared/theme` | Colors, brand, text shim, `themeStore` | Feature theming |
| `src/shared/{env,translations,svg}` | Env wiring, i18n, SVG icons | — |
| `src/test` | Jest setup, render helpers, test query client | Production code |
| `metro/` (repo root) | Metro stubs, release backend guard, Android Maps config check | App runtime code |

## Hard rules

Enforced by `yarn lint:architecture` (`scripts/check-feature-boundaries.cjs`, part of `yarn check`). Test files are exempt.

- `shared/**` may not import `features/*` or `app-shell/*`, by alias or by relative path.
- `features/**` may not import `app-shell/*`.
- A feature imports another feature through its barrel (`@app/features/<x>`) or the approved sub-paths `/api`, `/api/*`, `/hooks/*`, `/components/*`, `/types`, `/utils`. Prefer `/hooks/*` over the barrel when you only need a hook: the barrel re-exports screens.
- `src/app/**` and `app-shell/**` import features through barrels only.
- Inside a feature, import private files relatively.
- Pre-split paths (`@app/api`, `@app/components`, `@app/hooks`, `@app/screens`, `@app/store`, `@app/storage`, `@app/theme`, `@app/utils`, `@app/env`, `@app/translations`, `@app/metro`) are denied.

## Per-feature playbook

1. Create `src/features/<feature>/` with `<Name>Screen.tsx` at the root; add `components/`, `hooks/`, `api/` only when needed.
2. Write `index.ts`: hooks, types and schemas first, screens last.
3. Add the route: `export { <Name>Screen as default } from '@app/features/<feature>'`.
4. Colocate `__tests__/`. `jest.mock` the defining module (`@app/features/<x>/hooks/useX`), not the barrel, so re-exports are intercepted.
5. Run `yarn check` (includes `lint:architecture`).

## Old → new paths

For forks rebasing onto the split.

| Before | After |
|---|---|
| `src/api/auth/*` | `src/features/auth/api/*` |
| `src/api/{analytics,db,query,supabase}/*` | `src/shared/api/*` |
| `src/components/shared/*` | `src/shared/ui/*` |
| `src/components/{form,svg}/*` | `src/shared/{form,svg}/*` |
| `src/components/auth/*` | `src/features/auth/components/*` |
| `src/components/drawer/*` | `src/app-shell/drawer/*` |
| `src/components/{AnimatedSplash,AppAlert,ErrorFallback,Toast}.tsx` | `src/app-shell/components/*` |
| `src/hooks/useAuth*.ts` | `src/features/auth/hooks/*` |
| `src/hooks/useTabStackScreenOptions.tsx` | `src/app-shell/useTabStackScreenOptions.tsx` |
| `src/hooks/*` (rest) | `src/shared/hooks/*` |
| `src/screens/{Welcome,SignIn,SignUp,ForgotPassword,ResetPassword}.tsx` | `src/features/auth/<Name>Screen.tsx` |
| `src/screens/{Home,ListDemo}.tsx` | `src/features/home/<Name>Screen.tsx` |
| `src/screens/{Map,Settings}.tsx` | `src/features/{map,settings}/<Name>Screen.tsx` |
| `src/screens/Skia/*` | `src/features/skia/*` (`SkiaScreen.tsx`, `components/`) |
| `src/utils/validators/authCredentialsForm.ts` | `src/features/auth/forms.ts` |
| `src/utils/sentry/captureRepoError.ts` | `src/shared/utils/captureRepoError.ts` |
| `src/utils/test-utils/*` | `src/test/*` |
| `src/utils/*` (rest) | `src/shared/utils/*` |
| `src/store/persistStorage.ts` | `src/shared/storage/persistStorage.ts` |
| `src/store/themeStore.ts` | `src/shared/theme/themeStore.ts` |
| `src/{env,storage,theme,translations}/*` | `src/shared/*` |
| `src/metro/*` | `metro/*` |
