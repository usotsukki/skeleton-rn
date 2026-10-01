// #region template:map
const path = require('path')
// #endregion template:map
const { withNativeWind } = require('nativewind/metro')
const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { assertReleaseBackend } = require('./metro/releaseEnvGuard')

assertReleaseBackend(process.env)

const config = getSentryExpoConfig(__dirname)

config.resolver.unstable_enablePackageExports = true

const finalConfig = withNativeWind(config, { input: './global.css' })

// #region template:map
// Expo static export runs a Node bundle (resolver.environment=node) for the server manifest.
// react-native-maps uses native codegen there and crashes; stub only for that environment.
const reactNativeMapsNodeStub = path.resolve(__dirname, 'metro/reactNativeMapsStub.tsx')
// #endregion template:map
const upstreamResolveRequest = finalConfig.resolver.resolveRequest
finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
	// #region template:map
	if (moduleName === 'react-native-maps' && context.customResolverOptions?.environment === 'node') {
		return { type: 'sourceFile', filePath: reactNativeMapsNodeStub }
	}
	// #endregion template:map
	if (upstreamResolveRequest) {
		return upstreamResolveRequest(context, moduleName, platform)
	}
	return context.resolveRequest(context, moduleName, platform)
}

module.exports = finalConfig
