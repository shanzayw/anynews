// eslint-disable-next-line
import ItemModel from "./models/itemmodel";
import Logger from "./logger";

/**
 * Base class for logging.
 */
export default class ConsoleLogger extends Logger {
    constructor() {
        super();
        let proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
        let functions = Object.getOwnPropertyNames(proto).filter(item => typeof this[item] === 'function' && item !== 'constructor');
        for (const f of functions) {
            this[f] = function() {
                console.log(f + ":",...arguments);
            }
        }
    }
}
