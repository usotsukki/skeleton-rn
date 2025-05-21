const { getSentryExpoConfig: getDefaultConfig } = require('@sentry/react-native/metro')

module.exports = (() => {
	const config = getDefaultConfig(__dirname)

	return config
})()
