import { Inputs } from './constants/inputs';
import type { AxesInput } from './types/axes-input';

export const symbolToConstant = (symbol: string): string => {
    switch (symbol) {
        case ' ': return Inputs.KEYBOARD_SPACE;
        case '/': return Inputs.KEYBOARD_SLASH;
        case ',': return Inputs.KEYBOARD_COMMA;
        case '.': return Inputs.KEYBOARD_PERIOD;
        case ';': return Inputs.KEYBOARD_SEMICOLON;
        case '\'': return Inputs.KEYBOARD_QUOTE;
        case '`': return Inputs.KEYBOARD_BACKQUOTE;
        case '-': return Inputs.KEYBOARD_MINUS;
        case '=': return Inputs.KEYBOARD_EQUAL;
        case '[': return Inputs.KEYBOARD_BRACKET_LEFT;
        case ']': return Inputs.KEYBOARD_BRACKET_RIGHT;
        case '\\': return Inputs.KEYBOARD_BACKSLASH;
        case '+': return Inputs.KEYBOARD_ADD;
        case '*': return Inputs.KEYBOARD_MULTIPLY;
        default: return symbol;
    }
};

export const normalizeAxesInput = (input: [number, number] | AxesInput): AxesInput => {
    if (Array.isArray(input)) {
        return { x: input[0], y: input[1] };
    }
    return input;
};