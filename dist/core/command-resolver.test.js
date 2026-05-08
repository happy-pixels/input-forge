import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandResolver } from './command-resolver';
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
describe('CommandResolver', () => {
    let resolver;
    beforeEach(() => {
        resolver = new CommandResolver();
    });
    describe('resolveSingleInput', () => {
        it('should return empty array when inputMap has no singleInput', () => {
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: { controllerStick: 'left_stick', command: new MockAxesCommand() }
                }
            };
            const result = resolver.resolveSingleInput(inputMap, 'a');
            expect(result).toEqual([]);
        });
        it('should resolve command by keyboardInput', () => {
            const command = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    jump: { keyboardInput: 'space', command }
                }
            };
            const result = resolver.resolveSingleInput(inputMap, 'space');
            expect(result).toEqual([command]);
        });
        it('should resolve command by controllerInput', () => {
            const command = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    jump: { controllerInput: 'face_bottom', command }
                }
            };
            const result = resolver.resolveSingleInput(inputMap, 'face_bottom');
            expect(result).toEqual([command]);
        });
        it('should resolve command by systemInput', () => {
            const command = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    tick: { systemInput: Inputs.SYSTEM_TICK, command }
                }
            };
            const result = resolver.resolveSingleInput(inputMap, Inputs.SYSTEM_TICK);
            expect(result).toEqual([command]);
        });
        it('should resolve command by customInput', () => {
            const command = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    custom: { customInput: 'my_custom', command }
                }
            };
            const result = resolver.resolveSingleInput(inputMap, 'my_custom');
            expect(result).toEqual([command]);
        });
        it('should return multiple commands when multiple entries match', () => {
            const command1 = new MockCommand();
            const command2 = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    action1: { keyboardInput: 'a', command: command1 },
                    action2: { keyboardInput: 'a', command: command2 }
                }
            };
            const result = resolver.resolveSingleInput(inputMap, 'a');
            expect(result).toHaveLength(2);
            expect(result).toContain(command1);
            expect(result).toContain(command2);
        });
        it('should return empty array when no match found', () => {
            const command = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    jump: { keyboardInput: 'space', command }
                }
            };
            const result = resolver.resolveSingleInput(inputMap, 'x');
            expect(result).toEqual([]);
        });
    });
    describe('resolveAxesInput', () => {
        it('should return empty array when inputMap has no axesInput', () => {
            const inputMap = {
                id: 'test',
                singleInput: {
                    jump: { keyboardInput: 'space', command: new MockCommand() }
                }
            };
            const result = resolver.resolveAxesInput(inputMap, 'left_stick');
            expect(result).toEqual([]);
        });
        it('should resolve command by controllerStick', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: { controllerStick: 'left_stick', command }
                }
            };
            const result = resolver.resolveAxesInput(inputMap, 'left_stick');
            expect(result).toEqual([command]);
        });
        it('should resolve command by customAxesInput', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: { customAxesInput: 'virtual_stick', command }
                }
            };
            const result = resolver.resolveAxesInput(inputMap, 'virtual_stick');
            expect(result).toEqual([command]);
        });
        it('should return empty array when no match found', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: { controllerStick: 'left_stick', command }
                }
            };
            const result = resolver.resolveAxesInput(inputMap, 'right_stick');
            expect(result).toEqual([]);
        });
    });
    describe('resolveKeyboardAxesInput', () => {
        it('should return empty array when inputMap has no axesInput', () => {
            const inputMap = {
                id: 'test',
                singleInput: {
                    jump: { keyboardInput: 'space', command: new MockCommand() }
                }
            };
            const result = resolver.resolveKeyboardAxesInput(inputMap, 'w');
            expect(result).toEqual([]);
        });
        it('should resolve up key to negative Y axis', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: {
                        keyboardAxes: {
                            vertical: { up: 'w', down: 's' },
                            horizontal: { left: 'a', right: 'd' }
                        },
                        command
                    }
                }
            };
            const result = resolver.resolveKeyboardAxesInput(inputMap, 'w');
            expect(result).toEqual([{ command, axis: { x: 0, y: -1 } }]);
        });
        it('should resolve down key to positive Y axis', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: {
                        keyboardAxes: {
                            vertical: { up: 'w', down: 's' },
                            horizontal: { left: 'a', right: 'd' }
                        },
                        command
                    }
                }
            };
            const result = resolver.resolveKeyboardAxesInput(inputMap, 's');
            expect(result).toEqual([{ command, axis: { x: 0, y: 1 } }]);
        });
        it('should resolve left key to negative X axis', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: {
                        keyboardAxes: {
                            vertical: { up: 'w', down: 's' },
                            horizontal: { left: 'a', right: 'd' }
                        },
                        command
                    }
                }
            };
            const result = resolver.resolveKeyboardAxesInput(inputMap, 'a');
            expect(result).toEqual([{ command, axis: { x: -1, y: 0 } }]);
        });
        it('should resolve right key to positive X axis', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: {
                        keyboardAxes: {
                            vertical: { up: 'w', down: 's' },
                            horizontal: { left: 'a', right: 'd' }
                        },
                        command
                    }
                }
            };
            const result = resolver.resolveKeyboardAxesInput(inputMap, 'd');
            expect(result).toEqual([{ command, axis: { x: 1, y: 0 } }]);
        });
        it('should return empty array for non-matching key', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: {
                        keyboardAxes: {
                            vertical: { up: 'w', down: 's' },
                            horizontal: { left: 'a', right: 'd' }
                        },
                        command
                    }
                }
            };
            const result = resolver.resolveKeyboardAxesInput(inputMap, 'x');
            expect(result).toEqual([]);
        });
        it('should skip axes entries without keyboardAxes config', () => {
            const command = new MockAxesCommand();
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: { controllerStick: 'left_stick', command }
                }
            };
            const result = resolver.resolveKeyboardAxesInput(inputMap, 'w');
            expect(result).toEqual([]);
        });
    });
    describe('resolveTickCommands', () => {
        it('should return empty array when inputMap has no singleInput', () => {
            const inputMap = {
                id: 'test',
                axesInput: {
                    move: { controllerStick: 'left_stick', command: new MockAxesCommand() }
                }
            };
            const result = resolver.resolveTickCommands(inputMap);
            expect(result).toEqual([]);
        });
        it('should return tick commands with SYSTEM_TICK systemInput', () => {
            const tickCommand = new MockTickCommand();
            const regularCommand = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    tick: { systemInput: Inputs.SYSTEM_TICK, command: tickCommand },
                    jump: { keyboardInput: 'space', command: regularCommand }
                }
            };
            const result = resolver.resolveTickCommands(inputMap);
            expect(result).toEqual([tickCommand]);
        });
        it('should return empty array when no tick commands exist', () => {
            const command = new MockCommand();
            const inputMap = {
                id: 'test',
                singleInput: {
                    jump: { keyboardInput: 'space', command }
                }
            };
            const result = resolver.resolveTickCommands(inputMap);
            expect(result).toEqual([]);
        });
    });
});
//# sourceMappingURL=command-resolver.test.js.map