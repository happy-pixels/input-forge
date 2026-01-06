

// ==================== Core API ====================
export { InputManager } from './core/input-manager';

// ==================== Types ====================
export { Command, AxesCommand, TickCommand } from './types/commands';
export type { AxesInput } from './types/axes-input';
export type {
    InputMap,
    SingleInputEntry,
    AxesInputEntry,
    KeyboardAxesConfig,
    SingleInputMap,
    AxesInputMap,
} from './types/input-map';

// ==================== Constants ====================
export { Inputs } from './constants/inputs';

// ==================== Utilities ====================
export { symbolToConstant, normalizeAxesInput } from './utils';

/**
 * Claude recommended the following exports. Including them but commented out
 * for the time being. Will revisit this later to see if it's something I want to include.
 */

// ==================== Advanced (Optional) ====================
// Export sources for advanced users who want direct access
// export { InputSourceBase } from './sources/input-source-base';
// export { KeyboardSource } from './sources/keyboard-source';
// export { GamepadSource } from './sources/gamepad-source';
// export { CustomSource } from './sources/custom-source';

// Export core components for advanced composition
// export { CommandResolver } from './core/command-resolver';
// export { InputMapStack } from './core/input-map-stack';

// Export event types for advanced event handling
// export type {
//     InputEvent,
//     SingleInputEvent,
//     AxesInputEvent,
//     TickEvent,
// } from './types/input-events';

// export type {
//     InputSourceState,
//     SingleInputState,
//     AxesInputState,
//     AxesStateMap,
// } from './types/input-state';