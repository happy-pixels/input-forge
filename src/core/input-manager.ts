import { Subject, merge, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, filter, throttleTime, distinctUntilChanged } from 'rxjs/operators';
import type { InputMap } from '../types/input-map';
import type { AxesInput } from '../types/axes-input';
import type { Command, AxesCommand } from '../types/commands';
import { InputDeviceType } from '../types/input-events';
import { InputMapStack } from './input-map-stack';
import { KeyboardSource } from '../sources/keyboard-source';
import { GamepadSource } from '../sources/gamepad-source';
import { CustomSource } from '../sources/custom-source';

type EventType = 'trigger' | 'update' | 'release';

/**
 * Central manager for handling all input sources and routing inputs to commands.
 *
 * InputManager automatically listens to keyboard and gamepad inputs, maps them to
 * commands defined in your input maps, and calls the appropriate command lifecycle
 * methods (trigger, update, release).
 *
 * ## Quick Start
 * ```typescript
 * import { InputManager, Command, Inputs } from '@happy-pixels/input-forge';
 *
 * // 1. Create your commands
 * class JumpCommand extends Command {
 *     trigger() { console.log('Jump!'); }
 * }
 *
 * // 2. Define an input map
 * const inputMap = {
 *     id: 'gameplay',
 *     singleInput: {
 *         jump: {
 *             keyboardInput: Inputs.KEYBOARD_SPACE,
 *             controllerInput: Inputs.CONTROLLER_FACE_BOTTOM,
 *             command: new JumpCommand()
 *         }
 *     }
 * };
 *
 * // 3. Create the manager and set the input map
 * const manager = new InputManager();
 * manager.setInputMap(inputMap);
 *
 * // 4. Start the tick loop (required for update events and TickCommands)
 * manager.startTick();
 *
 * // 5. Clean up when done
 * manager.destroy();
 * ```
 *
 * ## Input Map Stacking
 * InputManager supports stacking input maps for context switching (e.g., gameplay vs menu):
 * ```typescript
 * manager.setInputMap(gameplayMap);  // Base map
 * manager.pushInputMap(pauseMenuMap); // Overlay - now active
 * manager.popInputMap();              // Back to gameplay
 * ```
 *
 * ## Custom Inputs
 * Trigger inputs programmatically (e.g., from touch controls):
 * ```typescript
 * manager.triggerCustomInput('my_action');
 * manager.triggerCustomAxesInput('virtual_stick', { x: 0.5, y: -0.5 });
 * ```
 */
export class InputManager {
    private disconnect$ = new Subject<void>();
    private inputMapStack: InputMapStack;

    private keyboardSource: KeyboardSource;
    private gamepadSource: GamepadSource;
    private customSource: CustomSource;

    private tickEnabled = false;
    private lastTickTime = 0;
    private activeCommands: Set<Command<unknown>> = new Set();
    private axesThrottleMs: number | undefined;
    private _activeInputDevice$ = new BehaviorSubject<InputDeviceType | null>(null);

    /**
     * Observable that emits when the active input device changes.
     * Useful for switching button prompts between keyboard and controller styles.
     *
     * Emits:
     * - `'keyboard'` - When keyboard input is detected
     * - `'xbox'` - When an Xbox controller is used
     * - `'playstation'` - When a PlayStation controller is used
     * - `'other_controller'` - When another gamepad is used
     * - `null` - Initial state before any input
     *
     * @example
     * ```typescript
     * manager.activeInputDevice$.subscribe((device) => {
     *     if (device === 'keyboard') {
     *         showKeyboardPrompts();
     *     } else if (device === 'xbox') {
     *         showXboxPrompts();
     *     } else if (device === 'playstation') {
     *         showPlayStationPrompts();
     *     }
     * });
     * ```
     */
    public activeInputDevice$: Observable<InputDeviceType | null> = this._activeInputDevice$.pipe(
        distinctUntilChanged()
    );

    /**
     * Creates a new InputManager instance.
     * @param gamepadFps - Polling rate for gamepad inputs (default: 60, range: 1-120)
     * @param gamepadDeadZone - Dead zone threshold for gamepad sticks (default: 0.1, range: 0-1)
     * @param axesThrottleMs - Optional throttle for axis update events in milliseconds. When set,
     *                         axis 'update' events will be throttled to reduce processing overhead.
     *                         Trigger and release events are never throttled. (default: undefined/no throttle)
     */
    constructor(gamepadFps: number = 60, gamepadDeadZone: number = 0.1, axesThrottleMs?: number) {
        this.axesThrottleMs = axesThrottleMs;
        this.inputMapStack = new InputMapStack();
        this.keyboardSource = new KeyboardSource();
        this.gamepadSource = new GamepadSource(gamepadFps, gamepadDeadZone);
        this.customSource = new CustomSource();

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // Track keyboard as active input device
        this.keyboardSource.singleInputEvent$
            .pipe(
                takeUntil(this.disconnect$),
                filter((event) => event.type === 'trigger')
            )
            .subscribe(() => {
                this._activeInputDevice$.next(InputDeviceType.Keyboard);
            });

        // Track gamepad as active input device (buttons)
        this.gamepadSource.singleInputEvent$
            .pipe(
                takeUntil(this.disconnect$),
                filter((event) => event.type === 'trigger')
            )
            .subscribe(() => {
                const controllerType = this.gamepadSource.getControllerType();
                if (controllerType) {
                    this._activeInputDevice$.next(controllerType);
                }
            });

        // Track gamepad as active input device (axes/sticks)
        this.gamepadSource.axesInputEvent$
            .pipe(
                takeUntil(this.disconnect$),
                filter((event) => event.type === 'trigger')
            )
            .subscribe(() => {
                const controllerType = this.gamepadSource.getControllerType();
                if (controllerType) {
                    this._activeInputDevice$.next(controllerType);
                }
            });

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
                    this.executeCommand(command, event.type);
                });

                axesCommands.forEach(({ command, axis }) => {
                    this.executeAxesCommand(command, event.type, axis);
                });
            });

        const axesEvents$ = merge(
            this.gamepadSource.axesInputEvent$,
            this.customSource.axesInputEvent$
        );

        // Trigger and release events always pass through immediately
        axesEvents$
            .pipe(
                takeUntil(this.disconnect$),
                filter((event) => event.type !== 'update')
            )
            .subscribe((event) => {
                if (this.inputMapStack.isEmpty()) {
                    return;
                }

                const commands = this.inputMapStack.getCommandsForAxesInput(event.name);
                commands.forEach((command) => {
                    this.executeAxesCommand(command, event.type, event.axes);
                });
            });

        // Update events can be optionally throttled
        let updateEvents$ = axesEvents$.pipe(
            filter((event) => event.type === 'update')
        );

        if (this.axesThrottleMs !== undefined && this.axesThrottleMs > 0) {
            updateEvents$ = updateEvents$.pipe(
                throttleTime(this.axesThrottleMs, undefined, { leading: true, trailing: true })
            );
        }

        updateEvents$
            .pipe(takeUntil(this.disconnect$))
            .subscribe((event) => {
                if (this.inputMapStack.isEmpty()) {
                    return;
                }

                const commands = this.inputMapStack.getCommandsForAxesInput(event.name);
                commands.forEach((command) => {
                    this.executeAxesCommand(command, event.type, event.axes);
                });
            });
    }

    private executeCommand(command: Command, eventType: EventType): void {
        switch (eventType) {
            case 'trigger':
                command.trigger();
                this.activeCommands.add(command);
                break;
            case 'update':
                command.update();
                break;
            case 'release':
                command.release();
                this.activeCommands.delete(command);
                break;
        }
    }

    private executeAxesCommand(command: AxesCommand, eventType: EventType, axes: AxesInput): void {
        switch (eventType) {
            case 'trigger':
                command.trigger(axes);
                this.activeCommands.add(command);
                break;
            case 'update':
                command.update(axes);
                break;
            case 'release':
                command.release();
                this.activeCommands.delete(command);
                break;
        }
    }

    /**
     * Starts the tick loop for continuous updates.
     * Required for:
     * - `update()` events on held inputs
     * - `TickCommand.tick()` calls
     *
     * Call `stopTick()` or `destroy()` to stop the loop.
     */
    public startTick(): void {
        if (this.tickEnabled) {
            return;
        }

        this.tickEnabled = true;
        this.lastTickTime = performance.now();
        this.runTickLoop();
    }

    /**
     * Stops the tick loop. Commands will no longer receive update or tick events.
     */
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

    /**
     * Pushes an input map onto the stack, making it the active map.
     * The previous map remains in the stack and will become active again when this map is popped.
     * Use this for temporary contexts like pause menus or dialog boxes.
     * @param inputMap - The input map to push
     */
    public pushInputMap(inputMap: InputMap): void {
        this.inputMapStack.push(inputMap);
    }

    /**
     * Replaces all input maps with a single new map.
     * Use this to set the primary input map or switch between major game states.
     * @param inputMap - The input map to set
     */
    public setInputMap(inputMap: InputMap): void {
        this.inputMapStack.set(inputMap);
    }

    /**
     * Removes the top input map from the stack.
     * The next map in the stack becomes active. Does nothing if the stack is empty.
     */
    public popInputMap(): void {
        this.inputMapStack.pop();
    }

    /**
     * Checks if an input map with the given ID exists anywhere in the stack.
     * @param id - The input map ID to search for
     * @returns True if the map exists in the stack
     */
    public hasInputMap(id: string): boolean {
        return this.inputMapStack.has(id);
    }

    /**
     * Removes a specific input map from anywhere in the stack by ID.
     * @param id - The input map ID to remove
     */
    public removeInputMap(id: string): void {
        this.inputMapStack.remove(id);
    }

    /**
     * Gets the ID of the currently active input map.
     * @returns The active map's ID, or null if no map is set
     */
    public currentInputMap(): string | null {
        return this.inputMapStack.getCurrentId();
    }

    // ==================== Custom Input API ====================

    /**
     * Triggers a custom single input. Use this for virtual buttons, touch controls, etc.
     * The input key must match a `customInput` field in your input map.
     * @param input - The custom input key to trigger
     */
    public triggerCustomInput(input: string): void {
        this.customSource.triggerInput(input);
    }

    /**
     * Triggers a custom axes input. Use this for virtual joysticks, touch controls, etc.
     * The name must match a `customAxesInput` field in your input map.
     * @param name - The custom axes input name
     * @param axes - The axis values as `{x, y}` or `[x, y]`
     */
    public triggerCustomAxesInput(name: string, axes: AxesInput | [number, number]): void {
        this.customSource.triggerAxesInput(name, axes);
    }

    /**
     * Updates a custom axes input with new values.
     * @param name - The custom axes input name
     * @param axes - The new axis values as `{x, y}` or `[x, y]`
     */
    public updateCustomAxesInput(name: string, axes: AxesInput | [number, number]): void {
        this.customSource.updateAxesInput(name, axes);
    }

    /**
     * Releases a custom axes input (sets axes to neutral/center).
     * @param name - The custom axes input name to release
     */
    public releaseCustomAxesInput(name: string): void {
        this.customSource.releaseAxesInput(name);
    }

    // ==================== State Queries ====================

    /**
     * Checks if a specific input key is currently active (pressed/held).
     * Checks across all input sources (keyboard, gamepad).
     * @param key - The input key to check (e.g., `Inputs.KEYBOARD_SPACE`, `Inputs.CONTROLLER_FACE_BOTTOM`)
     * @returns True if the input is currently active
     *
     * @example
     * ```typescript
     * if (manager.isInputActive(Inputs.KEYBOARD_SHIFT)) {
     *     // Shift is being held
     * }
     * ```
     */
    public isInputActive(key: string): boolean {
        const keyboardState = this.keyboardSource.getState();
        if (keyboardState.singleInputs.activeInputs.has(key)) {
            return true;
        }

        const gamepadState = this.gamepadSource.getState();
        if (gamepadState.singleInputs.activeInputs.has(key)) {
            return true;
        }

        return false;
    }

    /**
     * Gets all currently active commands (triggered but not yet released).
     * Useful for debugging or displaying active input state.
     * @returns Array of currently active Command instances
     *
     * @example
     * ```typescript
     * const active = manager.getActiveCommands();
     * console.log(`Active commands: ${active.length}`);
     * ```
     */
    public getActiveCommands(): Command[] {
        return Array.from(this.activeCommands);
    }

    /**
     * Gets the current active input device type.
     * @returns The current input device type, or null if no input has been detected yet
     */
    public getActiveInputDevice(): InputDeviceType | null {
        return this._activeInputDevice$.getValue();
    }

    // ==================== Cleanup ====================

    /**
     * Destroys the InputManager and releases all resources.
     * Call this when you're done with the manager (e.g., when leaving a scene).
     * After calling destroy, the manager should not be used again.
     */
    public destroy(): void {
        this.stopTick();
        this.disconnect$.next();
        this.disconnect$.complete();

        this.keyboardSource.destroy();
        this.gamepadSource.destroy();
        this.customSource.destroy();

        this.inputMapStack.clear();
        this.activeCommands.clear();
    }
}