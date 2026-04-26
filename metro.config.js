const path = require('path')
const { withNativeWind } = require('nativewind/metro')
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

const config = getSentryExpoConfig(__dirname)

config.resolver.unstable_enablePackageExports = true

const finalConfig = withNativeWind(config, { input: './global.css' })

// Expo static export runs a Node bundle (resolver.environment=node) for the server manifest.
// react-native-maps uses native codegen there and crashes; stub only for that environment.
const reactNativeMapsNodeStub = path.resolve(__dirname, 'src/metro/reactNativeMapsStub.tsx')
const upstreamResolveRequest = finalConfig.resolver.resolveRequest
finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === 'react-native-maps' && context.customResolverOptions?.environment === 'node') {
		return { type: 'sourceFile', filePath: reactNativeMapsNodeStub }
	}
	if (upstreamResolveRequest) {
		return upstreamResolveRequest(context, moduleName, platform)
	}
	return context.resolveRequest(context, moduleName, platform)
}

module.exports = finalConfig
