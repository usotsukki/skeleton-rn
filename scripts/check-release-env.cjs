#!/usr/bin/env node
// Runs before a local release build (yarn iosr): fails in seconds instead of after the native compile.
// The package script loads env files in Expo's production order; this applies the bundler's guard to them.
const { assertReleaseBackend } = require('../metro/releaseEnvGuard')

try {
	assertReleaseBackend({ ...process.env, NODE_ENV: 'production' })
} catch (error) {
	console.error(`release env: ${error.message}`)
	process.exit(1)
}
