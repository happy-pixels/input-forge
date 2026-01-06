import { Inputs } from '../constants/inputs';
export class CommandResolver {
    resolveSingleInput(inputMap, key) {
        if (!inputMap.singleInput) {
            return [];
        }
        return Object.values(inputMap.singleInput)
            .filter((entry) => entry.keyboardInput === key ||
            entry.controllerInput === key ||
            entry.systemInput === key ||
            entry.customInput === key)
            .map((entry) => entry.command);
    }
    resolveAxesInput(inputMap, name) {
        if (!inputMap.axesInput) {
            return [];
        }
        return Object.values(inputMap.axesInput)
            .filter((entry) => entry.controllerStick === name ||
            entry.customAxesInput === name)
            .map((entery) => entery.command);
    }
    resolveKeyboardAxesInput(inputMap, key) {
        if (!inputMap.axesInput) {
            return [];
        }
        const results = [];
        Object.values(inputMap.axesInput).forEach((entry) => {
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
    resolveTickCommands(inputMap) {
        if (!inputMap.singleInput) {
            return [];
        }
        return Object.values(inputMap.singleInput)
            .filter((entry) => entry.systemInput === Inputs.SYSTEM_TICK)
            .map((entry) => entry.command);
    }
    getAxisFromKey(key, config) {
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
//# sourceMappingURL=command-resolver.js.map