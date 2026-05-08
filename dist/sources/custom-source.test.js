import { describe, it, expect, beforeEach } from 'vitest';
import { CustomSource } from './custom-source';
describe('CustomSource', () => {
    let source;
    let singleEvents;
    let axesEvents;
    beforeEach(() => {
        source = new CustomSource();
        singleEvents = [];
        axesEvents = [];
        source.singleInputEvent$.subscribe((event) => {
            singleEvents.push(event);
        });
        source.axesInputEvent$.subscribe((event) => {
            axesEvents.push(event);
        });
    });
    describe('triggerInput', () => {
        it('should emit trigger event with key', () => {
            source.triggerInput('my_key');
            expect(singleEvents).toHaveLength(1);
            expect(singleEvents[0]).toEqual({
                type: 'trigger',
                key: 'my_key',
                source: 'custom'
            });
        });
        it('should not emit event for empty key', () => {
            source.triggerInput('');
            expect(singleEvents).toHaveLength(0);
        });
        it('should not emit event for whitespace-only key', () => {
            source.triggerInput('   ');
            expect(singleEvents).toHaveLength(0);
        });
    });
    describe('updateInput', () => {
        it('should emit update event with key', () => {
            source.updateInput('my_key');
            expect(singleEvents).toHaveLength(1);
            expect(singleEvents[0]).toEqual({
                type: 'update',
                key: 'my_key',
                source: 'custom'
            });
        });
        it('should not emit event for empty key', () => {
            source.updateInput('');
            expect(singleEvents).toHaveLength(0);
        });
        it('should not emit event for whitespace-only key', () => {
            source.updateInput('   ');
            expect(singleEvents).toHaveLength(0);
        });
    });
    describe('releaseInput', () => {
        it('should emit release event with key', () => {
            source.releaseInput('my_key');
            expect(singleEvents).toHaveLength(1);
            expect(singleEvents[0]).toEqual({
                type: 'release',
                key: 'my_key',
                source: 'custom'
            });
        });
        it('should not emit event for empty key', () => {
            source.releaseInput('');
            expect(singleEvents).toHaveLength(0);
        });
        it('should not emit event for whitespace-only key', () => {
            source.releaseInput('   ');
            expect(singleEvents).toHaveLength(0);
        });
    });
    describe('triggerAxesInput', () => {
        it('should emit trigger event with axes object', () => {
            source.triggerAxesInput('stick', { x: 0.5, y: -0.5 });
            expect(axesEvents).toHaveLength(1);
            expect(axesEvents[0]).toEqual({
                type: 'trigger',
                name: 'stick',
                axes: { x: 0.5, y: -0.5 },
                source: 'custom'
            });
        });
        it('should emit trigger event with axes tuple', () => {
            source.triggerAxesInput('stick', [0.5, -0.5]);
            expect(axesEvents).toHaveLength(1);
            expect(axesEvents[0]).toEqual({
                type: 'trigger',
                name: 'stick',
                axes: { x: 0.5, y: -0.5 },
                source: 'custom'
            });
        });
        it('should not emit event for empty name', () => {
            source.triggerAxesInput('', { x: 0, y: 0 });
            expect(axesEvents).toHaveLength(0);
        });
    });
    describe('updateAxesInput', () => {
        it('should emit update event with axes', () => {
            source.updateAxesInput('stick', { x: 1, y: 0 });
            expect(axesEvents).toHaveLength(1);
            expect(axesEvents[0]).toEqual({
                type: 'update',
                name: 'stick',
                axes: { x: 1, y: 0 },
                source: 'custom'
            });
        });
        it('should normalize tuple input', () => {
            source.updateAxesInput('stick', [0.25, 0.75]);
            expect(axesEvents[0].axes).toEqual({ x: 0.25, y: 0.75 });
        });
        it('should not emit event for empty name', () => {
            source.updateAxesInput('', { x: 0, y: 0 });
            expect(axesEvents).toHaveLength(0);
        });
    });
    describe('releaseAxesInput', () => {
        it('should emit release event with zero axes', () => {
            source.releaseAxesInput('stick');
            expect(axesEvents).toHaveLength(1);
            expect(axesEvents[0]).toEqual({
                type: 'release',
                name: 'stick',
                axes: { x: 0, y: 0 },
                source: 'custom'
            });
        });
        it('should not emit event for empty name', () => {
            source.releaseAxesInput('');
            expect(axesEvents).toHaveLength(0);
        });
    });
    describe('getState', () => {
        it('should return empty state', () => {
            const state = source.getState();
            expect(state.singleInputs.activeInputs.size).toBe(0);
            expect(state.singleInputs.pendingTriggers).toHaveLength(0);
            expect(state.singleInputs.pendingReleases).toHaveLength(0);
            expect(state.axesInputs.size).toBe(0);
        });
    });
    describe('destroy', () => {
        it('should not throw when called', () => {
            expect(() => source.destroy()).not.toThrow();
        });
        it('should be callable multiple times', () => {
            source.destroy();
            expect(() => source.destroy()).not.toThrow();
        });
    });
});
//# sourceMappingURL=custom-source.test.js.map