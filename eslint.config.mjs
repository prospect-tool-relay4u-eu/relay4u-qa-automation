import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules', 'playwright-report', 'test-results', 'blob-report', 'dist'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },
  eslintConfigPrettier,
);
