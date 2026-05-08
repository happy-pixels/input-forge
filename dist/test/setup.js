import { vi } from 'vitest';
// Mock the logger to prevent console output during tests
vi.mock('../core/logger', () => ({
    logger: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        setMode: vi.fn(),
        getMode: vi.fn(() => 'off'),
        setThrottleInterval: vi.fn(),
    }
}));
//# sourceMappingURL=setup.js.map