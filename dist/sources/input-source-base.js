import { Subject } from 'rxjs';
export class InputSourceBase {
    disconnect$ = new Subject();
    _singleInputEvent$ = new Subject();
    _axesInputEvent$ = new Subject();
    _tickEvent$ = new Subject();
    singleInputEvent$ = this._singleInputEvent$.asObservable();
    axesInputEvent$ = this._axesInputEvent$.asObservable();
    tickEvent$ = this._tickEvent$.asObservable();
    destroy() {
        this.disconnect$.next();
        this.disconnect$.complete();
    }
}
//# sourceMappingURL=input-source-base.js.map