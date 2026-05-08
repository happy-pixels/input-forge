/**
 * Base class for all input commands. Extend this class to create custom commands
 * that respond to input events.
 *
 * ## Lifecycle
 * Commands have three lifecycle methods that are called based on input state:
 * - `trigger()` - Called once when the input becomes active (key pressed, button pressed)
 * - `update()` - Called every frame while the input remains active
 * - `release()` - Called once when the input becomes inactive (key released, button released)
 *
 * ## Example
 * ```typescript
 * class JumpCommand extends Command {
 *     constructor(private player: Player) {
 *         super();
 *     }
 *
 *     trigger(): void {
 *         this.player.jump();
 *     }
 *
 *     update(): void {
 *         // Called while jump key is held - extend jump height
 *         this.player.extendJump();
 *     }
 *
 *     release(): void {
 *         // Called when jump key is released
 *         this.player.endJump();
 *     }
 * }
 * ```
 *
 * @typeParam T - The type of value passed to trigger/update (default: void)
 */
export class Command {
    /**
     * Called once when the input becomes active.
     * Override this to handle the initial input event.
     * @param _value - Optional value associated with the input
     */
    trigger(_value) { }
    /**
     * Called every frame while the input remains active.
     * Override this to handle continuous input.
     * @param _value - Optional value associated with the input
     */
    update(_value) { }
    /**
     * Called once when the input becomes inactive.
     * Override this to handle cleanup or end states.
     */
    release() { }
}
/**
 * Command for handling analog/axes input such as joysticks or WASD movement.
 * Receives axis values representing direction and magnitude.
 *
 * ## Lifecycle
 * Same as Command, but receives axis values:
 * - `trigger(axes)` - Called when axes become active (moved from center)
 * - `update(axes)` - Called every frame with current axis values
 * - `release()` - Called when axes return to center/neutral
 *
 * ## Example
 * ```typescript
 * class MoveCommand extends AxesCommand {
 *     constructor(private player: Player) {
 *         super();
 *     }
 *
 *     trigger(axes: AxesInput): void {
 *         this.player.startMoving(axes.x, axes.y);
 *     }
 *
 *     update(axes: AxesInput): void {
 *         this.player.move(axes.x, axes.y);
 *     }
 *
 *     release(): void {
 *         this.player.stopMoving();
 *     }
 * }
 * ```
 */
export class AxesCommand extends Command {
    /**
     * Called when axes become active (move away from center).
     * @param _value - The axis values as `{x, y}` or `[x, y]`
     */
    trigger(_value) { }
    /**
     * Called every frame with current axis values.
     * @param _value - The axis values as `{x, y}` or `[x, y]`
     */
    update(_value) { }
}
/**
 * Command that receives tick events every frame, regardless of input state.
 * Use this for commands that need to run continuously, like physics or animations.
 *
 * ## Setup
 * To use TickCommand, you must:
 * 1. Add it to your input map with `systemInput: Inputs.SYSTEM_TICK`
 * 2. Call `inputManager.startTick()` to begin the tick loop
 *
 * ## Example
 * ```typescript
 * class PhysicsCommand extends TickCommand {
 *     constructor(private world: PhysicsWorld) {
 *         super();
 *     }
 *
 *     tick(delta: number): void {
 *         // delta is milliseconds since last frame
 *         this.world.step(delta / 1000);
 *     }
 * }
 *
 * // In your input map:
 * const inputMap = {
 *     id: 'gameplay',
 *     singleInput: {
 *         physics: { systemInput: Inputs.SYSTEM_TICK, command: new PhysicsCommand(world) }
 *     }
 * };
 *
 * // Start the tick loop:
 * inputManager.startTick();
 * ```
 */
export class TickCommand extends Command {
    /**
     * Called every frame when the tick loop is running.
     * @param _delta - Time in milliseconds since the last frame
     */
    tick(_delta) { }
}
//# sourceMappingURL=commands.js.map