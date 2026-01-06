import type { InputMap } from '../types/input-map';
import { Command, AxesCommand, TickCommand } from '../types/commands';
import type { AxesInput } from '../types/axes-input';
export declare class InputMapStack {
    private stack;
    private resolver;
    private singleInputCache;
    private axesInputCache;
    private keyboardAxesCache;
    private tickCommandsCache;
    push(inputMap: InputMap): void;
    set(inputMap: InputMap): void;
    pop(): void;
    has(id: string): boolean;
    remove(id: string): void;
    getCurrentId(): string | null;
    getCurrent(): InputMap | null;
    isEmpty(): boolean;
    getCommandsForSingleInput(key: string): Command[];
    getCommandsForAxesInput(name: string): AxesCommand[];
    getAxesCommandsForKey(key: string): Array<{
        command: AxesCommand;
        axis: AxesInput;
    }>;
    getTickCommands(): TickCommand[];
    private invalidateCache;
    clear(): void;
}
//# sourceMappingURL=input-map-stack.d.ts.map