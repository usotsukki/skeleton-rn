#!/usr/bin/env node
// Gives a fork its own identity. Usage: yarn rename <name> <slug> <scheme> <bundle-id>
//   e.g. yarn rename "Todo Manager" todo-manager todomanager com.acme.todomanager
// Updates package.json, app.json and supabase/config.toml, then lets Yarn update yarn.lock.
// Values in .env (EXPO_PUBLIC_APP_*, EXPO_PUBLIC_IOS_BUNDLE_ID, EXPO_PUBLIC_ANDROID_PACKAGE) override
// app.json: change or remove them too.
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const [name, slug, scheme, bundleId] = process.argv.slice(2)

function fail(message) {
	console.error(`rename: ${message}`)
	process.exit(1)
}

if (!name || !slug || !scheme || !bundleId) fail('usage: yarn rename <name> <slug> <scheme> <bundle-id>')
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`slug "${slug}" must be lowercase letters, digits and dashes`)
if (!/^[a-z][a-z0-9+.-]*$/.test(scheme))
	fail(`scheme "${scheme}" must start with a letter (lowercase letters, digits, + . -)`)
// One id for both platforms: iOS allows dashes but not underscores, Android the reverse.
if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(bundleId)) {
	fail(`bundle id "${bundleId}" must look like com.company.app (lowercase letters and digits)`)
}
// Java keywords and literals cannot be Android package segments, even when the characters are valid.
const reservedSegments = new Set(
	(
		'abstract assert boolean break byte case catch char class const continue default do double else enum ' +
		'extends final finally float for goto if implements import instanceof int interface long native new ' +
		'package private protected public return short static strictfp super switch synchronized this throw ' +
		'throws transient try void volatile while true false null'
	).split(' '),
)
const reservedSegment = bundleId.split('.').find(segment => reservedSegments.has(segment))
if (reservedSegment) fail(`bundle id "${bundleId}" contains the reserved Java word "${reservedSegment}"`)

// Every file is read, checked and changed in memory first, so a bad file can't leave a half-renamed tree.
const writes = []

function updateJson(file, change) {
	const filePath = path.join(root, file)
	const json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
	change(json)
	// Tabs, the repo's Prettier style: create-expo-app rewrites these two files with spaces, which fails
	// `yarn lint:format` in a new app until they are written back.
	writes.push([file, `${JSON.stringify(json, null, '\t')}\n`])
}

updateJson('package.json', json => {
	json.name = slug
})

updateJson('app.json', json => {
	const { expo } = json
	if (!expo) fail('no "expo" object in app.json')
	expo.name = name
	expo.slug = slug
	expo.scheme = scheme
	expo.ios = { ...expo.ios, bundleIdentifier: bundleId }
	expo.android = { ...expo.android, package: bundleId }
})

// One Docker project per app. Two forks still share the default ports: to run both local backends at
// once, change the ports in one supabase/config.toml.
const config = fs.readFileSync(path.join(root, 'supabase/config.toml'), 'utf8')
if (!/^project_id = ".*"$/m.test(config)) fail('no project_id in supabase/config.toml')
writes.push(['supabase/config.toml', config.replace(/^project_id = ".*"$/m, `project_id = "${slug}"`)])

for (const [file, content] of writes) {
	fs.writeFileSync(path.join(root, file), content)
	console.log(`rename: updated ${file}`)
}

// Yarn keys the root workspace by package name and keeps lockfile entries sorted, so let Yarn rewrite
// the lockfile (no linking, no build scripts); a stale entry fails `yarn install --immutable` in CI.
const lock = childProcess.spawnSync('yarn', ['install', '--mode=update-lockfile'], {
	cwd: root,
	stdio: 'inherit',
	// Windows runs yarn through a .cmd shim, which spawnSync finds only with a shell.
	shell: process.platform === 'win32',
})
if (lock.status !== 0) fail('files renamed, but yarn.lock is out of date: run `yarn` before committing')
console.log('rename: updated yarn.lock')

console.log('rename: done. Next: check .env for EXPO_PUBLIC_APP_* overrides, then rebuild the native app')
console.log('rename: (yarn ios:rebuild / yarn android:rebuild, or yarn dev).')
