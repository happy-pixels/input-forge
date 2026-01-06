import { fromEvent, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputSourceBase } from './input-source-base';
import { buttonMap, Inputs } from '../constants/inputs';
export class GamepadSource extends InputSourceBase {
    fps;
    deadzone;
    controllerIndex = -1;
    controllerButtons = Array(17).fill(0);
    controllerAxes = Array(4).fill(0);
    previousAxesActive = {
        leftStick: false,
        rightStick: false,
    };
    constructor(fps = 60, deadzone = 0.2) {
        super();
        this.fps = fps;
        this.deadzone = deadzone;
        this.init();
    }
    init() {
        fromEvent(window, 'gamepadconnected')
            .pipe(takeUntil(this.disconnect$))
            .subscribe((e) => {
            this.controllerIndex = e.gamepad.index;
        });
        fromEvent(window, 'gamepaddisconnected')
            .pipe(takeUntil(this.disconnect$))
            .subscribe((e) => {
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
    startPolling() {
        interval(1000 / this.fps)
            .pipe(takeUntil(this.disconnect$))
            .subscribe(() => {
            if (this.controllerIndex !== -1) {
                this.pollGamepad();
            }
        });
    }
    pollGamepad() {
        const gamepad = navigator.getGamepads()[this.controllerIndex];
        if (!gamepad)
            return;
        this.processButtons(gamepad);
        this.processAxes(gamepad);
    }
    processButtons(gamepad) {
        const buttons = gamepad.buttons.map((button) => button.value);
        buttons.forEach((value, index) => {
            const previousValue = this.controllerButtons[index];
            const change = value - previousValue;
            if (Math.abs(change) > 0) {
                const event = {
                    key: buttonMap[index],
                    source: 'gamepad',
                };
                if (change > 0) {
                    this._singleInputEvent$.next({ ...event, type: 'trigger' });
                }
                else {
                    this._singleInputEvent$.next({ ...event, type: 'release' });
                }
            }
            else if (value > 0) {
                this._singleInputEvent$.next({
                    type: 'update',
                    key: buttonMap[index],
                    source: 'gamepad',
                });
            }
        });
        this.controllerButtons = buttons;
    }
    processAxes(gamepad) {
        const rawAxes = Array.from(gamepad.axes);
        const currentAxes = rawAxes.map((axis) => Math.abs(axis) > this.deadzone ? axis : 0);
        this.processStick(currentAxes[0], currentAxes[1], this.controllerAxes[0], this.controllerAxes[1], Inputs.CONTROLLER_LEFT_STICK, 'leftStick');
        this.processStick(currentAxes[2], currentAxes[3], this.controllerAxes[2], this.controllerAxes[3], Inputs.CONTROLLER_RIGHT_STICK, 'rightStick');
        this.controllerAxes = currentAxes;
    }
    processStick(currentX, currentY, previousX, previousY, name, stickKey) {
        const isCurrentlyActive = currentX !== 0 || currentY !== 0;
        const wasActive = this.previousAxesActive[stickKey];
        const hasChanged = currentX !== previousX || currentY !== previousY;
        const axesValue = { x: currentX, y: currentY };
        if (hasChanged) {
            if (isCurrentlyActive && !wasActive) {
                this._axesInputEvent$.next({
                    type: 'trigger',
                    name,
                    axes: axesValue,
                    source: 'gamepad',
                });
                this.previousAxesActive[stickKey] = true;
            }
            else if (!isCurrentlyActive && wasActive) {
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
        }
        else if (isCurrentlyActive) {
            this._axesInputEvent$.next({
                type: 'update',
                name,
                axes: axesValue,
                source: 'gamepad',
            });
        }
    }
    getState() {
        const activeButtons = new Set();
        this.controllerButtons.forEach((value, index) => {
            if (value > 0) {
                activeButtons.add(buttonMap[index]);
            }
        });
        const axesInputs = new Map();
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
//# sourceMappingURL=gamepad-source.js.map