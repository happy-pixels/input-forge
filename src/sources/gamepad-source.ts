import { fromEvent, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputSourceBase } from './input-source-base';
import type { InputSourceState, AxesInputState } from '../types/input-state';
import type { AxesInput } from '../types/axes-input';
import { InputDeviceType } from '../types/input-events';
import { buttonMap, Inputs } from '../constants/inputs';
import { logger } from '../core/logger';

const EXPECTED_BUTTONS = 17;
const EXPECTED_AXES = 4;

export class GamepadSource extends InputSourceBase {
    private fps: number;
    private deadzone: number;
    private controllerIndex: number = -1;
    private controllerButtons: number[] = Array(EXPECTED_BUTTONS).fill(0);
    private controllerAxes: number[] = Array(EXPECTED_AXES).fill(0);
    private previousAxesActive = {
        leftStick: false,
        rightStick: false,
    };
    private _controllerType: InputDeviceType | null = null;
    private _controllerType$ = new Subject<InputDeviceType>();

    /** Emits the controller type when a gamepad connects */
    public controllerType$ = this._controllerType$.asObservable();

    constructor(fps: number = 60, deadzone: number = 0.2) {
        super();
        this.fps = Math.max(1, Math.min(fps, 120));
        this.deadzone = Math.max(0, Math.min(deadzone, 1));
        this.init();
    }

    protected init(): void {
        fromEvent<GamepadEvent>(window, 'gamepadconnected')
            .pipe(takeUntil(this.disconnect$))
            .subscribe((e: GamepadEvent) => {
                this.controllerIndex = e.gamepad.index;
                this._controllerType = this.detectControllerType(e.gamepad.id);
                this._controllerType$.next(this._controllerType);
                logger.log(`Gamepad connected: "${e.gamepad.id}" at index ${e.gamepad.index} (type: ${this._controllerType})`);

                if (e.gamepad.buttons.length < EXPECTED_BUTTONS) {
                    logger.warn(`Gamepad has ${e.gamepad.buttons.length} buttons (expected ${EXPECTED_BUTTONS}). Some buttons may not work.`);
                }
                if (e.gamepad.axes.length < EXPECTED_AXES) {
                    logger.warn(`Gamepad has ${e.gamepad.axes.length} axes (expected ${EXPECTED_AXES}). Some sticks may not work.`);
                }
            });

        fromEvent<GamepadEvent>(window, 'gamepaddisconnected')
            .pipe(takeUntil(this.disconnect$))
            .subscribe((e: GamepadEvent) => {
                if (this.controllerIndex === e.gamepad.index) {
                    logger.log(`Gamepad disconnected: "${e.gamepad.id}"`);
                    this.controllerIndex = -1;
                    this._controllerType = null;
                    this.controllerButtons = Array(EXPECTED_BUTTONS).fill(0);
                    this.controllerAxes = Array(EXPECTED_AXES).fill(0);
                    this.previousAxesActive = {
                        leftStick: false,
                        rightStick: false,
                    };
                }
            });

        this.startPolling();
    }

    /**
     * Detects the controller type from the gamepad ID string.
     * @param id - The gamepad.id string from the Gamepad API
     * @returns The detected controller type
     */
    private detectControllerType(id: string): InputDeviceType {
        const idLower = id.toLowerCase();

        // Xbox detection: "Xbox", "XInput", or Microsoft vendor ID (045e)
        if (idLower.includes('xbox') || idLower.includes('xinput') || idLower.includes('045e')) {
            return InputDeviceType.Xbox;
        }

        // PlayStation detection: Sony vendor ID (054c), "DualShock", "DualSense", or specific product IDs
        // Sony vendor ID in various formats: "054c", "54c-", "Vendor: 054c"
        if (
            idLower.includes('054c') ||
            idLower.includes('54c-') ||
            idLower.includes('dualshock') ||
            idLower.includes('dualsense') ||
            (idLower.includes('wireless controller') && idLower.includes('sony'))
        ) {
            return InputDeviceType.PlayStation;
        }

        // Fallback check: "Wireless Controller" with Sony product IDs (common for DualShock 4)
        // DualShock 4 v1: 05c4, DualShock 4 v2: 09cc, DualSense: 0ce6
        if (
            idLower.includes('wireless controller') &&
            (idLower.includes('05c4') || idLower.includes('09cc') || idLower.includes('0ce6') || idLower.includes('5c4-') || idLower.includes('9cc-'))
        ) {
            return InputDeviceType.PlayStation;
        }

        return InputDeviceType.OtherController;
    }

    /** Gets the currently connected controller type, or null if no controller is connected */
    public getControllerType(): InputDeviceType | null {
        return this._controllerType;
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
        if (!gamepad) {
            return;
        }

        this.processButtons(gamepad);
        this.processAxes(gamepad);
    }

    private processButtons(gamepad: Gamepad): void {
        const buttonCount = Math.min(gamepad.buttons.length, EXPECTED_BUTTONS);

        for (let index = 0; index < buttonCount; index++) {
            const value = gamepad.buttons[index].value;
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

            this.controllerButtons[index] = value;
        }
    }

    private processAxes(gamepad: Gamepad): void {
        const axesCount = gamepad.axes.length;

        const getAxis = (index: number): number => {
            if (index >= axesCount) {
                return 0;
            }
            const raw = gamepad.axes[index];
            return Math.abs(raw) > this.deadzone ? raw : 0;
        };

        const currentAxes = [getAxis(0), getAxis(1), getAxis(2), getAxis(3)];

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