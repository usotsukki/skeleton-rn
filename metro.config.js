const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const config = getDefaultConfig(__dirname)

config.resolver = {
	...(config.resolver || {}),
	extraNodeModules: {
		...(config.resolver ? config.resolver.extraNodeModules : {}),
		'@infinitered/react-native-mlkit-text-recognition': path.resolve(
			__dirname,
			'libs/react-native-mlkit-text-recognition',
		),
		'@infinitered/react-native-mlkit-core': path.resolve(__dirname, 'libs/react-native-mlkit-core'),
	},
}

config.resolver.unstable_enablePackageExports = true

module.exports = withNativeWind(config, { input: './global.css' })
