import type { InputMap } from '../types/input-map';
import { Command, AxesCommand, TickCommand } from '../types/commands';
import type { AxesInput } from '../types/axes-input';
import { CommandResolver } from './command-resolver';

export class InputMapStack {
    private stack: InputMap[] = [];
    private resolver = new CommandResolver();

    private singleInputCache = new Map<string, Command[]>();
    private axesInputCache = new Map<string, AxesCommand[]>();
    private keyboardAxesCache = new Map<string, Array<{ command: AxesCommand; axis: AxesInput }>>();
    private tickCommandsCache: TickCommand[] | null = null;

    public push(inputMap: InputMap): void {
        this.stack.push(inputMap);
        this.invalidateCache();
    }

    public set(inputMap: InputMap): void {
        this.stack = [inputMap];
        this.invalidateCache();
    }

    public pop(): void {
        const popped = this.stack.pop();
        if (popped) {
            this.invalidateCache();
        }
    }

    public has(id: string): boolean {
        return this.stack.some((map) => map.id === id);
    }

    public remove(id: string): void {
        const initialLength = this.stack.length;
        this.stack = this.stack.filter((map) => map.id !== id);
        if (this.stack.length !== initialLength) {
            this.invalidateCache();
        }
    }

    public getCurrentId(): string | null {
        const current = this.stack.at(-1);
        return current ? current.id : null;
    }

    public getCurrent(): InputMap | null {
        return this.stack.at(-1) || null;
    }

    public isEmpty(): boolean {
        return this.stack.length === 0;
    }

    public getCommandsForSingleInput(key: string): Command[] {
        if (this.isEmpty()) {
            return [];
        }

        if (this.singleInputCache.has(key)) {
            return this.singleInputCache.get(key)!;
        }

        const currentMap = this.getCurrent()!;
        const commands = this.resolver.resolveSingleInput(currentMap, key);
        this.singleInputCache.set(key, commands);
        return commands;
    }

    public getCommandsForAxesInput(name: string): AxesCommand[] {
        if (this.isEmpty()) {
            return [];
        }

        if (this.axesInputCache.has(name)) {
            return this.axesInputCache.get(name)!;
        }

        const currentMap = this.getCurrent()!;
        const commands = this.resolver.resolveAxesInput(currentMap, name);
        this.axesInputCache.set(name, commands);
        return commands;
    }

    public getAxesCommandsForKey(key: string): Array<{ command: AxesCommand; axis: AxesInput }> {
        if (this.isEmpty()) {
            return [];
        }

        if (this.keyboardAxesCache.has(key)) {
            return this.keyboardAxesCache.get(key)!;
        }

        const currentMap = this.getCurrent()!;
        const commands = this.resolver.resolveKeyboardAxesInput(currentMap, key);
        this.keyboardAxesCache.set(key, commands);
        return commands;
    }

    public getTickCommands(): TickCommand[] {
        if (this.isEmpty()) {
            return [];
        }

        if (this.tickCommandsCache !== null) {
            return this.tickCommandsCache;
        }

        const currentMap = this.getCurrent()!;
        const commands = this.resolver.resolveTickCommands(currentMap);
        this.tickCommandsCache = commands;
        return commands;
    }

    private invalidateCache(): void {
        this.singleInputCache.clear();
        this.axesInputCache.clear();
        this.keyboardAxesCache.clear();
        this.tickCommandsCache = null;
    }

    public clear(): void {
        this.stack = [];
        this.invalidateCache();
    }
}