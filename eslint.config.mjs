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
            ...prettierConfig.rules,
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'no-undef': ['error', { typeof: true }],
        },
    },
];
