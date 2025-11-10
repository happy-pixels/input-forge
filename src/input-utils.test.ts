import { describe, it, expect } from 'vitest';
import { Inputs, symbolToConstant } from './input-utils';

describe('Converting input to constant', () => {
    it('shold map space character to KEYBOARD_SPACE', () => {
        expect(symbolToConstant(' ')).toBe(Inputs.KEYBOARD_SPACE);
    });

    it('should map punctuation symboles to their keybaord constants', () => {
        expect(symbolToConstant('/')).toBe(Inputs.KEYBOARD_SLASH);
        expect(symbolToConstant(',')).toBe(Inputs.KEYBOARD_COMMA);
        expect(symbolToConstant('.')).toBe(Inputs.KEYBOARD_PERIOD);
        expect (symbolToConstant(';')).toBe(Inputs.KEYBOARD_SEMICOLON);
    });

    it('should map quote and bracket characters to their keyboard constants', () => {
        expect(symbolToConstant('\'')).toBe(Inputs.KEYBOARD_QUOTE);
        expect(symbolToConstant('`')).toBe(Inputs.KEYBOARD_BACKQUOTE);
        expect(symbolToConstant('[')).toBe(Inputs.KEYBOARD_BRACKET_LEFT);
        expect(symbolToConstant(']')).toBe(Inputs.KEYBOARD_BRACKET_RIGHT);
        expect(symbolToConstant('\\')).toBe(Inputs.KEYBOARD_BACKSLASH);
    });

    it('should map math operator symbols to their keyboard constants', () => {
        expect(symbolToConstant('-')).toBe(Inputs.KEYBOARD_MINUS);
        expect(symbolToConstant('=')).toBe(Inputs.KEYBOARD_EQUAL);
        expect(symbolToConstant('+')).toBe(Inputs.KEYBOARD_ADD);
        expect(symbolToConstant('*')).toBe(Inputs.KEYBOARD_MULTIPLY);
    });

    it('should return unmapped symbols unchanged', () => {
        expect(symbolToConstant('a')).toBe('a');
        expect(symbolToConstant('z')).toBe('z');
        expect(symbolToConstant('5')).toBe('5');
    });
});