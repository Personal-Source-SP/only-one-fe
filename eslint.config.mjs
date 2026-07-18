import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: ['node_modules/**', '__generated__/**', '.next/**', 'dist/**', 'build/**'],
    },
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.d.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'no-relative-import-paths': noRelativeImportPaths,
            prettier: prettier,
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            'prettier/prettier': [
                'error',
                {
                    semi: true,
                    trailingComma: 'all',
                    singleQuote: true,
                    printWidth: 100,
                    tabWidth: 4,
                    endOfLine: 'auto',
                },
            ],
            'no-relative-import-paths/no-relative-import-paths': [
                'error',
                {
                    allowSameFolder: true,
                    rootDir: 'src',
                    prefix: '@',
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'antd',
                            message:
                                'Import Ant Design only via @/components/custom (wrapper layer).',
                        },
                    ],
                    patterns: [
                        {
                            group: ['antd/*', 'antd/es/*'],
                            message: 'Import antd subpaths only inside src/components/custom/**.',
                        },
                        {
                            group: [
                                '@/interfaces/*',
                                '@/enums/*',
                                '@/hooks/*',
                                '@/constants/*',
                                '@/services/*',
                                '@/components/custom/*',
                                '@/components/common/*',
                                '@/components/module/*/*',
                            ],
                            message:
                                'Import from barrel root (@/interfaces, @/enums, @/hooks, @/constants, @/services, @/components/custom, @/components/common, or @/components/module/<feature>).',
                        },
                    ],
                },
            ],
            ...prettierConfig.rules,
        },
    },
    {
        files: ['src/components/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ExportDefaultDeclaration',
                    message:
                        'Use named exports in src/components (export const X). App routes may use default exports.',
                },
            ],
        },
    },
    {
        files: [
            'src/app/**/*.{ts,tsx}',
            'src/contexts/**/*.{ts,tsx}',
            'src/hooks/**/*.{ts,tsx}',
            'src/providers/**/*.{ts,tsx}',
            'src/interfaces/**/*.d.ts',
            'src/components/custom/**/*.{ts,tsx}',
        ],
        rules: {
            'no-restricted-syntax': 'off',
        },
    },
    {
        files: ['src/components/custom/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@/interfaces/*',
                                '@/enums/*',
                                '@/hooks/*',
                                '@/constants/*',
                                '@/services/*',
                                '@/components/common/*',
                                '@/components/module/*/*',
                            ],
                            message:
                                'Import from barrel root (@/interfaces, @/enums, @/hooks, @/constants, @/services, @/components/custom, @/components/common, or @/components/module/<feature>).',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'no-undef': ['error', { typeof: true }],
        },
    },
];
