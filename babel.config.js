const getAliasesFromTsConfig = () => {
	const tsConfig = require('./tsconfig.json')
	const paths = tsConfig.compilerOptions.paths
	const alias = {}
	Object.keys(paths).forEach(key => {
		alias[key.replace(/\/\*$/, '')] = `./${paths[key][0].replace(/\/\*$/, '')}`
	})

	return alias
}

module.exports = api => {
	api.cache(false)

	const plugins = [
		[
			'babel-plugin-inline-import',
			{
				extensions: ['.svg'],
			},
		],
		[
			'babel-plugin-module-resolver',
			{
				alias: getAliasesFromTsConfig(),
				extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
				root: ['./src'],
			},
		],
		'react-native-reanimated/plugin',
	]

	const presets = ['babel-preset-expo']

	return {
		env: {
			development: {},
			production: {
				plugins: [
					...plugins,
					'@babel/plugin-transform-runtime',
					'@babel/plugin-transform-react-inline-elements',
					['transform-remove-console', { exclude: ['error'] }],
				],
			},
		},
		presets,
		plugins,
	}
}
