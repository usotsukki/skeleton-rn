const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
	preset: 'react-native',
	setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js', '<rootDir>/jest-setup.ts'],
	setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
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
		'node_modules/(?!((jest-)?react-native|react-native-keyboard-area|imgix-core-js|react-native-payments|@react-native-firebase|@react-native(-community)?|react-native-reanimated|react-native-linear-gradient|react-native-ui-lib|react-native-ui-lib/*)/)',
	],
	testEnvironment: 'node',
	moduleNameMapper: {
		...pathsToModuleNameMapper(compilerOptions.paths, {
			prefix: '<rootDir>',
		}),
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
