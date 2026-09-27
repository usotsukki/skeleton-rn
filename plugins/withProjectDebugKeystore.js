// Copies keystores/debug.keystore over the template's shared debug keystore on every prebuild,
// so debug builds are signed with a project-specific key (see scripts/generate-debug-keystore.sh).
// The keystore is gitignored (generated per machine); EAS signs with its own credentials, so a missing file is fine.

const fs = require('fs')
const path = require('path')
const { withDangerousMod } = require('expo/config-plugins')

module.exports = config =>
	withDangerousMod(config, [
		'android',
		async cfg => {
			const source = path.join(cfg.modRequest.projectRoot, 'keystores', 'debug.keystore')
			if (!fs.existsSync(source)) return cfg
			const target = path.join(cfg.modRequest.platformProjectRoot, 'app', 'debug.keystore')
			fs.copyFileSync(source, target)
			return cfg
		},
	])
