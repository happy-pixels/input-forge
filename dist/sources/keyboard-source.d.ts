import { InputSourceBase } from './input-source-base';
import type { InputSourceState } from '../types/input-state';
export declare class KeyboardSource extends InputSourceBase {
    private state;
    constructor();
    protected init(): void;
    emitUpdates(): void;
    getState(): InputSourceState;
}
//# sourceMappingURL=keyboard-source.d.ts.map