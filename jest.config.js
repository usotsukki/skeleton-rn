const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
	preset: 'jest-expo',
	setupFiles: ['./jest.env.js', './node_modules/react-native-gesture-handler/jestSetup.js'],
	setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './src/utils/test-utils/setup.ts'],
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))(?<!\\.disabled)\\.[jt]sx?$',
	transform: {
		'\\.[jt]sx?$': 'babel-jest',
		'\\.ts$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.jest.json',
			},
		],
	},
	transformIgnorePatterns: [
		`node_modules/
			(?!((jest-)?
			@expo(nent)?/.*|
			@react-native(-community)?|
			@react-navigation/.*|
			@sentry/react-native|
			expo(nent)?|
			expo-modules-core|
			expo-router|
			react-native|
			react-native-reanimated|
			react-native-svg|
			react-native-worklets|
			react-navigation|
		/*)/)`,
	],
	testEnvironment: 'node',
	testTimeout: 10000,
	moduleNameMapper: {
		...pathsToModuleNameMapper(compilerOptions.paths, {
			prefix: '<rootDir>',
		}),
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
