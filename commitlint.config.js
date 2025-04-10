module.exports = {
	/*
	 * Resolve and load @commitlint/config-conventional from node_modules.
	 * Referenced packages must be installed
	 */
	extends: ['@commitlint/config-conventional'],
	/*
	 * Resolve and load conventional-changelog-atom from node_modules.
	 * Referenced packages must be installed
	 */
	parserPreset: 'conventional-changelog-atom',
	/*
	 * Resolve and load @commitlint/format from node_modules.
	 * Referenced package must be installed
	 */
	formatter: '@commitlint/format',
	/*
	 * Any rules defined here will override rules from @commitlint/config-conventional
	 */ rules: {
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert', 'ci', 'build', 'release'],
		],
		'type-empty': [2, 'never'],

		/*
		 * Intended to be used with ticket numbers. (NA-033, KOV-99002, etc)
		 */

		'scope-case': [2, 'always', 'kebab-case'],
		// 'scope-empty': [2, 'never'],
		// 'scope-min-length': [2, 'always', 5],
		'scope-max-length': [2, 'always', 20],

		'subject-empty': [2, 'never'],
		'subject-max-length': [2, 'always', 120],
		'subject-min-length': [2, 'always', 10],
	},
	/*
	 * Array of functions that return true if commitlint should ignore the given message.
	 * Given array is merged with predefined functions, which consist of matchers like:
	 *
	 * - 'Merge pull request', 'Merge X into Y' or 'Merge branch X'
	 * - 'Revert X'
	 * - 'v1.2.3' (ie semver matcher)
	 * - 'Automatic merge X' or 'Auto-merged X into Y'
	 *
	 * To see full list, check https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/is-ignored/src/defaults.ts.
	 *
	 * To disable those ignores and run rules always, set `defaultIgnores: false` as shown below.
	 */
	ignores: [commit => commit === ''],
	/*
	 * Whether commitlint uses the default ignore rules, see the description above.
	 */
	defaultIgnores: true,
	/*
	 * Custom URL to show upon failure
	 */
	helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
	/*
	 * Custom prompt configs
	 */
	prompt: {
		messages: {},
		questions: {
			type: {
				description: 'please input type:',
			},
		},
	},
}
