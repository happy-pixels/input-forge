import type { InputMap } from '../types/input-map';
import { Command, AxesCommand, TickCommand } from '../types/commands';
import type { AxesInput } from '../types/axes-input';
/**
 * Manages a stack of input maps for context-based input handling.
 *
 * InputMapStack allows you to layer input contexts (e.g., gameplay, pause menu, dialog)
 * so that only the topmost map receives inputs. This is useful for temporarily overriding
 * controls without losing the underlying input configuration.
 *
 * ## Push vs Set
 *
 * **`set(inputMap)`** - Replaces the entire stack with a single map.
 * Use this when switching between major game states (e.g., main menu → gameplay).
 * ```typescript
 * // Player starts game - set gameplay controls
 * stack.set(gameplayMap);
 * ```
 *
 * **`push(inputMap)`** - Adds a map on top of the stack.
 * Use this for temporary overlays (e.g., pause menu, inventory, dialog).
 * ```typescript
 * // Player opens pause menu - push on top of gameplay
 * stack.push(pauseMenuMap);
 * // Player closes pause menu - pop to return to gameplay
 * stack.pop();
 * ```
 *
 * ## Example Flow
 * ```typescript
 * stack.set(mainMenuMap);     // Stack: [mainMenu]
 * stack.set(gameplayMap);     // Stack: [gameplay]      - replaced
 * stack.push(pauseMenuMap);   // Stack: [gameplay, pause]
 * stack.push(optionsMap);     // Stack: [gameplay, pause, options]
 * stack.pop();                // Stack: [gameplay, pause]
 * stack.pop();                // Stack: [gameplay]
 * ```
 *
 * @internal This class is used internally by InputManager.
 */
export declare class InputMapStack {
    private stack;
    private resolver;
    private singleInputCache;
    private axesInputCache;
    private keyboardAxesCache;
    private tickCommandsCache;
    private validateInputMap;
    /**
     * Pushes an input map onto the stack, making it the active map.
     * The previous map remains in the stack and will become active again when this map is popped.
     * @param inputMap - The input map to push onto the stack
     */
    push(inputMap: InputMap): void;
    /**
     * Replaces all input maps with a single new map.
     * Use this when transitioning between major game states.
     * @param inputMap - The input map to set as the only map in the stack
     */
    set(inputMap: InputMap): void;
    /**
     * Removes the top input map from the stack.
     * The next map in the stack becomes active. Does nothing if the stack is empty.
     */
    pop(): void;
    /**
     * Checks if an input map with the given ID exists anywhere in the stack.
     * @param id - The input map ID to search for
     * @returns True if the map exists in the stack
     */
    has(id: string): boolean;
    /**
     * Removes a specific input map from anywhere in the stack by ID.
     * @param id - The input map ID to remove
     */
    remove(id: string): void;
    /**
     * Gets the ID of the currently active input map.
     * @returns The active map's ID, or null if no map is set
     */
    getCurrentId(): string | null;
    /**
     * Gets the currently active input map.
     * @returns The active input map, or null if no map is set
     */
    getCurrent(): InputMap | null;
    /**
     * Checks if the stack is empty.
     * @returns True if no input maps are in the stack
     */
    isEmpty(): boolean;
    /**
     * Gets all commands mapped to a single input key.
     * @param key - The input key to look up
     * @returns Array of commands bound to this key
     * @internal
     */
    getCommandsForSingleInput(key: string): Command[];
    /**
     * Gets all axes commands mapped to an axes input name.
     * @param name - The axes input name (e.g., 'left_stick')
     * @returns Array of axes commands bound to this input
     * @internal
     */
    getCommandsForAxesInput(name: string): AxesCommand[];
    /**
     * Gets axes commands that are triggered by keyboard keys (WASD-style input).
     * @param key - The keyboard key to look up
     * @returns Array of commands with their associated axis values
     * @internal
     */
    getAxesCommandsForKey(key: string): Array<{
        command: AxesCommand;
        axis: AxesInput;
    }>;
    /**
     * Gets all tick commands from the current input map.
     * @returns Array of tick commands that should receive tick events
     * @internal
     */
    getTickCommands(): TickCommand[];
    private getOrResolve;
    private invalidateCache;
    /**
     * Clears all input maps from the stack.
     * After calling this, no inputs will be processed until a new map is set.
     */
    clear(): void;
}
//# sourceMappingURL=input-map-stack.d.ts.map