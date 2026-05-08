import type { AxesInput } from './axes-input.js';
export type SingleInputEvent = {
    type: 'trigger' | 'update' | 'release';
    key: string;
    source: 'keyboard' | 'gamepad' | 'custom';
};
export type AxesInputEvent = {
    type: 'trigger' | 'update' | 'release';
    name: string;
    axes: AxesInput;
    source: 'gamepad' | 'custom';
};
export type TickEvent = {
    type: 'tick';
    delta: number;
};
export type InputEvent = SingleInputEvent | AxesInputEvent | TickEvent;
/**
 * Identifies the type of input device currently being used.
 * Useful for displaying appropriate button prompts to the user.
 *
 * @example
 * ```typescript
 * import { InputDeviceType } from '@happy-pixels/input-forge';
 *
 * manager.activeInputDevice$.subscribe((device) => {
 *     if (device === InputDeviceType.Xbox) {
 *         showXboxPrompts();
 *     }
 * });
 * ```
 */
export declare enum InputDeviceType {
    /** Keyboard input detected */
    Keyboard = "keyboard",
    /** Xbox controller detected (includes Xbox 360, Xbox One, Xbox Series) */
    Xbox = "xbox",
    /** PlayStation controller detected (DualShock 3/4, DualSense) */
    PlayStation = "playstation",
    /** Other gamepad/controller detected */
    OtherController = "other_controller"
}
//# sourceMappingURL=input-events.d.ts.map