import { InputSourceBase } from './input-source-base';
import { normalizeAxesInput } from '../utils';
export class CustomSource extends InputSourceBase {
    constructor() {
        super();
        this.init();
    }
    init() {
    }
    triggerInput(key) {
        this._singleInputEvent$.next({
            type: 'trigger',
            key,
            source: 'custom'
        });
    }
    triggerAxesInput(name, axes) {
        const normailzedAxes = normalizeAxesInput(axes);
        this._axesInputEvent$.next({
            type: 'trigger',
            name,
            axes: normailzedAxes,
            source: 'custom',
        });
    }
    updateAxesInput(name, axes) {
        const normalizedAxes = normalizeAxesInput(axes);
        this._axesInputEvent$.next({
            type: 'update',
            name,
            axes: normalizedAxes,
            source: 'custom',
        });
    }
    releaseAxesInput(name) {
        this._axesInputEvent$.next({
            type: 'release',
            name,
            axes: { x: 0, y: 0 },
            source: 'custom',
        });
    }
    getState() {
        return {
            singleInputs: {
                activeInputs: new Set(),
                pendingTriggers: [],
                pendingReleases: [],
            },
            axesInputs: new Map(),
        };
    }
}
//# sourceMappingURL=custom-source.js.map