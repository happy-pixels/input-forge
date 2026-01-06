import { Subject, Observable } from 'rxjs';
import type { SingleInputEvent, AxesInputEvent, TickEvent  } from '../types/input-events';
import type { InputSourceState } from '../types/input-state';

export abstract class InputSourceBase {
    protected disconnect$ = new Subject<void>();

    protected _singleInputEvent$ = new Subject<SingleInputEvent>();
    protected _axesInputEvent$ = new Subject<AxesInputEvent>();
    protected _tickEvent$ = new Subject<TickEvent>();

    public singleInputEvent$: Observable<SingleInputEvent> = this._singleInputEvent$.asObservable();
    public axesInputEvent$ : Observable<AxesInputEvent> = this._axesInputEvent$.asObservable();
    public tickEvent$ : Observable<TickEvent> = this._tickEvent$.asObservable();

    protected abstract init(): void;

    public abstract getState(): InputSourceState;

    public destroy(): void {
        this.disconnect$.next();
        this.disconnect$.complete();
    }
}