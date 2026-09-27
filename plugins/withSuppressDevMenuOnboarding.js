// Forces the expo-dev-menu "onboarding finished" flag to true on every app launch in DEBUG builds,
// so the dev-menu onboarding sheet never auto-opens on fresh simulator/device installs.
// expo-dev-menu does not expose a JS or config option to disable this, so we patch native code.
//
// Gesture / floating-button suppression is handled from JS in `src/app/_layout.tsx` via
// `DevMenuPreferences.setPreferencesAsync(...)` — runtime-configurable, no rebuild required.

const { withAppDelegate, withMainApplication } = require('expo/config-plugins')

const TAG = 'suppress-dev-menu-onboarding'

const IOS_SNIPPET = [
	'#if DEBUG',
	'    UserDefaults.standard.set(true, forKey: "EXDevMenuIsOnboardingFinished")',
	'#endif',
].join('\n')

const ANDROID_SNIPPET = [
	'    if (BuildConfig.DEBUG) {',
	'      getSharedPreferences("expo.modules.devmenu.sharedpreferences", android.content.Context.MODE_PRIVATE)',
	'        .edit().putBoolean("isOnboardingFinished", true).apply()',
	'    }',
].join('\n')

/** Inserts `snippet` on the line after `anchor`, once (tagged so re-running prebuild is a no-op). */
function insertAfterAnchor(contents, anchor, snippet, pluginName) {
	if (contents.includes(`@generated begin ${TAG}`)) return contents
	const lines = contents.split('\n')
	const index = lines.findIndex(line => anchor.test(line))
	if (index === -1) throw new Error(`${pluginName}: anchor ${anchor} not found`)
	lines.splice(index + 1, 0, `// @generated begin ${TAG}`, snippet, `// @generated end ${TAG}`)
	return lines.join('\n')
}

const withIos = config =>
	withAppDelegate(config, cfg => {
		if (cfg.modResults.language !== 'swift') {
			throw new Error('withSuppressDevMenuOnboarding: expected Swift AppDelegate')
		}
		cfg.modResults.contents = insertAfterAnchor(
			cfg.modResults.contents,
			/reactNativeFactory\s*=\s*factory/,
			IOS_SNIPPET,
			'withSuppressDevMenuOnboarding',
		)
		return cfg
	})

const withAndroid = config =>
	withMainApplication(config, cfg => {
		if (cfg.modResults.language !== 'kt') {
			throw new Error('withSuppressDevMenuOnboarding: expected Kotlin MainApplication')
		}
		cfg.modResults.contents = insertAfterAnchor(
			cfg.modResults.contents,
			/super\.onCreate\(\)/,
			ANDROID_SNIPPET,
			'withSuppressDevMenuOnboarding',
		)
		return cfg
	})

module.exports = config => withAndroid(withIos(config))
