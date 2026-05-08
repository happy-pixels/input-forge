/* eslint-disable no-console */
import { Subject, Subscription } from 'rxjs';
import { bufferTime, filter } from 'rxjs/operators';

export type LogMode = 'off' | 'on' | 'throttled';
export type LogLevel = 'log' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    args: unknown[];
}

const DEFAULT_THROTTLE_MS = 1000;

class Logger {
    private mode: LogMode = 'off';
    private throttleMs: number = DEFAULT_THROTTLE_MS;
    private logBuffer$ = new Subject<LogEntry>();
    private bufferSubscription: Subscription | null = null;
    private prefix = '[InputForge]';

    constructor() {
        this.setupThrottledLogging();
    }

    private setupThrottledLogging(): void {
        this.bufferSubscription?.unsubscribe();

        this.bufferSubscription = this.logBuffer$
            .pipe(
                bufferTime(this.throttleMs),
                filter((entries) => entries.length > 0 && this.mode === 'throttled')
            )
            .subscribe((entries) => {
                this.flushEntries(entries);
            });
    }

    private flushEntries(entries: LogEntry[]): void {
        const grouped = this.groupEntries(entries);

        for (const [level, messages] of Object.entries(grouped)) {
            if (messages.length === 1) {
                this.writeToConsole(level as LogLevel, messages[0].message, messages[0].args);
            } else {
                const summary = `(${messages.length} messages)`;
                console[level as LogLevel](`${this.prefix} ${summary}`);
                messages.forEach((entry) => {
                    console[level as LogLevel](`  ${entry.message}`, ...entry.args);
                });
            }
        }
    }

    private groupEntries(entries: LogEntry[]): Record<LogLevel, LogEntry[]> {
        return entries.reduce((acc, entry) => {
            acc[entry.level].push(entry);
            return acc;
        }, { log: [], warn: [], error: [] } as Record<LogLevel, LogEntry[]>);
    }

    private writeToConsole(level: LogLevel, message: string, args: unknown[]): void {
        console[level](`${this.prefix} ${message}`, ...args);
    }

    private emit(level: LogLevel, message: string, args: unknown[]): void {
        if (this.mode === 'off') {
            return;
        }

        if (this.mode === 'on') {
            this.writeToConsole(level, message, args);
            return;
        }

        this.logBuffer$.next({ level, message, args });
    }

    public setMode(mode: LogMode): void {
        this.mode = mode;
    }

    public getMode(): LogMode {
        return this.mode;
    }

    public setThrottleInterval(ms: number): void {
        this.throttleMs = ms;
        this.setupThrottledLogging();
    }

    public log(message: string, ...args: unknown[]): void {
        this.emit('log', message, args);
    }

    public warn(message: string, ...args: unknown[]): void {
        this.emit('warn', message, args);
    }

    public error(message: string, ...args: unknown[]): void {
        this.emit('error', message, args);
    }
}

export const logger = new Logger();
