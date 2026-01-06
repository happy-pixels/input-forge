import type { AxesInput } from './axes-input';

export type SingleInputState = {
    activeInputs: Set<string>;
    pendingTriggers: string[];
    pendingReleases: string[];
};

export type AxesInputState = {
    name: string;
    current: AxesInput;
    previous: AxesInput;
    isActive: boolean;
};

export type AxesStateMap = Map<string, AxesInputState>;

export type InputSourceState = {
    singleInputs: SingleInputState;
    axesInputs: AxesStateMap;
};