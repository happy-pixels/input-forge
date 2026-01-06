import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { InputMap } from '../types/input-map';
import type { AxesInput } from '../types/axes-input';
import { InputMapStack } from './input-map-stack';
import { KeyboardSource } from '../sources/keyboard-source';
import { GamepadSource } from '../sources/gamepad-source';
import { CustomSource } from '../sources/custom-source';

export class InputManager {
    private disconnect$ = new Subject<void>();
    private inputMapStack: InputMapStack;

    private keyboardSource: KeyboardSource;
    private gamepadSource: GamepadSource;
    private customSource: CustomSource;

    private tickEnabled = false;
    private lastTickTime = 0;

    constructor(gamepadFps: number = 60, gamepadDeadZone: number = 0.1) {
        this.inputMapStack = new InputMapStack();
        this.keyboardSource = new KeyboardSource();
        this.gamepadSource = new GamepadSource(gamepadFps, gamepadDeadZone);
        this.customSource = new CustomSource();

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        merge(
            this.keyboardSource.singleInputEvent$,
            this.gamepadSource.singleInputEvent$,
            this.customSource.singleInputEvent$
        )
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

        merge(
            this.gamepadSource.axesInputEvent$,
            this.customSource.axesInputEvent$
        )
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

    public startTick(): void {
        if (this.tickEnabled) {
            return;
        }

        this.tickEnabled = true;
        this.lastTickTime = performance.now();
        this.runTickLoop();
    }

    public stopTick(): void {
        this.tickEnabled = false;
    }

    private runTickLoop(): void {
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

    public pushInputMap(inputMap: InputMap): void {
        this.inputMapStack.push(inputMap);
    }

    public setInputMap(inputMap: InputMap): void {
        this.inputMapStack.set(inputMap);
    }

    public popInputMap(): void {
        this.inputMapStack.pop();
    }

    public hasInputMap(id: string): boolean {
        return this.inputMapStack.has(id);
    }

    public removeInputMap(id: string): void {
        this.inputMapStack.remove(id);
    }

    public currentInputMap(): string | null {
        return this.inputMapStack.getCurrentId();
    }

    // ==================== Custom Input API ====================

    public triggerCustomInput(input: string): void {
        this.customSource.triggerInput(input);
    }

    public triggerCustomAxesInput(name: string, axes: AxesInput | [number, number]): void {
        this.customSource.triggerAxesInput(name, axes);
    }

    public updateCustomAxesInput(name: string, axes: AxesInput | [number, number]): void {
        this.customSource.updateAxesInput(name, axes);
    }

    public releaseCustomAxesInput(name: string): void {
        this.customSource.releaseAxesInput(name);
    }

    // ==================== Cleanup ====================

    public destroy(): void {
        this.stopTick();
        this.disconnect$.next();
        this.disconnect$.complete();

        this.keyboardSource.destroy();
        this.gamepadSource.destroy();
        this.customSource.destroy();

        this.inputMapStack.clear();
    }
}