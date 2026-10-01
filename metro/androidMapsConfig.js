const fs = require('node:fs')
const path = require('node:path')

/** Read Expo's generated native manifest, which only changes on prebuild (not on every compile). */
function hasAndroidMapsKey(projectRoot) {
	let manifest
	try {
		manifest = fs.readFileSync(path.join(projectRoot, 'android/app/src/main/AndroidManifest.xml'), 'utf8')
	} catch (error) {
		if (error.code === 'ENOENT') return false
		throw error
	}
	// Expo writes literal key metadata on the application. Ignore comments and similarly named tags.
	const application = manifest
		.replace(/<!--[\s\S]*?-->/g, '')
		.match(/<application\b[^>]*>([\s\S]*?)<\/application>/)?.[1]
	return [...(application?.matchAll(/<meta-data\b[^>]*>/g) ?? [])].some(([tag]) => {
		const name = tag.match(/\bandroid:name\s*=\s*["']([^"']*)["']/)?.[1]
		const value = tag.match(/\bandroid:value\s*=\s*["']([^"']*)["']/)?.[1]?.trim()
		return (
			(name === 'com.google.android.geo.API_KEY' || name === 'com.google.android.maps.v2.API_KEY') &&
			!!value &&
			!value.startsWith('@') &&
			!value.startsWith('${')
		)
	})
}

module.exports = { hasAndroidMapsKey }
