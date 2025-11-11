/* instanbul ignore file */
import { Command, AxesCommand } from './command';

export type SingleInputEntry = {
    keyboardInput?: string;
    controllerInput?: string;
    systemInput?: string;
    command: Command;
};

export type AxesInputEntry = {
    keyboardAxes?: {
        vertical: { up: string, down: string },
        horizontal: { left: string, right: string }
    };
    controllerstick?: string;
    command: AxesCommand;
};

export type SingleInputMap = {
    [key: string]: SingleInputEntry;
};

export type AxesInputMap = {
    [key: string]: AxesInputEntry;
};

export type InputMap = 
    | { singleInput: SingleInputMap; axesInput?: AxesInputMap }
    | { singleInput?: SingleInputMap; axesInput: AxesInputMap }
    | { singleInput: SingleInputMap; axesInput: AxesInputMap };

export type AxesInput = {
    x: number;
    y: number;
};
