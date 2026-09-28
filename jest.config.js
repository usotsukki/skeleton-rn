// `jest-expo` transforms TS via babel-jest and maps tsconfig `paths` (@app/*, @assets/*).
module.exports = {
	preset: 'jest-expo',
	setupFiles: ['./jest.env.js', './node_modules/react-native-gesture-handler/jestSetup.js'],
	setupFilesAfterEnv: ['./src/utils/test-utils/setup.ts'],
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))(?<!\\.disabled)\\.[jt]sx?$',
	testPathIgnorePatterns: ['/node_modules/', '/.claude/worktrees/'],
	modulePathIgnorePatterns: ['/.claude/worktrees/'],
	transformIgnorePatterns: [
		`node_modules/
			(?!((jest-)?
			@expo(nent)?/.*|
			@react-native(-community)?|
			@sentry/react-native|
			expo(nent)?|
			expo-modules-core|
			expo-router|
			react-native|
			react-native-reanimated|
			react-native-svg|
			react-native-worklets|
			react-native-drawer-layout|
			standard-navigation|
		/*)/)`,
	],
	testEnvironment: 'node',
	testTimeout: 10000,
	clearMocks: true,
	cacheDirectory: '<rootDir>/node_modules/.cache/jest',
	collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/__tests__/**', '!src/**/*.d.ts'],
	coverageReporters: ['text-summary', 'json-summary', 'lcov'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
