module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-multiple-empty-lines': ['warn', { max: 1 }],
    "no-trailing-spaces": "error",
    semi: ["error", "always"],
    "comma-dangle": ["error", "always"],
    quotes: ["error", "single"],
    "arrow-parens": ["error", "always"]
  },
};
