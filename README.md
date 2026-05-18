# Input Forge

Input Forge is a platform-agnostic input management library designed to seamlessly normalize inputs from keyboards and game controllers. For games built with Phaser, Three.js, or other frameworks, Input Forge simplifies input handling by supporting multiple input sources, customizable controls, and a unified API for event-driven and polled inputs.

---

## Installation

```bash
npm install @happy-pixels/input-forge
```

---

## Quick Start

```typescript
import { InputManager, Command, Inputs } from '@happy-pixels/input-forge';

// 1. Create a command
class JumpCommand extends Command {
    trigger(): void {
        console.log('Jump!');
    }
}

// 2. Define an input map
const gameplayMap = {
    id: 'gameplay',
    singleInput: {
        jump: {
            keyboardInput: Inputs.KEYBOARD_SPACE,
            controllerInput: Inputs.CONTROLLER_FACE_BOTTOM,
            command: new JumpCommand()
        }
    }
};

// 3. Create the manager and set the input map
const manager = new InputManager();
manager.setInputMap(gameplayMap);

// 4. Start the tick loop (for update events and TickCommands)
manager.startTick();

// 5. Clean up when done
// manager.destroy();
```

---

## Core Concepts

### Commands

Commands define what happens when an input is triggered. There are three command types:

#### Command (Single Input)
For button-like inputs (keyboard keys, controller buttons).

```typescript
class JumpCommand extends Command {
    trigger(): void {
        // Called once when key/button is pressed
        this.player.jump();
    }

    update(): void {
        // Called every frame while held
        this.player.extendJump();
    }

    release(): void {
        // Called once when key/button is released
        this.player.endJump();
    }
}
```

#### AxesCommand (Analog Input)
For analog inputs like joysticks or WASD movement.

```typescript
class MoveCommand extends AxesCommand {
    trigger(axes: AxesInput): void {
        // Called when stick moves away from center
        this.player.startMoving(axes.x, axes.y);
    }

    update(axes: AxesInput): void {
        // Called every frame with current axis values
        this.player.move(axes.x, axes.y);
    }

    release(): void {
        // Called when stick returns to center
        this.player.stopMoving();
    }
}
```

#### TickCommand (Continuous)
For commands that run every frame, regardless of input.

```typescript
class PhysicsCommand extends TickCommand {
    tick(delta: number): void {
        // delta is milliseconds since last frame
        this.world.step(delta / 1000);
    }
}

// Must use systemInput: Inputs.SYSTEM_TICK
const inputMap = {
    id: 'gameplay',
    singleInput: {
        physics: { systemInput: Inputs.SYSTEM_TICK, command: new PhysicsCommand() }
    }
};
```

### Input Maps

Input maps define the relationship between inputs and commands.

```typescript
import { Inputs, type InputMap } from '@happy-pixels/input-forge';

const gameplayMap: InputMap = {
    id: 'gameplay',

    // Button/key inputs
    singleInput: {
        jump: {
            keyboardInput: Inputs.KEYBOARD_SPACE,
            controllerInput: Inputs.CONTROLLER_FACE_BOTTOM,
            command: new JumpCommand()
        },
        attack: {
            keyboardInput: Inputs.KEYBOARD_J,
            controllerInput: Inputs.CONTROLLER_FACE_RIGHT,
            command: new AttackCommand()
        }
    },

    // Analog/axes inputs
    axesInput: {
        move: {
            keyboardAxes: {
                vertical: { up: Inputs.KEYBOARD_W, down: Inputs.KEYBOARD_S },
                horizontal: { left: Inputs.KEYBOARD_A, right: Inputs.KEYBOARD_D }
            },
            controllerStick: Inputs.CONTROLLER_LEFT_STICK,
            command: new MoveCommand()
        }
    }
};
```

### Input Map Stacking

Use stacking for context switching (gameplay → pause menu → options).

```typescript
// Set the base gameplay map
manager.setInputMap(gameplayMap);

// Player opens pause menu - push on top
manager.pushInputMap(pauseMenuMap);

// Player opens options from pause menu
manager.pushInputMap(optionsMap);

// Player closes options - returns to pause menu
manager.popInputMap();

// Player closes pause menu - returns to gameplay
manager.popInputMap();
```

**When to use `set` vs `push`:**
- `setInputMap()` - Replaces all maps. Use for major state changes (menu → gameplay).
- `pushInputMap()` - Adds a map on top. Use for overlays (pause menu, dialog).
- `popInputMap()` - Removes the top map. Use to close overlays.

### Custom Inputs

Trigger inputs programmatically for touch controls or virtual buttons.

```typescript
// Single input (button press)
manager.triggerCustomInput('my_action');

// Axes input (virtual joystick)
manager.triggerCustomAxesInput('virtual_stick', { x: 0.5, y: -0.5 });
manager.updateCustomAxesInput('virtual_stick', { x: 1, y: 0 });
manager.releaseCustomAxesInput('virtual_stick');
```

In your input map:
```typescript
const inputMap = {
    id: 'gameplay',
    singleInput: {
        action: { customInput: 'my_action', command: new ActionCommand() }
    },
    axesInput: {
        move: { customAxesInput: 'virtual_stick', command: new MoveCommand() }
    }
};
```

---

## API Reference

### InputManager

| Method | Description |
|--------|-------------|
| `setInputMap(map)` | Replace all input maps with a new one |
| `pushInputMap(map)` | Add an input map on top of the stack |
| `popInputMap()` | Remove the top input map |
| `hasInputMap(id)` | Check if a map exists in the stack |
| `removeInputMap(id)` | Remove a specific map by ID |
| `currentInputMap()` | Get the active map's ID |
| `startTick()` | Start the tick loop |
| `stopTick()` | Stop the tick loop |
| `triggerCustomInput(key)` | Trigger a custom single input |
| `triggerCustomAxesInput(name, axes)` | Trigger a custom axes input |
| `updateCustomAxesInput(name, axes)` | Update a custom axes input |
| `releaseCustomAxesInput(name)` | Release a custom axes input |
| `destroy()` | Clean up all resources |

### Input Constants

```typescript
import { Inputs } from '@happy-pixels/input-forge';

// Keyboard
Inputs.KEYBOARD_SPACE    // ' '
Inputs.KEYBOARD_ENTER    // 'Enter'
Inputs.KEYBOARD_ESCAPE   // 'Escape'
Inputs.KEYBOARD_W        // 'w'
// ... and more

// Controller
Inputs.CONTROLLER_FACE_BOTTOM   // A button (Xbox) / X (PlayStation)
Inputs.CONTROLLER_FACE_RIGHT    // B button (Xbox) / Circle (PlayStation)
Inputs.CONTROLLER_LEFT_STICK    // Left analog stick
Inputs.CONTROLLER_RIGHT_STICK   // Right analog stick
// ... and more

// System
Inputs.SYSTEM_TICK  // For TickCommand
```

---

## Features

Input Forge aims to provide a flexible and robust input management solution with the following capabilities:

- **Platform-Agnostic**: Integrates seamlessly with any JavaScript-based platform, such as Phaser or Three.js.
- **Multi-Input Support**: Handles multiple input sources (e.g., keyboard and gamepad) for a single action.
- **Normalized Inputs**: Unifies event-driven keyboard inputs and polled gamepad inputs into a consistent API.
- **Customizable Controls**: Enables dynamic input mapping, allowing players to personalize their controls.
- **Streamlined Development**: Reduces the complexity of input management, freeing developers to focus on core game logic.

