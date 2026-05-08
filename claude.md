# Input Forge

A platform-agnostic input management library for JavaScript games and applications. Provides a unified API for handling keyboard, gamepad, and custom input sources with support for dynamic input mapping and the command pattern.

## Project Overview

Input Forge normalizes event-driven keyboard inputs and polled gamepad inputs into a consistent reactive API using RxJS. It supports:
- Multiple input sources mapping to the same action
- Runtime input customization (rebinding)
- Context-switching via input map stacks (e.g., menu vs gameplay)
- Abstract command classes with lifecycle methods

**Version:** 0.2.0 (in development)

## Architecture

```
Type System (Foundation)
    ↓
Input Sources (Data Collection)
    ↓
Core Management (Orchestration & Resolution)
    ↓
Public API (InputManager)
```

### Directory Structure

- `src/core/` - Main orchestration (InputManager, InputMapStack, CommandResolver)
- `src/sources/` - Input source implementations (keyboard, gamepad, custom)
- `src/types/` - Type definitions and abstract command classes
- `src/constants/` - Input constants and button mappings
- `src/utils.ts` - Helper functions

### Key Files

| File | Purpose |
|------|---------|
| `src/core/input-manager.ts` | Main orchestrator; manages sources and input map stack |
| `src/core/input-map-stack.ts` | Stack management with command caching |
| `src/core/command-resolver.ts` | Maps inputs to commands |
| `src/sources/keyboard-source.ts` | Event-based keyboard handling |
| `src/sources/gamepad-source.ts` | Polled gamepad with deadzone filtering |
| `src/sources/custom-source.ts` | Programmatic input triggering |
| `src/types/commands.ts` | Abstract Command, AxesCommand, TickCommand classes |
| `src/core/logger.ts` | Logging utility with off/on/throttled modes |

## Logger

The library includes a built-in logger for debugging. Import and configure:

```typescript
import { logger } from '@happy-pixels/input-forge';

// Modes: 'off' (default), 'on', 'throttled'
logger.setMode('on');           // Immediate logging
logger.setMode('throttled');    // Batched logging (for game loops)
logger.setThrottleInterval(500); // Set batch interval in ms

// Log methods
logger.log('message', ...args);
logger.warn('message', ...args);
logger.error('message', ...args);
```

**Throttled mode** uses RxJS `bufferTime` to batch logs, preventing console spam in game loops.

## Common Commands

```bash
# Build
pnpm build        # Compiles TypeScript to /dist

# Development
pnpm dev          # Watch mode compilation

# Testing
pnpm test         # Run tests with Vitest

# Linting
pnpm lint         # ESLint check
```

## Tech Stack

- **TypeScript 5.8** - ES2022 target, strict mode
- **RxJS 7.8** - Reactive event streams
- **Vitest** - Testing with jsdom environment
- **ESLint** - Code quality
- **pnpm** - Package manager

## Code Conventions

### Style Rules
- Semicolons required
- Single quotes for strings
- No console.log (use `logger` from `src/core/logger.ts`)
- Unused variables must be prefixed with `_`
- Triple-equals (`===`) required

### Patterns
- **Command Pattern** - Commands have lifecycle: `trigger()`, `update()`, `release()`, `tick()`
- **RxJS Observables** - Input sources emit through `trigger$`, `update$`, `release$`, `tick$`
- **Abstract Base Classes** - Extend `InputSourceBase` for new input sources
- **Caching** - Command lookups are cached in InputMapStack; call `clearCache()` when maps change

### TypeScript
- Strict mode enabled
- No unused parameters (except `_` prefixed)
- Declaration files generated

## Input Source Types

1. **KeyboardSource** - Event-driven (keydown/keyup)
2. **GamepadSource** - Polled at configurable FPS with deadzone
3. **CustomSource** - Programmatic triggers from code

## Command Types

- **Command** - Single input (button press)
- **AxesCommand** - Analog input ({x, y} coordinates)
- **TickCommand** - Called every tick while active

## Known Issues

- **Axis Command Conflicts** - Switching between keyboard and gamepad may cause inconsistent behavior
- **Circular Dependencies** - Input maps referencing commands that reference input maps (has workaround)

## Testing

Tests use Vitest with jsdom environment. Test files follow `*.test.ts` pattern.

```bash
pnpm test              # Run all tests
pnpm test --coverage   # With coverage report
```
