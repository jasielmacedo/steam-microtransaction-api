module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  root: true,
  rules: {
    "no-unused-vars": "off",
    '@typescript-eslint/no-unused-vars': [1, { 'varsIgnorePattern': '^_' }],
    "no-console": ["error"],
    "sort-imports": ["error", { "memberSyntaxSortOrder": ['all', 'single', 'multiple', 'none'], "allowSeparatedGroups": true }],
    "@typescript-eslint/no-explicit-any": 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true },
    ],
  },
  settings: {
    "import/resolver": {
      "alias": {
        "map": [
          ["@api", "./src/api"],
          ["@thirdparty", "./src/thirdparty"],
          ["@src", "./src"],
          ["@tests", "./tests"],
        ],
        "extensions": [
          ".ts",
          ".js"
        ]
      }
    }
  }
};
