export type LogMode = 'off' | 'on' | 'throttled';
export type LogLevel = 'log' | 'warn' | 'error';
declare class Logger {
    private mode;
    private throttleMs;
    private logBuffer$;
    private bufferSubscription;
    private prefix;
    constructor();
    private setupThrottledLogging;
    private flushEntries;
    private groupEntries;
    private writeToConsole;
    private emit;
    setMode(mode: LogMode): void;
    getMode(): LogMode;
    setThrottleInterval(ms: number): void;
    log(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map