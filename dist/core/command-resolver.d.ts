import type { Command, AxesCommand, TickCommand } from '../types/commands';
import type { InputMap } from '../types/input-map';
import type { AxesInput } from '../types/axes-input';
export declare class CommandResolver {
    resolveSingleInput(inputMap: InputMap, key: string): Command[];
    resolveAxesInput(inputMap: InputMap, name: string): AxesCommand[];
    resolveKeyboardAxesInput(inputMap: InputMap, key: string): Array<{
        command: AxesCommand;
        axis: AxesInput;
    }>;
    resolveTickCommands(inputMap: InputMap): TickCommand[];
    private getAxisFromKey;
}
//# sourceMappingURL=command-resolver.d.ts.map