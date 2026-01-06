import type { Command, AxesCommand } from './commands';

/**
 * Defines a single command and inputs that map to it.
 * Mutliple entries can map to the same command. 
 */
export type SingleInputEntry = {
    keyboardInput?: string;
    controllerInput?: string;
    systemInput?: string;
    customInput?: string;
    command: Command;
};

/**
 * Define a set of keys to represent axes input (e.g., WASD or arrow keys).
 */
export type KeyboardAxesConfig = {
    vertical: { up: string; down: string };
    horizontal: { left: string; right: string };
};

export type AxesInputEntry = {
    keyboardAxes?: KeyboardAxesConfig;
    controllerStick?: string;
    customAxesInput?: string;
    command: AxesCommand;
};

export type SingleInputMap = {
    [key: string]: SingleInputEntry;
};

export type AxesInputMap = {
    [key: string]: AxesInputEntry;
}

/**
 * Conplete input map.
 * Must have at least one of singleInput or axesInput.
 */

export type InputMap = 
    | { id: string; singleInput: SingleInputMap; axesInput?: AxesInputMap }
    | { id: string; singleInput?: SingleInputMap; axesInput: AxesInputMap }
    | { id: string; singleInput: SingleInputMap; axesInput: AxesInputMap };