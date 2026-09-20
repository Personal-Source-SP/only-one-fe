import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: ['node_modules/**', '__generated__/**', '.next/**', 'dist/**', 'build/**', '.agents/**', 'only-one/**'],
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
            'react-compiler': reactCompiler,
            'simple-import-sort': simpleImportSort,
            prettier: prettier,
        },
        rules: {
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        // 1. External packages (react, next, antd, libraries)
                        ['^react', '^next', '^@?\\w'],
                        // 2. Internal alias imports (@/...)
                        ['^@/'],
                        // 3. Intra-module relative imports (../, ./)
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                        // 4. Style imports
                        ['^.+\\.s?css$'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^I[A-Z]',
                        match: true,
                    },
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSInterfaceDeclaration[id.name=/Props$/]',
                    message:
                        '❌ Component Props phải được định nghĩa bằng "type" (ví dụ: type ButtonProps = { ... }), không dùng "interface".',
                },
            ],
            'react-compiler/react-compiler': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-namespace': 'error',
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
                                'Import Ant Design only via @/components/custom-antd (wrapper layer).',
                        },
                    ],
                    patterns: [
                        {
                            group: ['antd/*', 'antd/es/*'],
                            message: 'Import antd subpaths only inside src/components/custom-antd/**.',
                        },
                        {
                            group: [
                                '@/interfaces/*',
                                '@/enums/*',
                                '@/hooks/*',
                                '@/constants/*',
                                '@/services/*',
                                '@/components/custom-antd',
                                '@/components/custom-antd/*',
                                '@/components/common/*',
                                '@/components/containers/*',
                                '@/components/forms/*',
                                '@/components/display/*',
                                '@/components/feedback/*',
                                '@/components/module/*/*',
                            ],
                            message:
                                'Import from barrel root (@/interfaces, @/enums, @/hooks, @/constants, @/services, @/components, or @/components/module/<feature>).',
                        },
                    ],
                },
            ],
            ...prettierConfig.rules,
        },
    },
    {
        files: ['src/interfaces/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        'TSInterfaceDeclaration TSPropertySignature > TSTypeAnnotation > TSTypeLiteral',
                    message:
                        'Không định nghĩa inline object type trong interface. Hãy tách thành interface độc lập có tiền tố "I".',
                },
            ],
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
        files: ['src/app/**/*.{ts,tsx}'],
        rules: {
            'no-relative-import-paths/no-relative-import-paths': [
                'error',
                {
                    allowSameFolder: true,
                    allowedDepth: 2,
                    rootDir: 'src',
                    prefix: '@',
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'JSXOpeningElement[name.name="CustomForm"]',
                    message:
                        '❌ Không khai báo trực tiếp <CustomForm /> trong Page. Bắt buộc xây dựng form hướng schema qua <CustomFormSection /> kết hợp <FormModalContainer /> hoặc <FormDrawerContainer />.',
                },
                {
                    selector: 'JSXMemberExpression[object.name="CustomForm"][property.name="Item"]',
                    message:
                        '❌ Không sử dụng <CustomForm.Item /> thủ công trong Page. Bắt buộc cấu hình field qua IFormField và render tự động bằng <CustomFormSection />.',
                },
                {
                    selector: 'JSXOpeningElement[name.name="CustomTable"]',
                    message:
                        '❌ Không render trực tiếp <CustomTable /> trong Page. Bắt buộc sử dụng <ListContainer /> hoặc <ListTable /> từ @/components.',
                },
                {
                    selector:
                        'JSXElement[openingElement.name.name="CustomModal"] JSXElement[openingElement.name.name="CustomForm"]',
                    message:
                        '❌ Không lồng thủ công <CustomForm /> bên trong <CustomModal />. Bắt buộc sử dụng <FormModalContainer /> (hoặc <CustomModalForm />) từ @/components.',
                },
                {
                    selector:
                        'JSXElement[openingElement.name.name="CustomDrawer"] JSXElement[openingElement.name.name="CustomForm"]',
                    message:
                        '❌ Không lồng thủ công <CustomForm /> bên trong <CustomDrawer />. Bắt buộc sử dụng <FormDrawerContainer /> (hoặc <CustomDrawerForm />) từ @/components.',
                },
                {
                    selector:
                        'JSXAttribute[name.name="style"] Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
                    message:
                        '❌ Không hardcode mã màu (#hex) trong inline style. Bắt buộc sử dụng CSS variables từ hệ màu chuẩn (--hub-primary, --hub-text,...) hoặc Ant Design token (useToken()).',
                },
                {
                    selector:
                        'JSXAttribute[name.name="className"] Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]',
                    message:
                        '❌ Không hardcode mã màu (#hex) trong Tailwind className (ví dụ: bg-[#...], text-[#...]). Bắt buộc sử dụng semantic hub classes (bg-hub-primary, text-hub-text, border-hub-border,...), CSS variables hoặc Ant Design token.',
                },
            ],
        },
    },
    {
        files: ['src/components/custom-antd/**/*.{ts,tsx}'],
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
                                '@/components/containers/*',
                                '@/components/forms/*',
                                '@/components/display/*',
                                '@/components/feedback/*',
                                '@/components/module/*/*',
                            ],
                            message:
                                'Import from barrel root (@/interfaces, @/enums, @/hooks, @/constants, @/services, @/components, or @/components/module/<feature>).',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/components/display/code-display/utils/type.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'no-undef': ['error', { typeof: true }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/naming-convention': 'off',
        },
    },
];
