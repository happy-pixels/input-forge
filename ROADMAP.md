# Input Forge Roadmap

This document tracks the planned improvements and polish for Input Forge v1.0.

---

## Phase 0: Infrastructure

Core utilities needed before polishing.

- [x] **0.1** Create Logger utility with three modes: `off`, `on`, `throttled` (`src/core/logger.ts`)
- [ ] **0.2** Add logging throughout the library for debugging user setups

---

## Phase 1: Critical Fixes ✅

These are bugs and typos that should be fixed immediately.

- [x] **1.1** Fix typo `'keybarod'` → remove from `AxesInputEvent.source` type (`src/types/input-events.ts:13`)
- [x] **1.2** Fix typo `'entery'` → `'entry'` in command-resolver.ts (`src/core/command-resolver.ts:37`)
- [x] **1.3** Fix typo `"Conplete"` → `"Complete"` in input-map.ts comment (`src/types/input-map.ts:39`)
- [x] **1.4** Fix inconsistent case conversion: use `toLowerCase()` consistently in keyboard-source.ts (`src/sources/keyboard-source.ts:22`)
- [x] **1.5** Delete empty file `src/constants/gamepad-button-map.ts` (buttonMap lives in inputs.ts)

---

## Phase 2: Code Simplification ✅

Reduce redundancy and complexity.

- [x] **2.1** Extract repeated switch statement into helper methods `executeCommand()` and `executeAxesCommand()` in input-manager.ts
- [x] **2.2** Extract generic cache pattern `getOrResolve<T>(key, cache, resolver)` in input-map-stack.ts
- [x] **2.3** Consolidate axes input format - internal APIs use `{x, y}` object; public API accepts both for convenience
- [x] **2.4** Simplify `Object.values().filter()` chains - reviewed and kept as-is (simple enough for typical input maps)
- [x] **2.5** Remove non-null assertion (`!`) overuse - replaced with proper null checks in `getOrResolve`
- [x] **2.6** Clean up commented "Advanced (Optional)" exports block in index.ts

---

## Phase 3: Type Safety Improvements ✅

Strengthen the type system.

- [x] **3.1** Add constraint that `SingleInputEntry` requires at least one input type defined (using `RequireAtLeastOne` utility type)
- [x] **3.2** Add constraint that `AxesInputEntry` requires at least one input type defined (using `RequireAtLeastOne` utility type)
- [x] **3.3** Create strict `InputKey` type from `Inputs` constant values (`src/constants/inputs.ts`)
- [x] **3.4** Add generic type parameter to `InputMap` - skipped (adds complexity without clear benefit; users extend Command classes instead)
- [x] **3.5** Review and tighten `source` union types - already fixed in Phase 1 (removed 'keybarod' typo)

---

## Phase 4: Error Handling & Validation ✅

Make the library more robust.

- [x] **4.1** Add input key validation in CustomSource methods (triggerInput, releaseInput, etc.)
- [x] **4.2** Add gamepad index bounds checking in GamepadSource (fps clamped 1-120, deadzone clamped 0-1)
- [x] **4.3** Add gamepad axes/buttons array bounds checking for unusual controllers
- [x] **4.4** Add logging for gamepad connect/disconnect and capability warnings
- [x] **4.5** Add validation that InputMap has at least one entry (runtime warning via logger)
- [x] **4.6** Add graceful handling and logging for InputMapStack operations (pop on empty, remove not found)

---

## Phase 5: Test Coverage ✅

Target: 80%+ coverage. Current: ~70% (92 tests passing)

- [x] **5.1** Set up test infrastructure with vitest, jsdom, and logger mocks
- [x] **5.2** Write unit tests for `CommandResolver` (21 tests, 100% coverage)
- [x] **5.3** Write unit tests for `InputMapStack` (30 tests, 97% coverage)
- [x] **5.4** Write unit tests for `InputManager` (via integration tests, 73% coverage)
- [x] **5.5** Write unit tests for `KeyboardSource` (14 tests, 100% coverage)
- [x] **5.6** Write unit tests for `GamepadSource` - skipped (requires complex browser API mocking)
- [x] **5.7** Write unit tests for `CustomSource` (14 tests, 100% coverage)
- [x] **5.8** Write integration tests for full input→command flow (13 tests)
- [x] **5.9** Add GitHub Actions CI pipeline (`.github/workflows/ci.yml`)

---

## Phase 6: Documentation ✅

Improve developer experience.

- [x] **6.1** Add JSDoc to `InputManager` class with usage examples
- [x] **6.2** Add JSDoc to all public methods in InputManager
- [x] **6.3** Add JSDoc to `Command`, `AxesCommand`, `TickCommand` explaining lifecycle
- [x] **6.4** Add JSDoc to `InputMapStack` explaining push vs set semantics
- [x] **6.5** Document `InputMap` structure with examples
- [x] **6.6** Add inline examples in README for common use cases
- [x] **6.7** Create API reference documentation (table format in README, TypeDoc in `/docs`)

---

## Phase 7: API Improvements

Make the public API more intuitive.

- [x] **7.1** Rename `pushInputMap` → `pushInputMapContext` and `setInputMap` → `replaceInputMap` for clarity - skipped (breaking change for existing users)
- [x] **7.2** Add `updateInput()` and `releaseInput()` methods to CustomSource for consistency with axes API
- [x] **7.3** Consider builder pattern for InputMap construction - skipped for now (revisit post-NPM publish when versioning can manage breaking changes)
- [x] **7.4** Add convenience method `isInputActive(key: string): boolean` to InputManager
- [x] **7.5** Add `getActiveCommands(): Command[]` method for debugging
- [x] **7.6** Consider exposing input source priority configuration - skipped (issue resolved in earlier refactor)

---

## Phase 8: Performance Optimizations

Improve runtime efficiency.

- [x] **8.1** Only start gamepad polling interval when a gamepad is connected - skipped (revisit after multi-controller support)
- [x] **8.2** Stop polling interval when all gamepads disconnected - skipped (revisit after multi-controller support)
- [x] **8.3** Add optional throttling for high-frequency axis update events (`axesThrottleMs` constructor param)
- [x] **8.4** Pre-index input maps by key type to avoid repeated `Object.values()` iterations - skipped (revisit if profiling shows bottleneck)
- [x] **8.5** Consider object pooling for frequently created event objects - skipped (revisit if profiling shows bottleneck)

---

## Phase 9: Build & Tooling

Improve developer workflow.

- [x] **9.1** Add bundle size analysis script - skipped
- [x] **9.2** Add tree-shaking verification - skipped
- [x] **9.3** Configure minified production build - skipped
- [x] **9.4** Add pre-commit hooks (husky) for linting - skipped
- [x] **9.5** Add GitHub Actions CI/CD pipeline - skipped
- [x] **9.6** Add automated npm publish workflow - skipped

---

## Phase 10: Future Features

_Reserved for user-requested features._

- [x] **10.1** Add `activeInputDevice$` Observable to identify input source (keyboard, xbox, playstation, other_controller)
- [ ] **10.2** Add multi-controller support

---

## Priority Matrix

| Phase | Priority | Effort | Impact |
|-------|----------|--------|--------|
| 1. Critical Fixes | 🔴 High | Low | High |
| 2. Code Simplification | 🟠 Medium | Medium | High |
| 3. Type Safety | 🟠 Medium | Medium | Medium |
| 4. Error Handling | 🟠 Medium | Medium | Medium |
| 5. Test Coverage | 🔴 High | High | High |
| 6. Documentation | 🟡 Low | Medium | Medium |
| 7. API Improvements | 🟡 Low | Medium | High |
| 8. Performance | 🟡 Low | Low | Low |
| 9. Build & Tooling | 🟡 Low | Medium | Low |
| 10. Future Features | TBD | TBD | TBD |

---

## Suggested Order of Execution

1. **Phase 1** - Quick wins, fix embarrassing typos
2. **Phase 5.1-5.3** - Basic test infrastructure before refactoring
3. **Phase 2** - Simplify code while tests catch regressions
4. **Phase 3-4** - Strengthen types and error handling
5. **Phase 5.4-5.9** - Complete test coverage
6. **Phase 6-7** - Polish API and docs
7. **Phase 8-9** - Optimization and tooling
8. **Phase 10** - New features

---

_Last updated: 2026-05-07_
