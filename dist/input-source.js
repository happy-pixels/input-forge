import { Subject, fromEvent, interval } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';
import { buttonMap, Inputs, symbolToConstant } from './input-utils';
export class InputSource {
    disconnect$ = new Subject();
    _singleInputTrigger$ = new Subject();
    _singleInputUpdate$ = new Subject();
    _singleInputRelease$ = new Subject();
    _axesInputTrigger$ = new Subject();
    _axesInputUpdate$ = new Subject();
    _axesInputRelease$ = new Subject();
    _tick$ = new Subject();
    _fps;
    _deadzone;
    _isWorking = false;
    _useTick = false;
    _lastTickTime = 0;
    keyPress = [];
    keyRelease = [];
    activeKeys = [];
    customInputs = [];
    controllerIndex = -1;
    controllerButtons = Array(17).fill(0);
    controllerAxes = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];
    singleInputTrigger$ = this._singleInputTrigger$.asObservable();
    singleInputUpdate$ = this._singleInputUpdate$.asObservable();
    singleInputRelease$ = this._singleInputRelease$.asObservable();
    axesInputTrigger$ = this._axesInputTrigger$.asObservable();
    axesInputUpdate$ = this._axesInputUpdate$.asObservable();
    axesInputRelease$ = this._axesInputRelease$.asObservable();
    tick$ = this._tick$.asObservable();
    constructor(fps = 12, deadzone = 0.1) {
        this._fps = fps;
        this._deadzone = deadzone;
        this.init();
    }
    init() {
        this.disconnect$.next();
        this.disconnect$.complete();
        this.disconnect$ = new Subject();
        fromEvent(document, 'keydown')
            .pipe(map((e) => symbolToConstant(e.key.toLowerCase())), filter((key) => this.keyPress.indexOf(key) === -1 &&
            this.activeKeys.indexOf(key) === -1), takeUntil(this.disconnect$))
            .subscribe((key) => {
            this.keyPress.push(key);
        });
        fromEvent(document, 'keyup')
            .pipe(map((e) => symbolToConstant(e.key.toLowerCase())), takeUntil(this.disconnect$))
            .subscribe((key) => {
            this.keyRelease.push(key);
        });
        fromEvent(window, 'gamepadconnected').subscribe((e) => {
            this.controllerIndex = e.gamepad.index;
        });
        fromEvent(window, 'gamepaddisconnected').subscribe((e) => {
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
        });
        this.startGameLoop();
    }
    startTick() {
        this._useTick = true;
        this._lastTickTime = performance.now();
    }
    triggerCustomInput(input) {
        this.customInputs.push(input);
    }
    keyboardTriggers() {
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
    keyboardReleases() {
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
    keyBoardUpdate() {
        const activeKeys = this.activeKeys.slice();
        activeKeys.forEach((key) => {
            this._singleInputUpdate$.next(key);
        });
    }
    gamepadButtonTriggers() {
        const gamepad = navigator.getGamepads()[this.controllerIndex];
        if (!gamepad) {
            return;
        }
        const buttons = gamepad.buttons.map((button) => button.value);
        this.controllerButtons.forEach((button, index) => {
            const change = buttons[index] - button;
            if (Math.abs(change)) {
                change > 0
                    ? this._singleInputTrigger$.next(buttonMap[index])
                    : this._singleInputRelease$.next(buttonMap[index]);
            }
        });
        this.controllerButtons = buttons.slice();
    }
    gamepadAxesTriggers() {
        const gamepad = navigator.getGamepads()[this.controllerIndex];
        if (!gamepad) {
            return;
        }
        const axes = gamepad.axes.map((axis) => {
            const hasValue = Math.abs(axis) > this._deadzone;
            return [hasValue ? 1 : 0, hasValue ? axis : 0];
        });
        const changes = [];
        this.controllerAxes.forEach((axis, index) => {
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
    gamepadButtonUpdate() {
        this.controllerButtons.forEach((button, index) => {
            if (button) {
                this._singleInputUpdate$.next(buttonMap[index]);
            }
        });
    }
    gamepadAxesUpdate() {
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
    tick() {
        if (this._useTick) {
            const now = performance.now();
            const delta = now - this._lastTickTime;
            this._lastTickTime = now;
            this._tick$.next(delta);
        }
    }
    customInputUpdate() {
        let customInput;
        while (this.customInputs.length) {
            customInput = this.customInputs.pop();
            this._singleInputTrigger$.next(customInput);
        }
    }
    startGameLoop() {
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
                this.customInputUpdate();
                this.tick();
                this._isWorking = false;
            }
        });
    }
    destroy() {
        this.disconnect$.next();
        this.disconnect$.complete();
    }
}
//# sourceMappingURL=input-source.js.map