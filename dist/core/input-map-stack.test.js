import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputMapStack } from './input-map-stack';
import { Command, AxesCommand, TickCommand } from '../types/commands';
import { Inputs } from '../constants/inputs';
class MockCommand extends Command {
    trigger = vi.fn();
    update = vi.fn();
    release = vi.fn();
}
class MockAxesCommand extends AxesCommand {
    trigger = vi.fn();
    update = vi.fn();
    release = vi.fn();
}
class MockTickCommand extends TickCommand {
    trigger = vi.fn();
    update = vi.fn();
    release = vi.fn();
    tick = vi.fn();
}
describe('InputMapStack', () => {
    let stack;
    let inputMap1;
    let inputMap2;
    let command1;
    let command2;
    beforeEach(() => {
        stack = new InputMapStack();
        command1 = new MockCommand();
        command2 = new MockCommand();
        inputMap1 = {
            id: 'map1',
            singleInput: {
                action1: { keyboardInput: 'a', command: command1 }
            }
        };
        inputMap2 = {
            id: 'map2',
            singleInput: {
                action2: { keyboardInput: 'b', command: command2 }
            }
        };
    });
    describe('push', () => {
        it('should add input map to stack', () => {
            stack.push(inputMap1);
            expect(stack.isEmpty()).toBe(false);
            expect(stack.getCurrentId()).toBe('map1');
        });
        it('should stack multiple input maps', () => {
            stack.push(inputMap1);
            stack.push(inputMap2);
            expect(stack.getCurrentId()).toBe('map2');
        });
    });
    describe('set', () => {
        it('should set input map as only item in stack', () => {
            stack.push(inputMap1);
            stack.push(inputMap2);
            stack.set(inputMap1);
            expect(stack.getCurrentId()).toBe('map1');
        });
        it('should clear existing stack', () => {
            stack.push(inputMap1);
            stack.push(inputMap2);
            stack.set(inputMap1);
            stack.pop();
            expect(stack.isEmpty()).toBe(true);
        });
    });
    describe('pop', () => {
        it('should remove top input map from stack', () => {
            stack.push(inputMap1);
            stack.push(inputMap2);
            stack.pop();
            expect(stack.getCurrentId()).toBe('map1');
        });
        it('should not throw when popping empty stack', () => {
            expect(() => stack.pop()).not.toThrow();
        });
        it('should result in empty stack when popping last item', () => {
            stack.push(inputMap1);
            stack.pop();
            expect(stack.isEmpty()).toBe(true);
        });
    });
    describe('has', () => {
        it('should return true when map exists in stack', () => {
            stack.push(inputMap1);
            expect(stack.has('map1')).toBe(true);
        });
        it('should return false when map does not exist', () => {
            stack.push(inputMap1);
            expect(stack.has('nonexistent')).toBe(false);
        });
        it('should find maps anywhere in stack', () => {
            stack.push(inputMap1);
            stack.push(inputMap2);
            expect(stack.has('map1')).toBe(true);
            expect(stack.has('map2')).toBe(true);
        });
    });
    describe('remove', () => {
        it('should remove specific map from stack', () => {
            stack.push(inputMap1);
            stack.push(inputMap2);
            stack.remove('map1');
            expect(stack.has('map1')).toBe(false);
            expect(stack.has('map2')).toBe(true);
        });
        it('should not throw when removing nonexistent map', () => {
            stack.push(inputMap1);
            expect(() => stack.remove('nonexistent')).not.toThrow();
        });
    });
    describe('getCurrentId', () => {
        it('should return null when stack is empty', () => {
            expect(stack.getCurrentId()).toBeNull();
        });
        it('should return id of top map', () => {
            stack.push(inputMap1);
            expect(stack.getCurrentId()).toBe('map1');
        });
    });
    describe('getCurrent', () => {
        it('should return null when stack is empty', () => {
            expect(stack.getCurrent()).toBeNull();
        });
        it('should return top map', () => {
            stack.push(inputMap1);
            expect(stack.getCurrent()).toBe(inputMap1);
        });
    });
    describe('isEmpty', () => {
        it('should return true when stack is empty', () => {
            expect(stack.isEmpty()).toBe(true);
        });
        it('should return false when stack has items', () => {
            stack.push(inputMap1);
            expect(stack.isEmpty()).toBe(false);
        });
    });
    describe('clear', () => {
        it('should empty the stack', () => {
            stack.push(inputMap1);
            stack.push(inputMap2);
            stack.clear();
            expect(stack.isEmpty()).toBe(true);
        });
    });
    describe('getCommandsForSingleInput', () => {
        it('should return empty array when stack is empty', () => {
            const result = stack.getCommandsForSingleInput('a');
            expect(result).toEqual([]);
        });
        it('should return commands matching the key', () => {
            stack.push(inputMap1);
            const result = stack.getCommandsForSingleInput('a');
            expect(result).toEqual([command1]);
        });
        it('should cache results', () => {
            stack.push(inputMap1);
            const result1 = stack.getCommandsForSingleInput('a');
            const result2 = stack.getCommandsForSingleInput('a');
            expect(result1).toBe(result2);
        });
        it('should invalidate cache on push', () => {
            stack.push(inputMap1);
            const result1 = stack.getCommandsForSingleInput('a');
            stack.push(inputMap2);
            const result2 = stack.getCommandsForSingleInput('a');
            expect(result1).not.toBe(result2);
        });
    });
    describe('getCommandsForAxesInput', () => {
        it('should return empty array when stack is empty', () => {
            const result = stack.getCommandsForAxesInput('left_stick');
            expect(result).toEqual([]);
        });
        it('should return axes commands matching the name', () => {
            const axesCommand = new MockAxesCommand();
            const axesMap = {
                id: 'axes',
                axesInput: {
                    move: { controllerStick: 'left_stick', command: axesCommand }
                }
            };
            stack.push(axesMap);
            const result = stack.getCommandsForAxesInput('left_stick');
            expect(result).toEqual([axesCommand]);
        });
    });
    describe('getAxesCommandsForKey', () => {
        it('should return empty array when stack is empty', () => {
            const result = stack.getAxesCommandsForKey('w');
            expect(result).toEqual([]);
        });
        it('should return keyboard axes commands with axis values', () => {
            const axesCommand = new MockAxesCommand();
            const axesMap = {
                id: 'axes',
                axesInput: {
                    move: {
                        keyboardAxes: {
                            vertical: { up: 'w', down: 's' },
                            horizontal: { left: 'a', right: 'd' }
                        },
                        command: axesCommand
                    }
                }
            };
            stack.push(axesMap);
            const result = stack.getAxesCommandsForKey('w');
            expect(result).toEqual([{ command: axesCommand, axis: { x: 0, y: -1 } }]);
        });
    });
    describe('getTickCommands', () => {
        it('should return empty array when stack is empty', () => {
            const result = stack.getTickCommands();
            expect(result).toEqual([]);
        });
        it('should return tick commands', () => {
            const tickCommand = new MockTickCommand();
            const tickMap = {
                id: 'tick',
                singleInput: {
                    tick: { systemInput: Inputs.SYSTEM_TICK, command: tickCommand }
                }
            };
            stack.push(tickMap);
            const result = stack.getTickCommands();
            expect(result).toEqual([tickCommand]);
        });
        it('should cache tick commands', () => {
            const tickCommand = new MockTickCommand();
            const tickMap = {
                id: 'tick',
                singleInput: {
                    tick: { systemInput: Inputs.SYSTEM_TICK, command: tickCommand }
                }
            };
            stack.push(tickMap);
            const result1 = stack.getTickCommands();
            const result2 = stack.getTickCommands();
            expect(result1).toBe(result2);
        });
    });
});
//# sourceMappingURL=input-map-stack.test.js.map