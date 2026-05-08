import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../core/input-manager';
import { Command, AxesCommand } from '../types/commands';
import { InputDeviceType } from '../types/input-events';
class TestCommand extends Command {
    triggerCount = 0;
    updateCount = 0;
    releaseCount = 0;
    trigger() {
        this.triggerCount++;
    }
    update() {
        this.updateCount++;
    }
    release() {
        this.releaseCount++;
    }
    reset() {
        this.triggerCount = 0;
        this.updateCount = 0;
        this.releaseCount = 0;
    }
}
class TestAxesCommand extends AxesCommand {
    triggerCount = 0;
    updateCount = 0;
    releaseCount = 0;
    lastAxes = null;
    trigger(axes) {
        this.triggerCount++;
        this.lastAxes = axes;
    }
    update(axes) {
        this.updateCount++;
        this.lastAxes = axes;
    }
    release() {
        this.releaseCount++;
        this.lastAxes = null;
    }
    reset() {
        this.triggerCount = 0;
        this.updateCount = 0;
        this.releaseCount = 0;
        this.lastAxes = null;
    }
}
describe('Integration: Input to Command Flow', () => {
    let manager;
    let jumpCommand;
    let moveCommand;
    let inputMap;
    beforeEach(() => {
        manager = new InputManager();
        jumpCommand = new TestCommand();
        moveCommand = new TestAxesCommand();
        inputMap = {
            id: 'gameplay',
            singleInput: {
                jump: { keyboardInput: 'space', command: jumpCommand }
            },
            axesInput: {
                move: {
                    keyboardAxes: {
                        vertical: { up: 'w', down: 's' },
                        horizontal: { left: 'a', right: 'd' }
                    },
                    command: moveCommand
                }
            }
        };
        manager.setInputMap(inputMap);
    });
    afterEach(() => {
        manager.destroy();
    });
    describe('Keyboard input flow', () => {
        const dispatchKeyDown = (key) => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        };
        const dispatchKeyUp = (key) => {
            window.dispatchEvent(new KeyboardEvent('keyup', { key }));
        };
        it('should trigger command on keydown', () => {
            dispatchKeyDown(' '); // space
            expect(jumpCommand.triggerCount).toBe(1);
        });
        it('should release command on keyup', () => {
            dispatchKeyDown(' ');
            dispatchKeyUp(' ');
            expect(jumpCommand.releaseCount).toBe(1);
        });
        it('should trigger axes command on directional key', () => {
            dispatchKeyDown('w');
            expect(moveCommand.triggerCount).toBe(1);
            expect(moveCommand.lastAxes).toEqual({ x: 0, y: -1 });
        });
        it('should release axes command on directional key release', () => {
            dispatchKeyDown('w');
            dispatchKeyUp('w');
            expect(moveCommand.releaseCount).toBe(1);
        });
    });
    describe('Custom input flow', () => {
        it('should trigger command via custom input', () => {
            const customCommand = new TestCommand();
            const customMap = {
                id: 'custom',
                singleInput: {
                    action: { customInput: 'my_action', command: customCommand }
                }
            };
            manager.setInputMap(customMap);
            manager.triggerCustomInput('my_action');
            expect(customCommand.triggerCount).toBe(1);
        });
        it('should handle custom axes input', () => {
            const customAxes = new TestAxesCommand();
            const customMap = {
                id: 'custom',
                axesInput: {
                    stick: { customAxesInput: 'virtual_stick', command: customAxes }
                }
            };
            manager.setInputMap(customMap);
            manager.triggerCustomAxesInput('virtual_stick', { x: 0.5, y: -0.5 });
            expect(customAxes.triggerCount).toBe(1);
            expect(customAxes.lastAxes).toEqual({ x: 0.5, y: -0.5 });
        });
        it('should update custom axes input', () => {
            const customAxes = new TestAxesCommand();
            const customMap = {
                id: 'custom',
                axesInput: {
                    stick: { customAxesInput: 'virtual_stick', command: customAxes }
                }
            };
            manager.setInputMap(customMap);
            manager.triggerCustomAxesInput('virtual_stick', { x: 0, y: 0 });
            manager.updateCustomAxesInput('virtual_stick', { x: 1, y: 0 });
            expect(customAxes.updateCount).toBe(1);
            expect(customAxes.lastAxes).toEqual({ x: 1, y: 0 });
        });
        it('should release custom axes input', () => {
            const customAxes = new TestAxesCommand();
            const customMap = {
                id: 'custom',
                axesInput: {
                    stick: { customAxesInput: 'virtual_stick', command: customAxes }
                }
            };
            manager.setInputMap(customMap);
            manager.triggerCustomAxesInput('virtual_stick', { x: 1, y: 0 });
            manager.releaseCustomAxesInput('virtual_stick');
            expect(customAxes.releaseCount).toBe(1);
        });
    });
    describe('Input map management', () => {
        it('should not process inputs when no map is set', () => {
            const emptyManager = new InputManager();
            const testCommand = new TestCommand();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(testCommand.triggerCount).toBe(0);
            emptyManager.destroy();
        });
        it('should switch active map with push/pop', () => {
            const menuCommand = new TestCommand();
            const menuMap = {
                id: 'menu',
                singleInput: {
                    select: { keyboardInput: 'enter', command: menuCommand }
                }
            };
            manager.pushInputMap(menuMap);
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            expect(menuCommand.triggerCount).toBe(1);
            expect(jumpCommand.triggerCount).toBe(0);
            manager.popInputMap();
            jumpCommand.reset();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(jumpCommand.triggerCount).toBe(1);
        });
        it('should report current map id', () => {
            expect(manager.currentInputMap()).toBe('gameplay');
            manager.pushInputMap({
                id: 'pause',
                singleInput: { resume: { keyboardInput: 'escape', command: new TestCommand() } }
            });
            expect(manager.currentInputMap()).toBe('pause');
        });
        it('should check if map exists', () => {
            expect(manager.hasInputMap('gameplay')).toBe(true);
            expect(manager.hasInputMap('nonexistent')).toBe(false);
        });
        it('should remove specific map', () => {
            manager.pushInputMap({
                id: 'overlay',
                singleInput: { close: { keyboardInput: 'escape', command: new TestCommand() } }
            });
            manager.removeInputMap('overlay');
            expect(manager.hasInputMap('overlay')).toBe(false);
            expect(manager.currentInputMap()).toBe('gameplay');
        });
    });
    describe('isInputActive', () => {
        const dispatchKeyDown = (key) => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        };
        const dispatchKeyUp = (key) => {
            window.dispatchEvent(new KeyboardEvent('keyup', { key }));
        };
        it('should return false when no input is active', () => {
            expect(manager.isInputActive('space')).toBe(false);
        });
        it('should return true when keyboard input is active', () => {
            dispatchKeyDown(' ');
            expect(manager.isInputActive('space')).toBe(true);
        });
        it('should return false after input is released', () => {
            dispatchKeyDown(' ');
            dispatchKeyUp(' ');
            expect(manager.isInputActive('space')).toBe(false);
        });
        it('should track multiple active inputs', () => {
            dispatchKeyDown('w');
            dispatchKeyDown('a');
            expect(manager.isInputActive('w')).toBe(true);
            expect(manager.isInputActive('a')).toBe(true);
            expect(manager.isInputActive('s')).toBe(false);
        });
    });
    describe('getActiveCommands', () => {
        const dispatchKeyDown = (key) => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        };
        const dispatchKeyUp = (key) => {
            window.dispatchEvent(new KeyboardEvent('keyup', { key }));
        };
        it('should return empty array when no commands are active', () => {
            expect(manager.getActiveCommands()).toHaveLength(0);
        });
        it('should return active command when triggered', () => {
            dispatchKeyDown(' ');
            const active = manager.getActiveCommands();
            expect(active).toHaveLength(1);
            expect(active[0]).toBe(jumpCommand);
        });
        it('should remove command when released', () => {
            dispatchKeyDown(' ');
            dispatchKeyUp(' ');
            expect(manager.getActiveCommands()).toHaveLength(0);
        });
        it('should track multiple active commands', () => {
            dispatchKeyDown(' ');
            dispatchKeyDown('w'); // triggers moveCommand (axes)
            const active = manager.getActiveCommands();
            expect(active).toHaveLength(2);
            expect(active).toContain(jumpCommand);
            expect(active).toContain(moveCommand);
        });
        it('should track axes commands', () => {
            dispatchKeyDown('w');
            const active = manager.getActiveCommands();
            expect(active).toHaveLength(1);
            expect(active[0]).toBe(moveCommand);
        });
    });
    describe('activeInputDevice$', () => {
        const dispatchKeyDown = (key) => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        };
        it('should return null initially', () => {
            expect(manager.getActiveInputDevice()).toBe(null);
        });
        it('should emit keyboard when keyboard input is detected', () => {
            const devices = [];
            manager.activeInputDevice$.subscribe((device) => {
                devices.push(device);
            });
            dispatchKeyDown(' ');
            expect(devices).toContain(InputDeviceType.Keyboard);
            expect(manager.getActiveInputDevice()).toBe(InputDeviceType.Keyboard);
        });
        it('should only emit when device changes (distinctUntilChanged)', () => {
            const devices = [];
            manager.activeInputDevice$.subscribe((device) => {
                devices.push(device);
            });
            dispatchKeyDown(' ');
            dispatchKeyDown('w');
            dispatchKeyDown('a');
            // Should only have null (initial) and keyboard (once)
            expect(devices.filter(d => d === InputDeviceType.Keyboard)).toHaveLength(1);
        });
    });
});
//# sourceMappingURL=integration.test.js.map