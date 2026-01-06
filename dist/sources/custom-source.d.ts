import { InputSourceBase } from './input-source-base';
import type { InputSourceState } from '../types/input-state';
import type { AxesInput } from '../types/axes-input';
export declare class CustomSource extends InputSourceBase {
    constructor();
    protected init(): void;
    triggerInput(key: string): void;
    triggerAxesInput(name: string, axes: [number, number] | AxesInput): void;
    updateAxesInput(name: string, axes: [number, number] | AxesInput): void;
    releaseAxesInput(name: string): void;
    getState(): InputSourceState;
}
//# sourceMappingURL=custom-source.d.ts.map