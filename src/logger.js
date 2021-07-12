import Vue from 'vue';
import config from './config.js';
import EmptyLogger from "./loggers/empty.js"

function getLogger(type, config) {
  var loggers = {}
  function importAllLoggers(r) {
    return r.keys().map(res => {
      // Remove"./"
      const parts = res.split("/");
      const name = parts[1].split(".")[0];
      loggers[name] = r(res);
    });
  }
  importAllLoggers(require.context('@/loggers/', true, /\.js$/));
  if (loggers[type]) {
    return new loggers[type].default(config);
  }
  return new EmptyLogger();
}


const analytics = config.analytics || {};
const loggerImpl = analytics.enabled ? getLogger(analytics.type, analytics.config || {}) : new EmptyLogger();
const loggerImplPlugin = {}
loggerImplPlugin.install = function (Vue, ignoredOptions) {
  Vue.prototype.$logger = loggerImpl;

  Vue.mixin({
    mounted: function () {
      // Store the VUE instance root in our own $root variable.
      loggerImpl.$root = this.$root;
    }
  })
}

Vue.use(loggerImplPlugin);

export default loggerImpl;