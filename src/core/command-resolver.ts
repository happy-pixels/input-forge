import type { Command, AxesCommand, TickCommand } from '../types/commands';
import type {
    InputMap,
    SingleInputEntry,
    AxesInputEntry,
    KeyboardAxesConfig
} from '../types/input-map';
import type { AxesInput } from '../types/axes-input';
import { Inputs } from '../constants/inputs';

export class CommandResolver {
    public resolveSingleInput(inputMap: InputMap, key: string): Command[] {
        if (!inputMap.singleInput) {
            return [];
        }

        return Object.values(inputMap.singleInput)
            .filter((entry: SingleInputEntry) =>
                entry.keyboardInput === key ||
                entry.controllerInput === key ||
                entry.systemInput === key ||
                entry.customInput === key
            )
            .map((entry: SingleInputEntry) => entry.command);
    }

    public resolveAxesInput(inputMap: InputMap, name: string): AxesCommand[] {
        if (!inputMap.axesInput) {
            return [];
        }

        return Object.values(inputMap.axesInput)
            .filter((entry: AxesInputEntry) =>
                entry.controllerStick === name ||
                entry.customAxesInput === name
            )
            .map((entery: AxesInputEntry) => entery.command);
    }

    public resolveKeyboardAxesInput(inputMap: InputMap, key: string): Array<{ command: AxesCommand; axis: AxesInput }> {
        if (!inputMap.axesInput) {
            return [];
        }

        const results: Array<{ command: AxesCommand; axis: AxesInput }> = [];

        Object.values(inputMap.axesInput).forEach((entry: AxesInputEntry) => {
            if (!entry.keyboardAxes) {
                return;
            }

            const axis = this.getAxisFromKey(key, entry.keyboardAxes);
            if (axis) {
                results.push({
                    command: entry.command,
                    axis,
                });
            }
        });

        return results;
    }

    public resolveTickCommands(inputMap: InputMap): TickCommand[] {
        if (!inputMap.singleInput) {
            return [];
        }

        return Object.values(inputMap.singleInput)
            .filter((entry: SingleInputEntry) => entry.systemInput === Inputs.SYSTEM_TICK)
            .map((entry: SingleInputEntry) => entry.command as TickCommand);
    }

    private getAxisFromKey(key: string, config: KeyboardAxesConfig): AxesInput | null {
        if (key === config.vertical.up) {
            return { x: 0, y: -1 };
        }
        if (key === config.vertical.down) {
            return { x: 0, y: 1 };
        }
        if (key === config.horizontal.left) {
            return { x: -1, y: 0 };
        }
        if (key === config.horizontal.right) {
            return { x: 1, y: 0 };
        }
        return null;
    }
}