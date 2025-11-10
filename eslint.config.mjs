import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    {
        extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),
    },
    {
		ignores: [
			'dist/**', 
			'coverage/**', 
			'**/*.mjs', 
			'**/*.js',
			'**/*.config.mjs',
			'**/*.config.ts',
			'scripts/**',
            'example/**',
		]
	},
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                project: './tsconfig.json',
            },
        },

        rules: {
            'no-console': 'warn',
            eqeqeq: 'error',
            curly: 'error',
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            '@typescript-eslint/no-unused-expressions': ['error', {
                allowShortCircuit: true,
                allowTernary: true,
            }],
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
        },
    },
    {
        files: ['**/*.mjs', '**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'no-console': 'off',
            eqeqeq: 'error',
            curly: 'error',
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
        },
    },
    {
        files: ['**/*.test.ts'],

        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    }
]);