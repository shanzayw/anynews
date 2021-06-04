import Vue from 'vue';
import Logger from "./logger"
import ConsoleLogger from "./consolelogger";

const defaultLogger = (process.env.NODE_ENV === 'development') ? new ConsoleLogger() : new Logger();
const defaultLoggerPlugin = {}
defaultLoggerPlugin.install = function (Vue, ignoredOptions) {
  Vue.prototype.$logger = defaultLogger;

  Vue.mixin({
    mounted: function () {
      // Store the VUE instance root in our own $root variable.
      defaultLogger.$root = this.$root;
    }
  })
}

Vue.use(defaultLoggerPlugin);

export default defaultLogger;