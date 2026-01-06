import { CommandResolver } from './command-resolver';
export class InputMapStack {
    stack = [];
    resolver = new CommandResolver();
    singleInputCache = new Map();
    axesInputCache = new Map();
    keyboardAxesCache = new Map();
    tickCommandsCache = null;
    push(inputMap) {
        this.stack.push(inputMap);
        this.invalidateCache();
    }
    set(inputMap) {
        this.stack = [inputMap];
        this.invalidateCache();
    }
    pop() {
        const popped = this.stack.pop();
        if (popped) {
            this.invalidateCache();
        }
    }
    has(id) {
        return this.stack.some((map) => map.id === id);
    }
    remove(id) {
        const initialLength = this.stack.length;
        this.stack = this.stack.filter((map) => map.id !== id);
        if (this.stack.length !== initialLength) {
            this.invalidateCache();
        }
    }
    getCurrentId() {
        const current = this.stack.at(-1);
        return current ? current.id : null;
    }
    getCurrent() {
        return this.stack.at(-1) || null;
    }
    isEmpty() {
        return this.stack.length === 0;
    }
    getCommandsForSingleInput(key) {
        if (this.isEmpty()) {
            return [];
        }
        if (this.singleInputCache.has(key)) {
            return this.singleInputCache.get(key);
        }
        const currentMap = this.getCurrent();
        const commands = this.resolver.resolveSingleInput(currentMap, key);
        this.singleInputCache.set(key, commands);
        return commands;
    }
    getCommandsForAxesInput(name) {
        if (this.isEmpty()) {
            return [];
        }
        if (this.axesInputCache.has(name)) {
            return this.axesInputCache.get(name);
        }
        const currentMap = this.getCurrent();
        const commands = this.resolver.resolveAxesInput(currentMap, name);
        this.axesInputCache.set(name, commands);
        return commands;
    }
    getAxesCommandsForKey(key) {
        if (this.isEmpty()) {
            return [];
        }
        if (this.keyboardAxesCache.has(key)) {
            return this.keyboardAxesCache.get(key);
        }
        const currentMap = this.getCurrent();
        const commands = this.resolver.resolveKeyboardAxesInput(currentMap, key);
        this.keyboardAxesCache.set(key, commands);
        return commands;
    }
    getTickCommands() {
        if (this.isEmpty()) {
            return [];
        }
        if (this.tickCommandsCache !== null) {
            return this.tickCommandsCache;
        }
        const currentMap = this.getCurrent();
        const commands = this.resolver.resolveTickCommands(currentMap);
        this.tickCommandsCache = commands;
        return commands;
    }
    invalidateCache() {
        this.singleInputCache.clear();
        this.axesInputCache.clear();
        this.keyboardAxesCache.clear();
        this.tickCommandsCache = null;
    }
    clear() {
        this.stack = [];
        this.invalidateCache();
    }
}
//# sourceMappingURL=input-map-stack.js.map