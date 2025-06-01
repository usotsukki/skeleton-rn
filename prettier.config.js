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

	plugins: ['propocd', '@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss', 'prettier-plugin-merge'],
	importOrderSortSpecifiers: true,
	importOrderCaseInsensitive: true,
	importOrder: ['@assets/*', '@app/*', '^[../*]', '^[./*]'],

	tailwindConfig: './tailwind.config.js',
	tailwindFunctions: ['clsx'],
	tailwindAttributes: ['extraClassName', 'containerClassName', 'titleClassName', 'textClassName'],
}

module.exports = config
