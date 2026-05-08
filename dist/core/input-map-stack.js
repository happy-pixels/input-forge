import { CommandResolver } from './command-resolver';
import { logger } from './logger';
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
export class InputMapStack {
    stack = [];
    resolver = new CommandResolver();
    singleInputCache = new Map();
    axesInputCache = new Map();
    keyboardAxesCache = new Map();
    tickCommandsCache = null;
    validateInputMap(inputMap, method) {
        const singleCount = inputMap.singleInput ? Object.keys(inputMap.singleInput).length : 0;
        const axesCount = inputMap.axesInput ? Object.keys(inputMap.axesInput).length : 0;
        if (singleCount === 0 && axesCount === 0) {
            logger.warn(`${method}: InputMap "${inputMap.id}" has no input entries defined`);
            return false;
        }
        return true;
    }
    /**
     * Pushes an input map onto the stack, making it the active map.
     * The previous map remains in the stack and will become active again when this map is popped.
     * @param inputMap - The input map to push onto the stack
     */
    push(inputMap) {
        this.validateInputMap(inputMap, 'push');
        this.stack.push(inputMap);
        this.invalidateCache();
        logger.log(`InputMap "${inputMap.id}" pushed to stack (depth: ${this.stack.length})`);
    }
    /**
     * Replaces all input maps with a single new map.
     * Use this when transitioning between major game states.
     * @param inputMap - The input map to set as the only map in the stack
     */
    set(inputMap) {
        this.validateInputMap(inputMap, 'set');
        this.stack = [inputMap];
        this.invalidateCache();
        logger.log(`InputMap "${inputMap.id}" set as active map`);
    }
    /**
     * Removes the top input map from the stack.
     * The next map in the stack becomes active. Does nothing if the stack is empty.
     */
    pop() {
        if (this.isEmpty()) {
            logger.warn('pop: Cannot pop from empty InputMapStack');
            return;
        }
        const popped = this.stack.pop();
        if (popped) {
            this.invalidateCache();
            logger.log(`InputMap "${popped.id}" popped from stack (depth: ${this.stack.length})`);
        }
    }
    /**
     * Checks if an input map with the given ID exists anywhere in the stack.
     * @param id - The input map ID to search for
     * @returns True if the map exists in the stack
     */
    has(id) {
        return this.stack.some((map) => map.id === id);
    }
    /**
     * Removes a specific input map from anywhere in the stack by ID.
     * @param id - The input map ID to remove
     */
    remove(id) {
        const initialLength = this.stack.length;
        this.stack = this.stack.filter((map) => map.id !== id);
        if (this.stack.length !== initialLength) {
            this.invalidateCache();
            logger.log(`InputMap "${id}" removed from stack (depth: ${this.stack.length})`);
        }
        else {
            logger.warn(`remove: InputMap "${id}" not found in stack`);
        }
    }
    /**
     * Gets the ID of the currently active input map.
     * @returns The active map's ID, or null if no map is set
     */
    getCurrentId() {
        const current = this.stack.at(-1);
        return current ? current.id : null;
    }
    /**
     * Gets the currently active input map.
     * @returns The active input map, or null if no map is set
     */
    getCurrent() {
        return this.stack.at(-1) || null;
    }
    /**
     * Checks if the stack is empty.
     * @returns True if no input maps are in the stack
     */
    isEmpty() {
        return this.stack.length === 0;
    }
    /**
     * Gets all commands mapped to a single input key.
     * @param key - The input key to look up
     * @returns Array of commands bound to this key
     * @internal
     */
    getCommandsForSingleInput(key) {
        return this.getOrResolve(key, this.singleInputCache, (map) => this.resolver.resolveSingleInput(map, key));
    }
    /**
     * Gets all axes commands mapped to an axes input name.
     * @param name - The axes input name (e.g., 'left_stick')
     * @returns Array of axes commands bound to this input
     * @internal
     */
    getCommandsForAxesInput(name) {
        return this.getOrResolve(name, this.axesInputCache, (map) => this.resolver.resolveAxesInput(map, name));
    }
    /**
     * Gets axes commands that are triggered by keyboard keys (WASD-style input).
     * @param key - The keyboard key to look up
     * @returns Array of commands with their associated axis values
     * @internal
     */
    getAxesCommandsForKey(key) {
        return this.getOrResolve(key, this.keyboardAxesCache, (map) => this.resolver.resolveKeyboardAxesInput(map, key));
    }
    /**
     * Gets all tick commands from the current input map.
     * @returns Array of tick commands that should receive tick events
     * @internal
     */
    getTickCommands() {
        if (this.isEmpty()) {
            return [];
        }
        if (this.tickCommandsCache !== null) {
            return this.tickCommandsCache;
        }
        const currentMap = this.getCurrent();
        this.tickCommandsCache = this.resolver.resolveTickCommands(currentMap);
        return this.tickCommandsCache;
    }
    getOrResolve(key, cache, resolver) {
        const currentMap = this.getCurrent();
        if (!currentMap) {
            return [];
        }
        const cached = cache.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const result = resolver(currentMap);
        cache.set(key, result);
        return result;
    }
    invalidateCache() {
        this.singleInputCache.clear();
        this.axesInputCache.clear();
        this.keyboardAxesCache.clear();
        this.tickCommandsCache = null;
    }
    /**
     * Clears all input maps from the stack.
     * After calling this, no inputs will be processed until a new map is set.
     */
    clear() {
        this.stack = [];
        this.invalidateCache();
    }
}
//# sourceMappingURL=input-map-stack.js.map