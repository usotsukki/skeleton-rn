const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
	preset: 'jest-expo',
	setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
	setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './src/utils/__mocks__/index.ts'],
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
			@expo-google-fonts/.*|
			@react-native(-community)?|
			@react-native-firebase|
			@react-navigation/.*|
			@sentry/react-native|
			expo(nent)?|
			expo-modules-core|
			expo-router|
			imgix-core-js|
			native-base|
			react-native|
			react-native-keyboard-area|
			react-native-linear-gradient|
			react-native-payments|
			react-native-reanimated|
			react-native-svg|
			react-native-ui-lib|
			react-navigation|
		/*)/)`,
	],
	testEnvironment: 'node',
	moduleNameMapper: {
		...pathsToModuleNameMapper(compilerOptions.paths, {
			prefix: '<rootDir>',
		}),
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
