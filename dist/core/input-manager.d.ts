import type { InputMap } from '../types/input-map';
import type { AxesInput } from '../types/axes-input';
export declare class InputManager {
    private disconnect$;
    private inputMapStack;
    private keyboardSource;
    private gamepadSource;
    private customSource;
    private tickEnabled;
    private lastTickTime;
    constructor(gamepadFps?: number, gamepadDeadZone?: number);
    private setupEventHandlers;
    startTick(): void;
    stopTick(): void;
    private runTickLoop;
    pushInputMap(inputMap: InputMap): void;
    setInputMap(inputMap: InputMap): void;
    popInputMap(): void;
    hasInputMap(id: string): boolean;
    removeInputMap(id: string): void;
    currentInputMap(): string | null;
    triggerCustomInput(input: string): void;
    triggerCustomAxesInput(name: string, axes: AxesInput | [number, number]): void;
    updateCustomAxesInput(name: string, axes: AxesInput | [number, number]): void;
    releaseCustomAxesInput(name: string): void;
    destroy(): void;
}
//# sourceMappingURL=input-manager.d.ts.map