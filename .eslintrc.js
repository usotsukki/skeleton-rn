module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'@react-native',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'prettier',
	],
	parser: '@typescript-eslint/parser',

	parserOptions: {
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},

	settings: {
		'react': {
			version: 'detect',
		},
		'import/resolver': {
			'typescript': true,
			'node': true,
			'babel-module': true,
		},
	},

	rules: {
		'prefer-object-spread': 'error',
		'no-duplicate-imports': 'error',
		'no-multi-assign': 'error',

		'prefer-rest-params': 'warn',
		'prefer-spread': 'warn',
		'no-async-promise-executor': 'warn',
		'no-await-in-loop': 'warn',
		'no-promise-executor-return': 'warn',
		'require-atomic-updates': 'warn',
		'default-param-last': 'warn',
		'no-param-reassign': 'warn',
		'no-plusplus': ['warn', { allowForLoopAfterthoughts: true }],
		'no-nested-ternary': 'warn',
		'no-unneeded-ternary': 'warn',

		'@typescript-eslint/no-require-imports': 'off',
		'import/named': 'off',
		'import/namespace': 'off',
		'import/default': 'off',
		'import/no-default-export': 'off',
		'import/no-named-as-default-member': 'off',
		'import/no-named-as-default': 'off',
		'no-require-imports': 'off',
		'testing-library/render-result-naming-convention': 'off',
		'render-result-naming-convention': 'off',
		'react-hooks/exhaustive-deps': 'off',
		'react/no-unstable-nested-components': 'off',
		'react/react-in-jsx-scope': 'off',
	},

	overrides: [
		{
			files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
			extends: ['plugin:testing-library/react'],
			rules: {
				'testing-library/render-result-naming-convention': 'off',
			},
		},
	],
}
