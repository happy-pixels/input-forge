import type { AxesInput } from './axes-input';
export declare abstract class Command<T = void> {
    trigger(_value?: T): void;
    update(_value?: T): void;
    release(): void;
}
export declare abstract class AxesCommand extends Command<[number, number] | AxesInput> {
    trigger(_value: [number, number] | AxesInput): void;
    update(_value: [number, number] | AxesInput): void;
}
export declare abstract class TickCommand extends Command {
    tick(_delta: number): void;
}
//# sourceMappingURL=commands.d.ts.map