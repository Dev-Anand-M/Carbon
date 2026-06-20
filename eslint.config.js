import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        Blob: 'readonly',
        HTMLElement: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      /* React rules */
      'react/jsx-uses-react': 'off', /* React 17+ JSX transform */
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-target-blank': 'error',

      /* Accessibility rules */
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',

      /* Security rules */
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      /* Code quality */
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
  {
    /* Test files can use console and test globals */
    files: ['src/**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
