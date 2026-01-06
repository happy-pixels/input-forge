import { InputSourceBase } from './input-source-base';
import type { InputSourceState } from '../types/input-state';
import type { AxesInput } from '../types/axes-input';
import { normalizeAxesInput } from '../utils';

export class CustomSource extends InputSourceBase {
    constructor() {
        super();
        this.init();
    }

    protected init(): void {

    }

    public triggerInput(key: string): void {
        this._singleInputEvent$.next({
            type: 'trigger',
            key,
            source: 'custom'
        });
    }

    public triggerAxesInput(name: string, axes: [number, number] | AxesInput): void {
        const normailzedAxes = normalizeAxesInput(axes);

        this._axesInputEvent$.next({
            type: 'trigger',
            name,
            axes: normailzedAxes,
            source: 'custom',
        });
    }

    public updateAxesInput(name: string, axes: [number, number] | AxesInput): void {
        const normalizedAxes = normalizeAxesInput(axes);

        this._axesInputEvent$.next({
            type: 'update',
            name,
            axes: normalizedAxes,
            source: 'custom',
        });
    }

    public releaseAxesInput(name: string): void {
        this._axesInputEvent$.next({
            type: 'release',
            name,
            axes: { x: 0, y: 0 },
            source: 'custom',
        });
    }

    public getState(): InputSourceState {
        return {
            singleInputs: {
                activeInputs: new Set<string>(),
                pendingTriggers: [],
                pendingReleases: [],
            },
            axesInputs: new Map(),
        };
    }
}