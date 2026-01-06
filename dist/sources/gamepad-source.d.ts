import { InputSourceBase } from './input-source-base';
import type { InputSourceState } from '../types/input-state';
export declare class GamepadSource extends InputSourceBase {
    private fps;
    private deadzone;
    private controllerIndex;
    private controllerButtons;
    private controllerAxes;
    private previousAxesActive;
    constructor(fps?: number, deadzone?: number);
    protected init(): void;
    private startPolling;
    private pollGamepad;
    private processButtons;
    private processAxes;
    private processStick;
    getState(): InputSourceState;
}
//# sourceMappingURL=gamepad-source.d.ts.map