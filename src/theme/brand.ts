import brand from '@assets/brand/brand.json'

/** Brand gradient stops (bottom-left → top-right). Source of truth: `assets/brand/brand.json`. */
export const BRAND_GRADIENT = brand.gradient as [string, string, string]

/** Native splash background; `app.json` expo-splash-screen config must match (see brand test). */
export const SPLASH_BACKGROUND = brand.splashBackground

/** Native splash icon width in points (`imageWidth` in `app.json`). */
export const SPLASH_ICON_SIZE = brand.splashIconSize
