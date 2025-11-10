import { Subject, fromEvent, interval } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';

import { buttonMap, Inputs, symbolToConstant } from './input-utils';
import { AxesInput } from './input-map';

export class InputSource {
    private disconnect$ = new Subject<void>();

    private _singleInputTrigger$ = new Subject<string>();
    private _singleInputUpdate$ = new Subject<string>();
    private _singleInputRelease$ = new Subject<string>();

    private _axesInputTrigger$ = new Subject<{ name: string; axes: AxesInput }>();
    private _axesInputUpdate$ = new Subject<{ name: string; axes: AxesInput }>();
    private _axesInputRelease$ = new Subject<{ name: string; axes: AxesInput }>();

    private _tick$ = new Subject<number>();

    private _fps: number;
    private _deadzone: number;
    private _isWorking: boolean = false;
    private _useTick: boolean = false;
    private _lastTickTime: number = 0;

    private keyPress: string[] = [];
    private keyRelease: string[] = [];
    private activeKeys: string[] = [];

    private controllerIndex: number = -1;
    private controllerButtons: number[] = Array(17).fill(0);
    private controllerAxes = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];

    public singleInputTrigger$ = this._singleInputTrigger$.asObservable();
    public singleInputUpdate$ = this._singleInputUpdate$.asObservable();
    public singleInputRelease$ = this._singleInputRelease$.asObservable();

    public axesInputTrigger$ = this._axesInputTrigger$.asObservable();
    public axesInputUpdate$ = this._axesInputUpdate$.asObservable();
    public axesInputRelease$ = this._axesInputRelease$.asObservable();

    public tick$ = this._tick$.asObservable();

    constructor(fps: number = 12, deadzone: number = 0.1) {
        this._fps = fps;
        this._deadzone = deadzone;
        this.init();
    }

    private init() {
        this.disconnect$.next();
        this.disconnect$.complete();
        this.disconnect$ = new Subject<void>();

        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                map((e) => symbolToConstant(e.key.toLowerCase())),
                filter(
                    (key) =>
                        this.keyPress.indexOf(key) === -1 &&
                        this.activeKeys.indexOf(key) === -1
                ),
                takeUntil(this.disconnect$)
            )
            .subscribe((key) => {
                this.keyPress.push(key);
            });

        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(
                map((e) => symbolToConstant(e.key.toLowerCase())),
                takeUntil(this.disconnect$)
            )
            .subscribe((key) => {
                this.keyRelease.push(key);
            });

        fromEvent<GamepadEvent>(window, 'gamepadconnected').subscribe(
            (e: GamepadEvent) => {
                this.controllerIndex = e.gamepad.index;
            }
        );

        fromEvent<GamepadEvent>(window, 'gamepaddisconnected').subscribe(
            (e: GamepadEvent) => {
                if (this.controllerIndex === e.gamepad.index) {
                    this.controllerIndex = -1;
                    this.controllerButtons = Array(17).fill(0);
                    this.controllerAxes = [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                    ];
                }
            }
        );

        this.startGameLoop();
    }

    public startTick() {
        this._useTick = true;
        this._lastTickTime = performance.now();
    }

    private keyboardTriggers() {
        const keyPress = this.keyPress.slice();
        this.keyPress = [];
        while (keyPress.length) {
            const key = keyPress.pop();
            if (key) {
                this._singleInputTrigger$.next(key);
                this.activeKeys.push(key);
            }
        }
    }

    private keyboardReleases() {
        const keyRelease = this.keyRelease.slice();
        this.keyRelease = [];
        while (keyRelease.length) {
            const key = keyRelease.pop();
            if (key) {
                this._singleInputRelease$.next(key);
                this.activeKeys.splice(this.activeKeys.indexOf(key), 1);
            }
        }
    }

    private keyBoardUpdate() {
        const activeKeys = this.activeKeys.slice();
        activeKeys.forEach((key) => {
            this._singleInputUpdate$.next(key);
        });
    }

    private gamepadButtonTriggers() {
        const gamepad = navigator.getGamepads()[this.controllerIndex];
        if (!gamepad) {
            return;
        }
        const buttons = gamepad.buttons.map((button) => button.value);
        this.controllerButtons.forEach((button: number, index: number) => {
            const change = buttons[index] - button;
            if (Math.abs(change)) {
                change > 0
                    ? this._singleInputTrigger$.next(buttonMap[index])
                    : this._singleInputRelease$.next(buttonMap[index]);
            }
        });
        this.controllerButtons = buttons.slice();
    }

    private gamepadAxesTriggers() {
        const gamepad = navigator.getGamepads()[this.controllerIndex];
        if (!gamepad) {
            return;
        }
        const axes = gamepad.axes.map((axis) => {
            const hasValue = Math.abs(axis) > this._deadzone;
            return [hasValue ? 1 : 0, hasValue ? axis : 0];
        });
        const changes: boolean[] = [];
        this.controllerAxes.forEach((axis: number[], index: number) => {
            const change = axes[index][0] - axis[0];
            changes[index] = !!Math.abs(change);
        });
        if (changes[0] || changes[1]) {
            axes[0][0] || axes[1][0]
                ? this._axesInputTrigger$.next({
                    name: Inputs.CONTROLLER_LEFT_STICK,
                    axes: { x: axes[0][1], y: axes[1][1] },
                })
                : this._axesInputRelease$.next({
                    name: Inputs.CONTROLLER_LEFT_STICK,
                    axes: { x: axes[0][1], y: axes[1][1] },
                });
        }
        if (changes[2] || changes[3]) {
            axes[2][0] || axes[3][0]
                ? this._axesInputTrigger$.next({
                    name: Inputs.CONTROLLER_RIGHT_STICK,
                    axes: { x: axes[2][1], y: axes[3][1] },
                })
                : this._axesInputRelease$.next({
                    name: Inputs.CONTROLLER_RIGHT_STICK,
                    axes: { x: axes[2][1], y: axes[3][1] },
                });
        }
        this.controllerAxes = axes.slice();
    }

    private gamepadButtonUpdate() {
        this.controllerButtons.forEach((button: number, index: number) => {
            if (button) {
                this._singleInputUpdate$.next(buttonMap[index]);
            }
        });
    }

    private gamepadAxesUpdate() {
        if (this.controllerAxes[0][0] || this.controllerAxes[1][0]) {
            this._axesInputUpdate$.next({
                name: Inputs.CONTROLLER_LEFT_STICK,
                axes: { x: this.controllerAxes[0][1], y: this.controllerAxes[1][1] },
            });
        }
        if (this.controllerAxes[2][0] || this.controllerAxes[3][0]) {
            this._axesInputUpdate$.next({
                name: Inputs.CONTROLLER_RIGHT_STICK,
                axes: { x: this.controllerAxes[2][1], y: this.controllerAxes[3][1] },
            });
        }
    }

    private tick() {
        if (this._useTick) {
            const now = performance.now();
            const delta = now - this._lastTickTime;
            this._lastTickTime = now;
            this._tick$.next(delta);
        }
    }

    private startGameLoop() {
        interval(1000 / this._fps)
            .pipe(takeUntil(this.disconnect$))
            .subscribe(() => {
                if (!this._isWorking) {
                    this._isWorking = true;
                    this.keyBoardUpdate();
                    this.keyboardTriggers();
                    this.keyboardReleases();

                    this.gamepadButtonUpdate();
                    this.gamepadAxesUpdate();
                    this.gamepadButtonTriggers();
                    this.gamepadAxesTriggers();

                    this.tick();
                    this._isWorking = false;
                }
            });
    }

    public destroy() {
        this.disconnect$.next();
        this.disconnect$.complete();
    }
}
