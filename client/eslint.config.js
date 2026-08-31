import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const reactRules = {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    ...jsxA11y.flatConfigs.recommended.rules,
};

export default [
    {ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'public/**']},
    {
        files: ['**/*.{js,jsx}'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {ecmaFeatures: {jsx: true}},
            globals: {...globals.browser, ...globals.node},
        },
        plugins: {'react-hooks': reactHooks, 'jsx-a11y': jsxA11y},
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
            'no-constant-condition': 'warn',
            ...reactRules,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {ecmaFeatures: {jsx: true}},
            globals: {...globals.browser, ...globals.node},
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...tseslint.configs.recommended[1].rules,
            ...tseslint.configs.recommended[2].rules,
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
            'no-constant-condition': 'warn',
            ...reactRules,
            'jsx-a11y/no-noninteractive-tabindex': ['error', {roles: ['tabpanel', 'region']}],
        },
    },
    {
        files: ['**/*.d.ts', '**/*.test.{js,jsx,ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'jsx-a11y/label-has-associated-control': 'off',
            'jsx-a11y/no-static-element-interactions': 'off',
        },
    },
    {
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        ignores: ['src/api/**'],
        rules: {
            'no-restricted-imports': ['error', {
                paths: [
                    {name: 'axios', message: 'Use a typed resource service from @api/resources.'},
                    {name: '@api/client', importNames: ['default'], message: 'Use a typed resource service from @api/resources.'},
                ],
            }],
        },
    },
];
