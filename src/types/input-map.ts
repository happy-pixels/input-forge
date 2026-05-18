import type { Command, AxesCommand } from './commands';

/**
 * Helper type that requires at least one property from a set of optional properties.
 * @internal
 */
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>> &
    { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

/**
 * Base type for single input entry (all inputs optional).
 * @internal
 */
type SingleInputEntryBase = {
    keyboardInput?: string;
    controllerInput?: string;
    systemInput?: string;
    customInput?: string;
    command: Command;
};

/**
 * Defines a single input binding that maps one or more input sources to a command.
 *
 * At least one input type must be defined. You can specify multiple input types
 * to allow different input devices to trigger the same command.
 *
 * ## Input Types
 * - `keyboardInput` - Keyboard key (use `Inputs.KEYBOARD_*` constants)
 * - `controllerInput` - Gamepad button (use `Inputs.CONTROLLER_*` constants)
 * - `systemInput` - System events like `Inputs.SYSTEM_TICK`
 * - `customInput` - Custom input key for programmatic triggers
 *
 * ## Example
 * ```typescript
 * const jump: SingleInputEntry = {
 *     keyboardInput: Inputs.KEYBOARD_SPACE,
 *     controllerInput: Inputs.CONTROLLER_FACE_BOTTOM,
 *     command: new JumpCommand()
 * };
 * ```
 */
export type SingleInputEntry = RequireAtLeastOne<
    SingleInputEntryBase,
    'keyboardInput' | 'controllerInput' | 'systemInput' | 'customInput'
>;

/**
 * Configuration for mapping keyboard keys to axes input.
 * Defines four directional keys that map to X/Y axis values.
 *
 * ## Example
 * ```typescript
 * const wasdConfig: KeyboardAxesConfig = {
 *     vertical: { up: Inputs.KEYBOARD_W, down: Inputs.KEYBOARD_S },
 *     horizontal: { left: Inputs.KEYBOARD_A, right: Inputs.KEYBOARD_D }
 * };
 *
 * // Arrow keys example:
 * const arrowConfig: KeyboardAxesConfig = {
 *     vertical: { up: Inputs.KEYBOARD_UP, down: Inputs.KEYBOARD_DOWN },
 *     horizontal: { left: Inputs.KEYBOARD_LEFT, right: Inputs.KEYBOARD_RIGHT }
 * };
 * ```
 */
export type KeyboardAxesConfig = {
    /** Vertical axis keys */
    vertical: {
        /** Key that maps to Y = -1 */
        up: string;
        /** Key that maps to Y = +1 */
        down: string;
    };
    /** Horizontal axis keys */
    horizontal: {
        /** Key that maps to X = -1 */
        left: string;
        /** Key that maps to X = +1 */
        right: string;
    };
};

/**
 * Base type for axes input entry (all inputs optional).
 * @internal
 */
type AxesInputEntryBase = {
    keyboardAxes?: KeyboardAxesConfig;
    controllerStick?: string;
    customAxesInput?: string;
    command: AxesCommand;
};

/**
 * Defines an axes input binding that maps analog inputs to an AxesCommand.
 *
 * At least one input type must be defined. Use this for movement, camera control,
 * or any input that needs X/Y axis values.
 *
 * ## Input Types
 * - `keyboardAxes` - Maps 4 keyboard keys to axis values (WASD, arrow keys, etc.)
 * - `controllerStick` - Gamepad analog stick (use `Inputs.CONTROLLER_LEFT_STICK` or `RIGHT_STICK`)
 * - `customAxesInput` - Custom axes input for virtual joysticks
 *
 * ## Example
 * ```typescript
 * const movement: AxesInputEntry = {
 *     keyboardAxes: {
 *         vertical: { up: Inputs.KEYBOARD_W, down: Inputs.KEYBOARD_S },
 *         horizontal: { left: Inputs.KEYBOARD_A, right: Inputs.KEYBOARD_D }
 *     },
 *     controllerStick: Inputs.CONTROLLER_LEFT_STICK,
 *     command: new MoveCommand()
 * };
 * ```
 */
export type AxesInputEntry = RequireAtLeastOne<
    AxesInputEntryBase,
    'keyboardAxes' | 'controllerStick' | 'customAxesInput'
>;

/**
 * A collection of single input entries, keyed by a descriptive name.
 *
 * ## Example
 * ```typescript
 * const singleInputs: SingleInputMap = {
 *     jump: { keyboardInput: Inputs.KEYBOARD_SPACE, command: jumpCmd },
 *     attack: { keyboardInput: Inputs.KEYBOARD_J, controllerInput: Inputs.CONTROLLER_FACE_RIGHT, command: attackCmd },
 *     pause: { keyboardInput: Inputs.KEYBOARD_ESCAPE, controllerInput: Inputs.CONTROLLER_START, command: pauseCmd }
 * };
 * ```
 */
export type SingleInputMap = {
    [key: string]: SingleInputEntry;
};

/**
 * A collection of axes input entries, keyed by a descriptive name.
 *
 * ## Example
 * ```typescript
 * const axesInputs: AxesInputMap = {
 *     move: { controllerStick: Inputs.CONTROLLER_LEFT_STICK, command: moveCmd },
 *     look: { controllerStick: Inputs.CONTROLLER_RIGHT_STICK, command: lookCmd }
 * };
 * ```
 */
export type AxesInputMap = {
    [key: string]: AxesInputEntry;
};

/**
 * Complete input map configuration.
 *
 * An InputMap defines all the input bindings for a particular game context
 * (e.g., gameplay, menu, cutscene). It must have a unique `id` and at least
 * one of `singleInput` or `axesInput` defined.
 *
 * ## Example
 * ```typescript
 * import { InputMap, Inputs, Command, AxesCommand } from '@happy-pixels/input-forge';
 *
 * class JumpCommand extends Command {
 *     trigger() { player.jump(); }
 * }
 *
 * class MoveCommand extends AxesCommand {
 *     update(axes: AxesInput) { player.move(axes.x, axes.y); }
 * }
 *
 * const gameplayMap: InputMap = {
 *     id: 'gameplay',
 *     singleInput: {
 *         jump: {
 *             keyboardInput: Inputs.KEYBOARD_SPACE,
 *             controllerInput: Inputs.CONTROLLER_FACE_BOTTOM,
 *             command: new JumpCommand()
 *         },
 *         attack: {
 *             keyboardInput: Inputs.KEYBOARD_J,
 *             controllerInput: Inputs.CONTROLLER_FACE_RIGHT,
 *             command: new AttackCommand()
 *         }
 *     },
 *     axesInput: {
 *         move: {
 *             keyboardAxes: {
 *                 vertical: { up: Inputs.KEYBOARD_W, down: Inputs.KEYBOARD_S },
 *                 horizontal: { left: Inputs.KEYBOARD_A, right: Inputs.KEYBOARD_D }
 *             },
 *             controllerStick: Inputs.CONTROLLER_LEFT_STICK,
 *             command: new MoveCommand()
 *         }
 *     }
 * };
 * ```
 */
export type InputMap =
    | { id: string; singleInput: SingleInputMap; axesInput?: AxesInputMap }
    | { id: string; singleInput?: SingleInputMap; axesInput: AxesInputMap }
    | { id: string; singleInput: SingleInputMap; axesInput: AxesInputMap };
