import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputMapStack } from './input-map-stack';
import { KeyboardSource } from '../sources/keyboard-source';
import { GamepadSource } from '../sources/gamepad-source';
import { CustomSource } from '../sources/custom-source';
export class InputManager {
    disconnect$ = new Subject();
    inputMapStack;
    keyboardSource;
    gamepadSource;
    customSource;
    tickEnabled = false;
    lastTickTime = 0;
    constructor(gamepadFps = 60, gamepadDeadZone = 0.1) {
        this.inputMapStack = new InputMapStack();
        this.keyboardSource = new KeyboardSource();
        this.gamepadSource = new GamepadSource(gamepadFps, gamepadDeadZone);
        this.customSource = new CustomSource();
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        merge(this.keyboardSource.singleInputEvent$, this.gamepadSource.singleInputEvent$, this.customSource.singleInputEvent$)
            .pipe(takeUntil(this.disconnect$))
            .subscribe((event) => {
            if (this.inputMapStack.isEmpty()) {
                return;
            }
            const commands = this.inputMapStack.getCommandsForSingleInput(event.key);
            const axesCommands = this.inputMapStack.getAxesCommandsForKey(event.key);
            commands.forEach((command) => {
                switch (event.type) {
                    case 'trigger':
                        command.trigger();
                        break;
                    case 'update':
                        command.update();
                        break;
                    case 'release':
                        command.release();
                        break;
                }
            });
            axesCommands.forEach(({ command, axis }) => {
                switch (event.type) {
                    case 'trigger':
                        command.trigger(axis);
                        break;
                    case 'update':
                        command.update(axis);
                        break;
                    case 'release':
                        command.release();
                        break;
                }
            });
        });
        merge(this.gamepadSource.axesInputEvent$, this.customSource.axesInputEvent$)
            .pipe(takeUntil(this.disconnect$))
            .subscribe((event) => {
            if (this.inputMapStack.isEmpty()) {
                return;
            }
            const commands = this.inputMapStack.getCommandsForAxesInput(event.name);
            commands.forEach((command) => {
                switch (event.type) {
                    case 'trigger':
                        command.trigger(event.axes);
                        break;
                    case 'update':
                        command.update(event.axes);
                        break;
                    case 'release':
                        command.release();
                        break;
                }
            });
        });
    }
    startTick() {
        if (this.tickEnabled) {
            return;
        }
        this.tickEnabled = true;
        this.lastTickTime = performance.now();
        this.runTickLoop();
    }
    stopTick() {
        this.tickEnabled = false;
    }
    runTickLoop() {
        if (!this.tickEnabled) {
            return;
        }
        const now = performance.now();
        const delta = now - this.lastTickTime;
        this.lastTickTime = now;
        if (!this.inputMapStack.isEmpty()) {
            const commands = this.inputMapStack.getTickCommands();
            commands.forEach((command) => {
                command.tick(delta);
            });
        }
        this.keyboardSource.emitUpdates();
        requestAnimationFrame(() => this.runTickLoop());
    }
    // ==================== Input Map Management ====================
    pushInputMap(inputMap) {
        this.inputMapStack.push(inputMap);
    }
    setInputMap(inputMap) {
        this.inputMapStack.set(inputMap);
    }
    popInputMap() {
        this.inputMapStack.pop();
    }
    hasInputMap(id) {
        return this.inputMapStack.has(id);
    }
    removeInputMap(id) {
        this.inputMapStack.remove(id);
    }
    currentInputMap() {
        return this.inputMapStack.getCurrentId();
    }
    // ==================== Custom Input API ====================
    triggerCustomInput(input) {
        this.customSource.triggerInput(input);
    }
    triggerCustomAxesInput(name, axes) {
        this.customSource.triggerAxesInput(name, axes);
    }
    updateCustomAxesInput(name, axes) {
        this.customSource.updateAxesInput(name, axes);
    }
    releaseCustomAxesInput(name) {
        this.customSource.releaseAxesInput(name);
    }
    // ==================== Cleanup ====================
    destroy() {
        this.stopTick();
        this.disconnect$.next();
        this.disconnect$.complete();
        this.keyboardSource.destroy();
        this.gamepadSource.destroy();
        this.customSource.destroy();
        this.inputMapStack.clear();
    }
}
//# sourceMappingURL=input-manager.js.map