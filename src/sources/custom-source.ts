import { InputSourceBase } from './input-source-base';
import type { InputSourceState } from '../types/input-state';
import type { AxesInput } from '../types/axes-input';
import { normalizeAxesInput } from '../utils';
import { logger } from '../core/logger';

export class CustomSource extends InputSourceBase {
    constructor() {
        super();
        this.init();
    }

    protected init(): void {
        // No initialization needed for custom source
    }

    private validateKey(key: string, method: string): boolean {
        if (!key || key.trim() === '') {
            logger.warn(`${method}: Invalid key provided (empty or whitespace)`);
            return false;
        }
        return true;
    }

    private validateName(name: string, method: string): boolean {
        if (!name || name.trim() === '') {
            logger.warn(`${method}: Invalid name provided (empty or whitespace)`);
            return false;
        }
        return true;
    }

    public triggerInput(key: string): void {
        if (!this.validateKey(key, 'triggerInput')) {
            return;
        }

        this._singleInputEvent$.next({
            type: 'trigger',
            key,
            source: 'custom'
        });
    }

    public updateInput(key: string): void {
        if (!this.validateKey(key, 'updateInput')) {
            return;
        }

        this._singleInputEvent$.next({
            type: 'update',
            key,
            source: 'custom'
        });
    }

    public releaseInput(key: string): void {
        if (!this.validateKey(key, 'releaseInput')) {
            return;
        }

        this._singleInputEvent$.next({
            type: 'release',
            key,
            source: 'custom'
        });
    }

    public triggerAxesInput(name: string, axes: [number, number] | AxesInput): void {
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

    public updateAxesInput(name: string, axes: [number, number] | AxesInput): void {
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

    public releaseAxesInput(name: string): void {
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