import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

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
            'no-unused-vars': 'off',
            'no-constant-condition': 'warn',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/anchor-is-valid': 'warn',
        },
    },
];
