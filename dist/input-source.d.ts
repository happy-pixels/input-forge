import { AxesInput } from './input-map';
export declare class InputSource {
    private disconnect$;
    private _singleInputTrigger$;
    private _singleInputUpdate$;
    private _singleInputRelease$;
    private _axesInputTrigger$;
    private _axesInputUpdate$;
    private _axesInputRelease$;
    private _tick$;
    private _fps;
    private _deadzone;
    private _isWorking;
    private _useTick;
    private _lastTickTime;
    private keyPress;
    private keyRelease;
    private activeKeys;
    private controllerIndex;
    private controllerButtons;
    private controllerAxes;
    singleInputTrigger$: import("rxjs").Observable<string>;
    singleInputUpdate$: import("rxjs").Observable<string>;
    singleInputRelease$: import("rxjs").Observable<string>;
    axesInputTrigger$: import("rxjs").Observable<{
        name: string;
        axes: AxesInput;
    }>;
    axesInputUpdate$: import("rxjs").Observable<{
        name: string;
        axes: AxesInput;
    }>;
    axesInputRelease$: import("rxjs").Observable<{
        name: string;
        axes: AxesInput;
    }>;
    tick$: import("rxjs").Observable<number>;
    constructor(fps?: number, deadzone?: number);
    private init;
    startTick(): void;
    private keyboardTriggers;
    private keyboardReleases;
    private keyBoardUpdate;
    private gamepadButtonTriggers;
    private gamepadAxesTriggers;
    private gamepadButtonUpdate;
    private gamepadAxesUpdate;
    private tick;
    private startGameLoop;
    destroy(): void;
}
//# sourceMappingURL=input-source.d.ts.map