import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        typecheck: {
            tsconfig: './tsconfig.test.json',
        },
        include: ['**/*.test.ts'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/*.config.ts',
            '**/*.config.mjs',
            '**/scripts/**',
            '/example/**',
        ],
        coverage: {
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/*.config.ts',
                '**/*.config.mjs',
                '**/scripts/**',
                '/example/**',
            ]
        },
    },
});