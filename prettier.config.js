const config = {
	printWidth: 120,
	useTabs: true,
	tabWidth: 2,
	semi: false,
	singleQuote: true,
	quoteProps: 'consistent',
	jsxSingleQuote: false,
	bracketSpacing: true,
	bracketSameLine: true,
	arrowParens: 'avoid',
	trailingComma: 'all',
	singleAttributePerLine: false,

	plugins: ['propocd', '@trivago/prettier-plugin-sort-imports', 'prettier-plugin-merge'],
	importOrderSortSpecifiers: true,
	importOrderCaseInsensitive: true,
	importOrder: ['@assets/*', '@app/*', '^[../*]', '^[./*]'],
}

module.exports = config
