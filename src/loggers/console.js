import BaseLogger from "./empty";

export default class ConsoleLogger extends BaseLogger {
    constructor(ignoredConfig) {
        super();
        let proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
        let functions = Object.getOwnPropertyNames(proto).filter(item => typeof this[item] === 'function' && item !== 'constructor');
        for (const f of functions) {
            this[f] = function () {
                console.log(f + ":", ...arguments);
            }
        }
    }
}
