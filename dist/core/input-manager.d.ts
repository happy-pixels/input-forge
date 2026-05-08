import { Observable } from 'rxjs';
import type { InputMap } from '../types/input-map';
import type { AxesInput } from '../types/axes-input';
import type { Command } from '../types/commands';
import { InputDeviceType } from '../types/input-events';
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
export declare class InputManager {
    private disconnect$;
    private inputMapStack;
    private keyboardSource;
    private gamepadSource;
    private customSource;
    private tickEnabled;
    private lastTickTime;
    private activeCommands;
    private axesThrottleMs;
    private _activeInputDevice$;
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
    activeInputDevice$: Observable<InputDeviceType | null>;
    /**
     * Creates a new InputManager instance.
     * @param gamepadFps - Polling rate for gamepad inputs (default: 60, range: 1-120)
     * @param gamepadDeadZone - Dead zone threshold for gamepad sticks (default: 0.1, range: 0-1)
     * @param axesThrottleMs - Optional throttle for axis update events in milliseconds. When set,
     *                         axis 'update' events will be throttled to reduce processing overhead.
     *                         Trigger and release events are never throttled. (default: undefined/no throttle)
     */
    constructor(gamepadFps?: number, gamepadDeadZone?: number, axesThrottleMs?: number);
    private setupEventHandlers;
    private executeCommand;
    private executeAxesCommand;
    /**
     * Starts the tick loop for continuous updates.
     * Required for:
     * - `update()` events on held inputs
     * - `TickCommand.tick()` calls
     *
     * Call `stopTick()` or `destroy()` to stop the loop.
     */
    startTick(): void;
    /**
     * Stops the tick loop. Commands will no longer receive update or tick events.
     */
    stopTick(): void;
    private runTickLoop;
    /**
     * Pushes an input map onto the stack, making it the active map.
     * The previous map remains in the stack and will become active again when this map is popped.
     * Use this for temporary contexts like pause menus or dialog boxes.
     * @param inputMap - The input map to push
     */
    pushInputMap(inputMap: InputMap): void;
    /**
     * Replaces all input maps with a single new map.
     * Use this to set the primary input map or switch between major game states.
     * @param inputMap - The input map to set
     */
    setInputMap(inputMap: InputMap): void;
    /**
     * Removes the top input map from the stack.
     * The next map in the stack becomes active. Does nothing if the stack is empty.
     */
    popInputMap(): void;
    /**
     * Checks if an input map with the given ID exists anywhere in the stack.
     * @param id - The input map ID to search for
     * @returns True if the map exists in the stack
     */
    hasInputMap(id: string): boolean;
    /**
     * Removes a specific input map from anywhere in the stack by ID.
     * @param id - The input map ID to remove
     */
    removeInputMap(id: string): void;
    /**
     * Gets the ID of the currently active input map.
     * @returns The active map's ID, or null if no map is set
     */
    currentInputMap(): string | null;
    /**
     * Triggers a custom single input. Use this for virtual buttons, touch controls, etc.
     * The input key must match a `customInput` field in your input map.
     * @param input - The custom input key to trigger
     */
    triggerCustomInput(input: string): void;
    /**
     * Triggers a custom axes input. Use this for virtual joysticks, touch controls, etc.
     * The name must match a `customAxesInput` field in your input map.
     * @param name - The custom axes input name
     * @param axes - The axis values as `{x, y}` or `[x, y]`
     */
    triggerCustomAxesInput(name: string, axes: AxesInput | [number, number]): void;
    /**
     * Updates a custom axes input with new values.
     * @param name - The custom axes input name
     * @param axes - The new axis values as `{x, y}` or `[x, y]`
     */
    updateCustomAxesInput(name: string, axes: AxesInput | [number, number]): void;
    /**
     * Releases a custom axes input (sets axes to neutral/center).
     * @param name - The custom axes input name to release
     */
    releaseCustomAxesInput(name: string): void;
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
    isInputActive(key: string): boolean;
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
    getActiveCommands(): Command[];
    /**
     * Gets the current active input device type.
     * @returns The current input device type, or null if no input has been detected yet
     */
    getActiveInputDevice(): InputDeviceType | null;
    /**
     * Destroys the InputManager and releases all resources.
     * Call this when you're done with the manager (e.g., when leaving a scene).
     * After calling destroy, the manager should not be used again.
     */
    destroy(): void;
}
//# sourceMappingURL=input-manager.d.ts.map