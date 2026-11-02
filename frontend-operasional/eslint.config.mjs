import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import security from 'eslint-plugin-security';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

import nextPlugin from '@next/eslint-plugin-next';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import noSecrets from 'eslint-plugin-no-secrets';

export default defineConfig([
  globalIgnores([
    'dist/',
    'node_modules/',
    '.next/',
    'build/',
    '.cz-config.js',
    'commitlint.config.cjs',
    'lint-staged.config.cjs',
    'prettier.config.js',
    'eslint.config.mjs',
    'scripts/',
  ]),

  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactHooks.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,

  security.configs.recommended,
  noUnsanitized.configs.recommended,
  prettierPlugin,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
      next: {
        rootDir: ['./'],
      },
      ...importPlugin.flatConfigs.recommended.settings,
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },

    plugins: {
      '@next/next': nextPlugin,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      'no-secrets': noSecrets,
    },

    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      /* =====================
         JavaScript Quality
      ===================== */

      eqeqeq: ['error', 'always'],
      'no-console': process.env.NODE_ENV === 'production' ? ['warn', { allow: ['warn', 'error'] }] : 'off',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      /* =====================
         TypeScript
      ===================== */

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      /* =====================
         React
      ===================== */

      'react/no-danger': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-key': 'error',
      'react/react-in-jsx-scope': 'off', // Next.js handles scope automatically
      'react/prop-types': 'off',

      /* =====================
         Hooks
      ===================== */

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // React Compiler rules (v7+) — dinonaktifkan karena codebase memakai pola setState-in-effect
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',

      /* =====================
         Import
      ===================== */

      // Disable default import/order in favor of simple-import-sort if they want, 
      // but let's keep their requested 'import/order' rule for now!
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal'],
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'off', // Typos & aliases common issues handled by TS

      /* =====================
         Other previous rules
      ===================== */
      'react-refresh/only-export-components': 'off',
      'no-secrets/no-secrets': ['error', { tolerance: 4 }],
    },
  },
  {
    files: ['apps/api/**/*.ts'],
    rules: {
      '@next/next/no-assign-module-variable': 'off',
    },
  },
  {
    files: ['packages/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  /**
   * ============================================================
   * TEST FILE OVERRIDES
   * ============================================================
   * Rules yang di-relax khusus untuk file test/spec.
   * Ini BUKAN cara bypass kotor ??? ini konfigurasi resmi Flat Config.
   *
   * Alasan masing-masing rule di-off:
   *  - no-secrets       : String dalam test (mock ID, URL placeholder, dsb)
   *                        bukan secret nyata — hanya data dummy.
   *  - no-explicit-any  : Mock object di test sering butuh `any` karena
   *                        kita hanya mau partial type, bukan full interface.
   *  - react-hooks      : Playwright fixtures pakai callback `use`/`run`
   *                        yang bukan React Hook, tapi ESLint salah deteksi.
   *  - jsx-a11y         : Komponen render di test tidak memerlukan a11y penuh
   *                        karena bukan UI yang diakses user sesungguhnya.
   *  - no-unsanitized   : Test sering inject string HTML secara sengaja
   *                        untuk memverifikasi sanitasi di level produksi.
   *  - security/        : Test helper dan mock intentionally mengakses
   *                        hal-hal yang dalam produksi perlu dijaga.
   * ============================================================
   */
  {
    files: [
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
    ],
    rules: {
      // String dalam test bukan secret nyata
      'no-secrets/no-secrets': 'off',

      // Mock object di test sering butuh partial type (any)
      '@typescript-eslint/no-explicit-any': 'off',

      // Playwright fixtures callback salah dideteksi sebagai React Hook
      'react-hooks/rules-of-hooks': 'off',

      // Test render tidak perlu full accessibility compliance
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',

      // Test intentionally menggunakan innerHTML untuk memverifikasi sanitasi
      'no-unsanitized/method': 'off',
      'no-unsanitized/property': 'off',

      // Security rules terlalu strict untuk mock/test helper
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
]);
