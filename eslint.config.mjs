
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

const typescriptFiles = [
  'backend/**/*.{ts,tsx}',
  'frontend/**/*.{ts,tsx}',
];

const frontendFiles = [
  'frontend/**/*.{js,jsx,ts,tsx}',
];

export default tseslint.config(
  {
    ignores: [
      '**/.claude/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/coverage/**',
      '**/generated/prisma/**',
      '**/*.tsbuildinfo',
      'eslint.config.mjs',
      'frontend/next-env.d.ts',
    ],
  },

  {
    files: typescriptFiles,
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
  },

  ...nextVitals.map((config) => ({
    ...config,
    files: frontendFiles,
    settings: {
      ...config.settings,
      next: {
        ...config.settings?.next,
        rootDir: 'frontend/',
      },
    },
  })),

  {
    files: typescriptFiles,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      'no-console': [
        'warn',
        { allow: ['warn', 'error'] },
      ],
      eqeqeq: ['error', 'always'],
    },
  },

  {
    files: [
      'backend/src/domain/**/*.ts',
      'backend/src/application/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react' },
            { name: 'next' },
            { name: '@prisma/client' },
            { name: '@prisma/adapter-pg' },
          ],
          patterns: [
            { group: ['**/infrastructure/**'] },
            { group: ['**/interface/**'] },
          ],
        },
      ],
    },
  },

  {
    files: ['frontend/src/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@humanis/backend/server',
              message: 'Server imports are not allowed in client components.',
            },
          ],
        },
      ],
    },
  },
);