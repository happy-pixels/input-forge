// TODO: dead code - delete file.
import { AxesInput } from './input-map';

export abstract class Command<T = void> {
    public trigger(_value?: T): void {}
    public update(_value?: T): void {}
    public release(): void {}
}

export abstract class AxesCommand extends Command<[number, number] | AxesInput> {
    public trigger(_value: [number, number] | AxesInput): void {}
    public update(_value: [number, number] | AxesInput): void {}
}

export abstract class TickCommand extends Command {
    public tick(_delta: number): void {}
}