import { Command, AxesCommand } from './command';
export type SingleInputEntry = {
    keyboardInput?: string;
    controllerInput?: string;
    systemInput?: string;
    customInput?: string;
    command: Command;
};
export type AxesInputEntry = {
    keyboardAxes?: {
        vertical: {
            up: string;
            down: string;
        };
        horizontal: {
            left: string;
            right: string;
        };
    };
    controllerstick?: string;
    customAxesInput?: string;
    command: AxesCommand;
};
export type SingleInputMap = {
    [key: string]: SingleInputEntry;
};
export type AxesInputMap = {
    [key: string]: AxesInputEntry;
};
export type InputMap = {
    id: string;
    singleInput: SingleInputMap;
    axesInput?: AxesInputMap;
} | {
    id: string;
    singleInput?: SingleInputMap;
    axesInput: AxesInputMap;
} | {
    id: string;
    singleInput: SingleInputMap;
    axesInput: AxesInputMap;
};
export type AxesInput = {
    x: number;
    y: number;
};
//# sourceMappingURL=input-map.d.ts.map