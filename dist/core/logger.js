/* eslint-disable no-console */
import { Subject } from 'rxjs';
import { bufferTime, filter } from 'rxjs/operators';
const DEFAULT_THROTTLE_MS = 1000;
class Logger {
    mode = 'off';
    throttleMs = DEFAULT_THROTTLE_MS;
    logBuffer$ = new Subject();
    bufferSubscription = null;
    prefix = '[InputForge]';
    constructor() {
        this.setupThrottledLogging();
    }
    setupThrottledLogging() {
        this.bufferSubscription?.unsubscribe();
        this.bufferSubscription = this.logBuffer$
            .pipe(bufferTime(this.throttleMs), filter((entries) => entries.length > 0 && this.mode === 'throttled'))
            .subscribe((entries) => {
            this.flushEntries(entries);
        });
    }
    flushEntries(entries) {
        const grouped = this.groupEntries(entries);
        for (const [level, messages] of Object.entries(grouped)) {
            if (messages.length === 1) {
                this.writeToConsole(level, messages[0].message, messages[0].args);
            }
            else {
                const summary = `(${messages.length} messages)`;
                console[level](`${this.prefix} ${summary}`);
                messages.forEach((entry) => {
                    console[level](`  ${entry.message}`, ...entry.args);
                });
            }
        }
    }
    groupEntries(entries) {
        return entries.reduce((acc, entry) => {
            acc[entry.level].push(entry);
            return acc;
        }, { log: [], warn: [], error: [] });
    }
    writeToConsole(level, message, args) {
        console[level](`${this.prefix} ${message}`, ...args);
    }
    emit(level, message, args) {
        if (this.mode === 'off') {
            return;
        }
        if (this.mode === 'on') {
            this.writeToConsole(level, message, args);
            return;
        }
        this.logBuffer$.next({ level, message, args });
    }
    setMode(mode) {
        this.mode = mode;
    }
    getMode() {
        return this.mode;
    }
    setThrottleInterval(ms) {
        this.throttleMs = ms;
        this.setupThrottledLogging();
    }
    log(message, ...args) {
        this.emit('log', message, args);
    }
    warn(message, ...args) {
        this.emit('warn', message, args);
    }
    error(message, ...args) {
        this.emit('error', message, args);
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map