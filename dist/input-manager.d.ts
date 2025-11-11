import { InputMap } from './input-map';
export declare class InputManager {
    private _inputMapStack;
    private _disconnect$;
    private _inputSource;
    private _commandCache;
    constructor(fps?: number, deadzone?: number);
    private invalidateCommandCache;
    pushInputMap(inputMap: InputMap): void;
    setInputMap(inputMap: InputMap): void;
    popInputMap(): void;
    private getCommands;
    private getAxesCommands;
    private getAxesByKey;
    private getTickCommands;
    destroy(): void;
}
//# sourceMappingURL=input-manager.d.ts.map