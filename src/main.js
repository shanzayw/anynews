import '@babel/polyfill'
import Vue from 'vue'
import './plugins/axios'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import i18n from './lang'
import logger from './defaultlogger'
import db from './database'
import VueViewer from 'v-viewer'
import native from './plugins/native';
Vue.config.productionTip = false

let deferredPWAInstallPrompt = null;
let hasShownPWAInstallPrompt = false;

Vue.use(native);

window.logger = logger;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log("Got before install prompt!");
  // Prevent Chrome 76 and later from showing the mini-infobar
  e.preventDefault();
  if (!hasShownPWAInstallPrompt) {
    // Stash the event so it can be triggered later.
    deferredPWAInstallPrompt = e;
  }
});

// Make sure Array.isArray is defined
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

// Register a global custom directive called `v-blur` that prevents focus
Vue.directive('blur', {
  inserted: function (el) {
    el.onfocus = (ev) => ev.target.blur()
  }
});

Vue.directive('renderToId', {
  componentUpdated: function (el, binding, ignoredVnode) {
    ignoredVnode.context.$nextTick(() => {
      console.log("renderToId update:" + binding.arg + " Value: " + binding.value);
      var container = (binding.value != "")
        ? document.getElementById(binding.value)
        : null
      if (container != null) {
        container.appendChild(el);
      } else if (container == null && binding != "" && binding != null) {
        console.error("renderToId: did not find render node!");
      }
    });
  },
  unbind: function (el) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }
})

router.beforeEach((to, from, next) => {
  //console.log("Before router redir " + store.state.onboarded);
  if (store.state.onboarded) {
    if (deferredPWAInstallPrompt != null) {
      hasShownPWAInstallPrompt = true;
      deferredPWAInstallPrompt.prompt();
      deferredPWAInstallPrompt = null;
    }

    // If going home, check if we have logs from service worker. Send those here in that case.
    if (to.name == "home") {
      db.getSWLogs().then(logs => {
        for (var i in logs) {
          const log = logs[i];
          if (log.type == "fetch_error") {
            logger.logFetchError(log.url);
          }
        }
      }).then(() => {
        db.clearSWLogs();
      });
    }

    if (to.name == "home" && document.pendingAppUpdate && document.pendingAppUpdate.waiting) {
      console.log("WE HAVE WAITING UPDATE, so enable that now.");
      document.pendingAppUpdate.waiting.postMessage({ type: "SKIP_WAITING" });
      delete document.pendingAppUpdate;
      next(false);
      window.location.replace(to.fullPath);
    } else {
      next();
    }
  } else if (to.path.startsWith("/onboarding")) {
    next();
  } else {
    // Not onboarded, redirect!
    console.log("Redirect to onboarding");
    next({
      path: '/onboarding',
      params: { nextUrl: to.fullPath }
    })
  }
})

// Log page view event
router.afterEach((to, ignoredFrom) => {
  logger.logPageView(to.name);
})

// Log app crashes
Vue.config.errorHandler = ignoredErr => {
  console.log(ignoredErr);
  logger.logAppError();
};

Vue.use(VueViewer);

Vue.instance = new Vue({
  router,
  store,
  i18n,
  logger,
  native,
  render: function (h) {
    let instance = h(App);
    this.appInstance = instance;
    return instance;
  },
  vuetify,
  data() {
    return {
      appVersionString: process.env.PACKAGE_VERSION || '',
      appInstance: App,
      mediaPlayer: {},
      mediaPlayerItem: null,
      mediaPlayerItemRoute: null,
      mediaPlayerDocked: false,
      mediaShowList: false
    }
  },
  watch: {
    mediaShowList() {
      this.$emit("mediaShowListChanged");
    },
    '$store.state.fullScreenItems'(value, oldValue) {
      if (oldValue == null && value != null) {
        // Start full screen view.
        //console.log("ENTER FULL SCREEN!!!");
        // Push a history entry so that native back button works as expected!
        history.pushState({ page: 'fullscreen' }, 'Full screen');
      } else if (oldValue != null && value == null) {
        //console.log("EXIT FULL SCREEN!!!");
        // Pop full screen from history stack
        const state = history.state || {};
        if (state.page !== undefined) {
          history.go(-1);
        }
      }
    },
    '$store.state.showingFullScreenVideo'(value, oldValue) {
      if (!oldValue && value) {
        // Start full screen video view.
        //console.log("ENTER FULL SCREEN VIDEO!!!");
        // Push a history entry so that native back button works as expected!
        history.pushState({ page: 'video' }, 'Full screen video');
      } else if (oldValue && !value) {
        //console.log("EXIT FULL SCREEN VIDEO!!!");
        // Pop full screen from history stack
        const state = history.state || {};
        if (state.page !== undefined) {
          history.go(-1);
        }
      }
    }
  },
  mounted() {
    window.addEventListener('popstate', () => {
      // If popping and in full screen video mode, just close that!
      if (this.$store.state.showingFullScreenVideo) {
        this.$store.commit("showingFullScreenVideo", false);
      }
      // If popping and in full screen mode, just close that!
      if (this.$store.state.fullScreenItems != null) {
        this.$store.commit("setFullScreenItems", { items: null, activeIndex: -1 });
      }
    });
    window.addEventListener('orientationchange', () => {
      this.updateOrientation();
    });
    window.addEventListener('beforeunload', this.beforeUnload);
    this.updateOrientation();
  },
  computed: {
    onboarded: {
      get: function () {
        return this.$store.state.onboarded;
      },
      set: function (val) {
        this.$store.commit("onboarded", val);
      }
    },
    showMedia: {
      get: function () {
        return this.$store.state.showMedia;
      },
      set: function (val) {
        this.$store.commit("showMedia", val);
      }
    }
  },
  methods: {
    setMediaItem(item) {
      if (item != this.mediaPlayerItem) {
        this.mediaPlayerItem = item;
        this.mediaPlayerItemRoute = this.$router.currentRoute;
      }
    },
    clearMediaItem() {
      this.mediaPlayerItem = null;
    },
    updateOrientation() {
      if (!this.$vuetify.breakpoint.mobile) {
        this.$store.commit("setLandscapeMode", false);
      } else if (window.screen.orientation !== undefined) {
        const { type } = window.screen.orientation;
        this.$store.commit("setLandscapeMode", !type.startsWith("portrait"));
      } else {
        this.$store.commit("setLandscapeMode", Math.abs(window.orientation) === 90);
      }
      //console.log("Is landscape mode: " + this.$store.state.isLandscapeMode);
    },
    beforeUnload() {
      this.$logger.logAppExit();
    }
  }
}).$mount('#app')

