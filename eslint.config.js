const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [1, { varsIgnorePattern: '^_' }],
      'no-console': ['error'],
      'sort-imports': [
        'error',
        { memberSyntaxSortOrder: ['all', 'single', 'multiple', 'none'], allowSeparatedGroups: true },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: true, variables: true },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**', '*.js', 'tests/setup.js'],
  }
);
