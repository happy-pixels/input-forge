import { Subject, Observable } from 'rxjs';
import type { SingleInputEvent, AxesInputEvent, TickEvent } from '../types/input-events';
import type { InputSourceState } from '../types/input-state';
export declare abstract class InputSourceBase {
    protected disconnect$: Subject<void>;
    protected _singleInputEvent$: Subject<SingleInputEvent>;
    protected _axesInputEvent$: Subject<AxesInputEvent>;
    protected _tickEvent$: Subject<TickEvent>;
    singleInputEvent$: Observable<SingleInputEvent>;
    axesInputEvent$: Observable<AxesInputEvent>;
    tickEvent$: Observable<TickEvent>;
    protected abstract init(): void;
    abstract getState(): InputSourceState;
    destroy(): void;
}
//# sourceMappingURL=input-source-base.d.ts.map