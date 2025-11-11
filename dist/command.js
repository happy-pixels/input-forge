export class Command {
    trigger(_value) { }
    update(_value) { }
    release() { }
}
export class AxesCommand extends Command {
    trigger(_value) { }
    update(_value) { }
}
export class TickCommand extends Command {
    tick(_delta) { }
}
//# sourceMappingURL=command.js.map