import { fromEvent } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';
import { InputSourceBase } from './input-source-base';
import type { InputSourceState, SingleInputState } from '../types/input-state';
import { symbolToConstant } from '../input-utils';

export class KeyboardSource extends InputSourceBase {
    private state: SingleInputState = {
        activeInputs: new Set<string>(),
        pendingTriggers: [],
        pendingReleases: [],
    };

    constructor() {
        super();
        this.init();
    }

    protected init(): void {
        fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(
                map((e) => symbolToConstant(e.key.toLocaleLowerCase())),
                filter((key) => !this.state.activeInputs.has(key)),
                takeUntil(this.disconnect$)
            )
            .subscribe((key) => {
                this.state.pendingTriggers.push(key);
                this.state.activeInputs.add(key);

                this._singleInputEvent$.next({
                    type: 'trigger',
                    key,
                    source: 'keyboard',
                });
            });

        fromEvent<KeyboardEvent>(window, 'keyup')
            .pipe(
                map((e) => symbolToConstant(e.key.toLowerCase())),
                takeUntil(this.disconnect$)
            )
            .subscribe((key) => {
                this.state.pendingReleases.push(key);
                this.state.activeInputs.delete(key);

                this._singleInputEvent$.next({
                    type: 'release',
                    key,
                    source: 'keyboard',
                });
            });
    }

    public emitUpdates(): void {
        this.state.activeInputs.forEach((key) => {
            this._singleInputEvent$.next({
                type: 'update',
                key,
                source: 'keyboard',
            });
        });
    }

    public getState(): InputSourceState {
        return {
            singleInputs: { ...this.state },
            axesInputs: new Map(),
        };
    }
}