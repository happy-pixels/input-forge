import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputSource } from './input-source';
import { Inputs } from './input-utils';
export class InputManager {
    _inputMapStack = [];
    _disconnect$ = new Subject();
    _inputSource;
    _commandCache = new Map();
    constructor(fps = 12, deadzone = 0.1) {
        this._inputSource = new InputSource(fps, deadzone);
        this._inputSource.singleInputTrigger$
            .pipe(takeUntil(this._disconnect$))
            .subscribe((key) => {
            if (this._inputMapStack.length > 0) {
                const commands = this.getCommands(key);
                commands.forEach((command) => {
                    command.trigger();
                });
                const axesCommands = this.getAxesByKey(key);
                axesCommands.forEach((entry) => {
                    const command = entry.command;
                    command.trigger(entry.axis);
                });
            }
        });
        this._inputSource.singleInputUpdate$
            .pipe(takeUntil(this._disconnect$))
            .subscribe((key) => {
            if (this._inputMapStack.length > 0) {
                const commands = this.getCommands(key);
                commands.forEach((command) => {
                    command.update();
                });
                const axesCommands = this.getAxesByKey(key);
                axesCommands.forEach((entry) => {
                    const command = entry.command;
                    command.update(entry.axis);
                });
            }
        });
        this._inputSource.singleInputRelease$
            .pipe(takeUntil(this._disconnect$))
            .subscribe((key) => {
            if (this._inputMapStack.length > 0) {
                const commands = this.getCommands(key);
                commands.forEach((command) => {
                    command.release();
                });
                const axesCommands = this.getAxesByKey(key);
                axesCommands.forEach((entry) => {
                    const command = entry.command;
                    command.update([entry.axis[0], 0]);
                });
            }
        });
        this._inputSource.axesInputTrigger$
            .pipe(takeUntil(this._disconnect$))
            .subscribe((data) => {
            if (this._inputMapStack.length > 0) {
                const commands = this.getAxesCommands(data.name);
                commands.forEach((command) => {
                    command.trigger(data.axes);
                });
            }
        });
        this._inputSource.axesInputUpdate$
            .pipe(takeUntil(this._disconnect$))
            .subscribe((data) => {
            if (this._inputMapStack.length > 0) {
                const commands = this.getAxesCommands(data.name);
                commands.forEach((command) => {
                    command.update(data.axes);
                });
            }
        });
        this._inputSource.axesInputRelease$
            .pipe(takeUntil(this._disconnect$))
            .subscribe((data) => {
            if (this._inputMapStack.length > 0) {
                const commands = this.getAxesCommands(data.name);
                commands.forEach((command) => {
                    command.release();
                });
            }
        });
        this._inputSource.tick$
            .pipe(takeUntil(this._disconnect$))
            .subscribe((delta) => {
            if (this._inputMapStack.length > 0) {
                const commands = this.getTickCommands();
                commands.forEach((command) => {
                    command.tick(delta);
                });
            }
        });
    }
    invalidateCommandCache() {
        this._commandCache.clear();
    }
    pushInputMap(inputMap) {
        this._inputMapStack.push(inputMap);
        this.invalidateCommandCache();
    }
    setInputMap(inputMap) {
        this._inputMapStack = [inputMap];
        this.invalidateCommandCache();
    }
    popInputMap() {
        this._inputMapStack.pop();
        this.invalidateCommandCache();
    }
    getCommands(key) {
        const inputMap = this._inputMapStack.at(-1);
        if (!inputMap?.singleInput) {
            return [];
        }
        if (this._commandCache.has(key)) {
            return this._commandCache.get(key);
        }
        const commands = Object.values(inputMap.singleInput)
            .filter((entry) => entry.keyboardInput === key || entry.controllerInput === key)
            .map((entry) => entry.command);
        this._commandCache.set(key, commands);
        return commands;
    }
    getAxesCommands(name) {
        const inputMap = this._inputMapStack.at(-1);
        return Object.values(inputMap?.axesInput ?? {})
            .filter((entry) => entry.controllerstick === name)
            .map((entry) => entry.command);
    }
    getAxesByKey(key) {
        const inputMap = this._inputMapStack.at(-1);
        if (!inputMap) {
            return [];
        }
        if (!inputMap.axesInput || Object.keys(inputMap.axesInput).length === 0) {
            return [];
        }
        return Object.values(inputMap.axesInput)
            .filter((entry) => {
            switch (key) {
                case entry.keyboardAxes?.vertical.up:
                    return true;
                case entry.keyboardAxes?.vertical.down:
                    return true;
                case entry.keyboardAxes?.horizontal.left:
                    return true;
                case entry.keyboardAxes?.horizontal.right:
                    return true;
                default:
                    return false;
            }
        })
            .map((entry) => {
            let axis = [0, 0];
            switch (key) {
                case entry.keyboardAxes?.vertical.up:
                    axis = [0, -1];
                    break;
                case entry.keyboardAxes?.vertical.down:
                    axis = [0, 1];
                    break;
                case entry.keyboardAxes?.horizontal.left:
                    axis = [-1, 0];
                    break;
                case entry.keyboardAxes?.horizontal.right:
                    axis = [1, 0];
                    break;
            }
            return {
                command: entry.command,
                axis: axis,
            };
        });
    }
    getTickCommands() {
        const inputMap = this._inputMapStack.at(-1);
        if (!inputMap?.singleInput) {
            return [];
        }
        if (this._commandCache.has(Inputs.SYSTEM_TICK)) {
            return this._commandCache.get(Inputs.SYSTEM_TICK);
        }
        const commands = Object.values(inputMap.singleInput)
            .filter((entry) => entry.systemInput === Inputs.SYSTEM_TICK)
            .map((entry) => entry.command);
        this._commandCache.set(Inputs.SYSTEM_TICK, commands);
        return commands;
    }
    destroy() {
        this._disconnect$.next();
        this._disconnect$.complete();
        this._inputSource.destroy();
        this._commandCache.clear();
        this._inputMapStack = [];
    }
}
//# sourceMappingURL=input-manager.js.map