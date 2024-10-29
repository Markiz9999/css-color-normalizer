const eslint = require('@eslint/js');
const stylistic = require('@stylistic/eslint-plugin');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/*', 'dist/*'],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 140,
          endOfLine: 'auto',
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      curly: ['error', 'all'],
      'max-len': 0,
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      semi: ['error', 'always', { omitLastInOneLineBlock: true }],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      'space-before-blocks': [
        'error',
        {
          functions: 'always',
          keywords: 'always',
          classes: 'always',
        },
      ],
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'object-curly-spacing': ['error', 'always'],
      'keyword-spacing': 'error',
      'comma-spacing': 'error',
      'space-infix-ops': 'error',
      'no-multi-spaces': ['error', { exceptions: { Property: false } }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'if', next: '*' },
        { blankLine: 'always', prev: 'for', next: '*' },
        { blankLine: 'always', prev: 'try', next: '*' },
      ],
      'require-await': 'error',
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/indent': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/explicit-member-accessibility': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    },
  },
);
