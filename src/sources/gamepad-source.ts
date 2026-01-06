import { fromEvent, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputSourceBase } from './input-source-base';
import type { InputSourceState, AxesInputState } from '../types/input-state';
import type { AxesInput } from '../types/axes-input';
import { buttonMap, Inputs } from '../constants/inputs';

export class GamepadSource extends InputSourceBase {
    private fps: number;
    private deadzone: number;
    private controllerIndex: number = -1;
    private controllerButtons: number[] = Array(17).fill(0);
    private controllerAxes: number[] = Array(4).fill(0);
    private previousAxesActive = {
        leftStick: false,
        rightStick: false,
    };

    constructor(fps: number = 60, deadzone: number = 0.2) {
        super();
        this.fps = fps;
        this.deadzone = deadzone;
        this.init();
    }

    protected init(): void {
        fromEvent<GamepadEvent>(window, 'gamepadconnected')
            .pipe(takeUntil(this.disconnect$))
            .subscribe((e: GamepadEvent) => {
                this.controllerIndex = e.gamepad.index;
            });

        fromEvent<GamepadEvent>(window, 'gamepaddisconnected')
            .pipe(takeUntil(this.disconnect$))
            .subscribe((e: GamepadEvent) => {
                if (this.controllerIndex === e.gamepad.index) {
                    this.controllerIndex = -1;
                    this.controllerButtons = Array(17).fill(0);
                    this.controllerAxes = Array(4).fill(0);
                    this.previousAxesActive = {
                        leftStick: false,
                        rightStick: false,
                    };
                }
            });

        this.startPolling();
    }

    private startPolling(): void {
        interval(1000 / this.fps)
            .pipe(takeUntil(this.disconnect$))
            .subscribe(() => {
                if (this.controllerIndex !== -1) {
                    this.pollGamepad();
                }
            });
    }

    private pollGamepad(): void {
        const gamepad = navigator.getGamepads()[this.controllerIndex];
        if (!gamepad) return;

        this.processButtons(gamepad);
        this.processAxes(gamepad);
    }

    private processButtons(gamepad: Gamepad): void {
        const buttons = gamepad.buttons.map((button) => button.value);

        buttons.forEach((value, index) => {
            const previousValue = this.controllerButtons[index];
            const change = value - previousValue;

            if (Math.abs(change) > 0) {
                const event = {
                    key: buttonMap[index],
                    source: 'gamepad' as const,
                };

                if (change > 0) {
                    this._singleInputEvent$.next({ ...event, type: 'trigger' });
                } else {
                    this._singleInputEvent$.next({ ...event, type: 'release' });
                }
            } else if (value > 0) {
                this._singleInputEvent$.next({
                    type: 'update',
                    key: buttonMap[index],
                    source: 'gamepad',
                });
            }
        });

        this.controllerButtons = buttons;
    }

    private processAxes(gamepad: Gamepad): void {
        const rawAxes = Array.from(gamepad.axes);
        const currentAxes = rawAxes.map((axis) => Math.abs(axis) > this.deadzone ? axis : 0);

        this.processStick(
            currentAxes[0],
            currentAxes[1],
            this.controllerAxes[0],
            this.controllerAxes[1],
            Inputs.CONTROLLER_LEFT_STICK,
            'leftStick'
        );

        this.processStick(
            currentAxes[2],
            currentAxes[3],
            this.controllerAxes[2],
            this.controllerAxes[3],
            Inputs.CONTROLLER_RIGHT_STICK,
            'rightStick'
        );

        this.controllerAxes = currentAxes;
    }

    private processStick(
        currentX: number,
        currentY: number,
        previousX: number,
        previousY: number,
        name: string,
        stickKey: 'leftStick' | 'rightStick'
    ): void {
        const isCurrentlyActive = currentX !== 0 || currentY !== 0;
        const wasActive = this.previousAxesActive[stickKey];
        const hasChanged = currentX !== previousX || currentY !== previousY;

        const axesValue: AxesInput = { x: currentX, y: currentY };

        if (hasChanged) {
            if (isCurrentlyActive && !wasActive) {
                this._axesInputEvent$.next({
                    type: 'trigger',
                    name,
                    axes: axesValue,
                    source: 'gamepad',
                });
                this.previousAxesActive[stickKey] = true;
            } else if (!isCurrentlyActive && wasActive) {
                this._axesInputEvent$.next({
                    type: 'release',
                    name,
                    axes: axesValue,
                    source: 'gamepad',
                });
                this.previousAxesActive[stickKey] = false;
            // } else if (isCurrentlyActive) {
            //     this._axesInputEvent$.next({
            //         type: 'update',
            //         name,
            //         axes: axesValue,
            //         source: 'gamepad',
            //     });
            }
        } else if (isCurrentlyActive) {
            this._axesInputEvent$.next({
                type: 'update',
                name,
                axes: axesValue,
                source: 'gamepad',
            });
        }
    }

    public getState(): InputSourceState {
        const activeButtons = new Set<string>();
        this.controllerButtons.forEach((value, index) => {
            if (value > 0) {
                activeButtons.add(buttonMap[index]);
            }
        });

        const axesInputs = new Map<string, AxesInputState>();

        if (this.previousAxesActive.leftStick) {
            axesInputs.set(Inputs.CONTROLLER_LEFT_STICK, {
                name: Inputs.CONTROLLER_LEFT_STICK,
                current: { x: this.controllerAxes[0], y: this.controllerAxes[1] },
                previous: { x: this.controllerAxes[0], y: this.controllerAxes[1] },
                isActive: true,
            });
        }

        if (this.previousAxesActive.rightStick) {
            axesInputs.set(Inputs.CONTROLLER_RIGHT_STICK, {
                name: Inputs.CONTROLLER_RIGHT_STICK,
                current: { x: this.controllerAxes[2], y: this.controllerAxes[3] },
                previous: { x: this.controllerAxes[2], y: this.controllerAxes[3] },
                isActive: true,
            });
        }

        return {
            singleInputs: {
                activeInputs: activeButtons,
                pendingTriggers: [],
                pendingReleases: [],
            },
            axesInputs,
        };
    }
}