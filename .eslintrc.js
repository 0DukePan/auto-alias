module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json'
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'prettier'
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    },
    env: {
      node: true,
      jest: true
    }
  };