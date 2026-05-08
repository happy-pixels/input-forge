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
export var InputDeviceType;
(function (InputDeviceType) {
    /** Keyboard input detected */
    InputDeviceType["Keyboard"] = "keyboard";
    /** Xbox controller detected (includes Xbox 360, Xbox One, Xbox Series) */
    InputDeviceType["Xbox"] = "xbox";
    /** PlayStation controller detected (DualShock 3/4, DualSense) */
    InputDeviceType["PlayStation"] = "playstation";
    /** Other gamepad/controller detected */
    InputDeviceType["OtherController"] = "other_controller";
})(InputDeviceType || (InputDeviceType = {}));
//# sourceMappingURL=input-events.js.map