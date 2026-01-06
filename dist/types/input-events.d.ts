import type { AxesInput } from './axes-input.js';
export type SingleInputEvent = {
    type: 'trigger' | 'update' | 'release';
    key: string;
    source: 'keyboard' | 'gamepad' | 'custom';
};
export type AxesInputEvent = {
    type: 'trigger' | 'update' | 'release';
    name: string;
    axes: AxesInput;
    source: 'keybarod' | 'gamepad' | 'custom';
};
export type TickEvent = {
    type: 'tick';
    delta: number;
};
export type InputEvent = SingleInputEvent | AxesInputEvent | TickEvent;
//# sourceMappingURL=input-events.d.ts.map