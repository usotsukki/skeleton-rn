#!/usr/bin/env node
// Gives a fork its own identity. Usage: yarn rename <name> <slug> <scheme> <bundle-id>
//   e.g. yarn rename "Todo Manager" todo-manager todomanager com.acme.todomanager
// Updates package.json, app.json and supabase/config.toml. Values in .env (EXPO_PUBLIC_APP_*,
// EXPO_PUBLIC_IOS_BUNDLE_ID, EXPO_PUBLIC_ANDROID_PACKAGE) override app.json: change or remove them too.
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
// Valid for both stores: iOS allows dashes, Android doesn't.
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(bundleId)) {
	fail(`bundle id "${bundleId}" must look like com.company.app (lowercase letters, digits, underscores)`)
}

// Every file is read, checked and changed in memory first, so a bad file can't leave a half-renamed tree.
const writes = []

function updateJson(file, change) {
	const filePath = path.join(root, file)
	const source = fs.readFileSync(filePath, 'utf8')
	const json = JSON.parse(source)
	change(json)
	const indent = source.match(/^(\s+)"/m)?.[1] ?? '\t'
	writes.push([file, `${JSON.stringify(json, null, indent)}\n`])
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

console.log('rename: done. Next: check .env for EXPO_PUBLIC_APP_* overrides, then rebuild the native app')
console.log('rename: (yarn ios:rebuild / yarn android:rebuild, or yarn dev).')
