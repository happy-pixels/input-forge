import { InputSourceBase } from './input-source-base';
import { normalizeAxesInput } from '../utils';
import { logger } from '../core/logger';
export class CustomSource extends InputSourceBase {
    constructor() {
        super();
        this.init();
    }
    init() {
        // No initialization needed for custom source
    }
    validateKey(key, method) {
        if (!key || key.trim() === '') {
            logger.warn(`${method}: Invalid key provided (empty or whitespace)`);
            return false;
        }
        return true;
    }
    validateName(name, method) {
        if (!name || name.trim() === '') {
            logger.warn(`${method}: Invalid name provided (empty or whitespace)`);
            return false;
        }
        return true;
    }
    triggerInput(key) {
        if (!this.validateKey(key, 'triggerInput')) {
            return;
        }
        this._singleInputEvent$.next({
            type: 'trigger',
            key,
            source: 'custom'
        });
    }
    updateInput(key) {
        if (!this.validateKey(key, 'updateInput')) {
            return;
        }
        this._singleInputEvent$.next({
            type: 'update',
            key,
            source: 'custom'
        });
    }
    releaseInput(key) {
        if (!this.validateKey(key, 'releaseInput')) {
            return;
        }
        this._singleInputEvent$.next({
            type: 'release',
            key,
            source: 'custom'
        });
    }
    triggerAxesInput(name, axes) {
        if (!this.validateName(name, 'triggerAxesInput')) {
            return;
        }
        const normalizedAxes = normalizeAxesInput(axes);
        this._axesInputEvent$.next({
            type: 'trigger',
            name,
            axes: normalizedAxes,
            source: 'custom',
        });
    }
    updateAxesInput(name, axes) {
        if (!this.validateName(name, 'updateAxesInput')) {
            return;
        }
        const normalizedAxes = normalizeAxesInput(axes);
        this._axesInputEvent$.next({
            type: 'update',
            name,
            axes: normalizedAxes,
            source: 'custom',
        });
    }
    releaseAxesInput(name) {
        if (!this.validateName(name, 'releaseAxesInput')) {
            return;
        }
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