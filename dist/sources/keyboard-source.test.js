import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyboardSource } from './keyboard-source';
describe('KeyboardSource', () => {
    let source;
    let events;
    beforeEach(() => {
        source = new KeyboardSource();
        events = [];
        source.singleInputEvent$.subscribe((event) => {
            events.push(event);
        });
    });
    afterEach(() => {
        source.destroy();
    });
    const dispatchKeyDown = (key) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    };
    const dispatchKeyUp = (key) => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key }));
    };
    describe('keydown events', () => {
        it('should emit trigger event on keydown', () => {
            dispatchKeyDown('a');
            expect(events).toHaveLength(1);
            expect(events[0]).toEqual({
                type: 'trigger',
                key: 'a',
                source: 'keyboard'
            });
        });
        it('should convert key to lowercase', () => {
            dispatchKeyDown('A');
            expect(events[0].key).toBe('a');
        });
        it('should convert symbols using symbolToConstant', () => {
            dispatchKeyDown(' ');
            expect(events[0].key).toBe('space');
        });
        it('should not emit duplicate trigger for held key', () => {
            dispatchKeyDown('a');
            dispatchKeyDown('a');
            dispatchKeyDown('a');
            const triggers = events.filter(e => e.type === 'trigger');
            expect(triggers).toHaveLength(1);
        });
    });
    describe('keyup events', () => {
        it('should emit release event on keyup', () => {
            dispatchKeyDown('a');
            dispatchKeyUp('a');
            expect(events).toHaveLength(2);
            expect(events[1]).toEqual({
                type: 'release',
                key: 'a',
                source: 'keyboard'
            });
        });
        it('should convert key to lowercase', () => {
            dispatchKeyDown('B');
            dispatchKeyUp('B');
            expect(events[1].key).toBe('b');
        });
    });
    describe('emitUpdates', () => {
        it('should emit update events for all active keys', () => {
            dispatchKeyDown('a');
            dispatchKeyDown('b');
            events = []; // Clear initial triggers
            source.emitUpdates();
            expect(events).toHaveLength(2);
            expect(events.every(e => e.type === 'update')).toBe(true);
            expect(events.map(e => e.key)).toContain('a');
            expect(events.map(e => e.key)).toContain('b');
        });
        it('should not emit updates when no keys are active', () => {
            source.emitUpdates();
            expect(events).toHaveLength(0);
        });
        it('should not emit update for released keys', () => {
            dispatchKeyDown('a');
            dispatchKeyUp('a');
            events = [];
            source.emitUpdates();
            expect(events).toHaveLength(0);
        });
    });
    describe('getState', () => {
        it('should return empty state initially', () => {
            const state = source.getState();
            expect(state.singleInputs.activeInputs.size).toBe(0);
        });
        it('should track active inputs', () => {
            dispatchKeyDown('a');
            dispatchKeyDown('b');
            const state = source.getState();
            expect(state.singleInputs.activeInputs.has('a')).toBe(true);
            expect(state.singleInputs.activeInputs.has('b')).toBe(true);
        });
        it('should remove released inputs', () => {
            dispatchKeyDown('a');
            dispatchKeyUp('a');
            const state = source.getState();
            expect(state.singleInputs.activeInputs.has('a')).toBe(false);
        });
        it('should have empty axesInputs', () => {
            const state = source.getState();
            expect(state.axesInputs.size).toBe(0);
        });
    });
    describe('destroy', () => {
        it('should stop listening to events after destroy', () => {
            source.destroy();
            dispatchKeyDown('a');
            expect(events).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=keyboard-source.test.js.map