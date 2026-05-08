import { InputSourceBase } from './input-source-base';
import type { InputSourceState } from '../types/input-state';
import { InputDeviceType } from '../types/input-events';
export declare class GamepadSource extends InputSourceBase {
    private fps;
    private deadzone;
    private controllerIndex;
    private controllerButtons;
    private controllerAxes;
    private previousAxesActive;
    private _controllerType;
    private _controllerType$;
    /** Emits the controller type when a gamepad connects */
    controllerType$: import("rxjs").Observable<InputDeviceType>;
    constructor(fps?: number, deadzone?: number);
    protected init(): void;
    /**
     * Detects the controller type from the gamepad ID string.
     * @param id - The gamepad.id string from the Gamepad API
     * @returns The detected controller type
     */
    private detectControllerType;
    /** Gets the currently connected controller type, or null if no controller is connected */
    getControllerType(): InputDeviceType | null;
    private startPolling;
    private pollGamepad;
    private processButtons;
    private processAxes;
    private processStick;
    getState(): InputSourceState;
}
//# sourceMappingURL=gamepad-source.d.ts.map