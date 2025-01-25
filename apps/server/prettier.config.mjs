/** @type {import('@types/prettier').Config} */
const config = {
  semi: false,
  tabWidth: 2,
  useTabs: false,
  printWidth: 120,
  endOfLine: 'auto',
  singleQuote: true,
  arrowParens: 'avoid',
  bracketSpacing: true,
  trailingComma: 'es5',
  quoteProps: 'as-needed',
  jsxBracketSameLine: false,
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      options: {
        parser: 'typescript',
      },
    },
  ],
}

export default config;