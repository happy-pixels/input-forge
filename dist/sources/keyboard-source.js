import { fromEvent } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';
import { InputSourceBase } from './input-source-base';
import { symbolToConstant } from '../utils';
export class KeyboardSource extends InputSourceBase {
    state = {
        activeInputs: new Set(),
        pendingTriggers: [],
        pendingReleases: [],
    };
    constructor() {
        super();
        this.init();
    }
    init() {
        fromEvent(window, 'keydown')
            .pipe(map((e) => symbolToConstant(e.key.toLocaleLowerCase())), filter((key) => !this.state.activeInputs.has(key)), takeUntil(this.disconnect$))
            .subscribe((key) => {
            this.state.pendingTriggers.push(key);
            this.state.activeInputs.add(key);
            this._singleInputEvent$.next({
                type: 'trigger',
                key,
                source: 'keyboard',
            });
        });
        fromEvent(window, 'keyup')
            .pipe(map((e) => symbolToConstant(e.key.toLowerCase())), takeUntil(this.disconnect$))
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
    emitUpdates() {
        this.state.activeInputs.forEach((key) => {
            this._singleInputEvent$.next({
                type: 'update',
                key,
                source: 'keyboard',
            });
        });
    }
    getState() {
        return {
            singleInputs: { ...this.state },
            axesInputs: new Map(),
        };
    }
}
//# sourceMappingURL=keyboard-source.js.map