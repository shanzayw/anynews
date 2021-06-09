<template>
  <v-app>

    <!-- TOAST FOR WHEN APP WAS UPDATED -->
    <v-snackbar
        v-model="showAppUpdatedToast"
        :timeout="showAppUpdatedToastTimeout"
        top
        @click="showAppUpdatedToast = false"
      >{{ $t('app_updated_to_version', { version: $root.appVersionString }) }}</v-snackbar>

    <router-view />

    <!-- If a process of some sort is ongoing (i.e. can be cancelled) show a progress spinner! -->
    <v-container
      v-if="processCancelCallback != null"
      fill-height
      fluid
      class="processingView white--text"
      @click="processCancelCallback"
    >
      <v-row align="center" justify="center">
        <v-container fluid class="white--text">
          <v-row align="center" justify="center">
            <div class="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </v-row>
          <v-row align="center" justify="center">
            <div class="processingText">{{processTitle}}</div>
          </v-row>
        </v-container>
      </v-row>
    </v-container>

    <Splash v-if="!serviceWorkerLoaded && !serviceWorkerFallbackLoaded" />
  </v-app>
</template>

<script>
import config from "./config";
import rssparser from "./services/rssparser";
import Printer from "./services/printer";
import MediaCache from "./mediacache";
import Splash from './views/Splash';
import fontHelper from './services/fonthelper';

const ProxyHandler = require('./services/proxy').default;

var pdfMake = require("pdfmake/build/pdfmake.js");

document.documentElement.style.setProperty("--v-scale-factor", 1);

// Make sure Array.isArray is defined
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}

if (!String.hashCode) {
  console.log("Defining a hash function");
  String.hashCode = function(str) {
    var hash = 0,
      i = 0,
      len = str.length;
    while (i < len) {
      hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
    }
    return hash + 2147483647 + 1;
  };
}

export default {
  name: "App",
  components: {
    Splash
  },
  mounted() {
    console.log("App mounted");
    if (this.$store.state.onboarded) {
      this.$logger.logAppLoad();
    } else {
      this.$logger.logAppFirstLoad();
    }
    this.$axios.onProxyChanged = function(newProxy) {  
      console.log("Proxy changed, store: " + newProxy);
      this.$store.commit("setCurrentProxy", newProxy);
    }.bind(this);
    const currentProxy = this.$store.state.currentProxy;
    console.log("Using current proxy at startup: " + currentProxy);
    ProxyHandler.setCurrentProxy(currentProxy);

    const self = this;
    this.storeWatchObject = this.$store.watch(
      state => state.flavor,
      (ignoredNewValue, ignoredOldValue) => {
        console.log("Flavor is changing");
        this.updateFlavor();
      }
    );
    this.storeWatchObjectTextSize = this.$store.watch(
      state => state.textSizeAdjustment,
      (newValue, ignoredOldValue) => {
        this.textSizeUpdated(newValue);
      }
    );
    this.storeWatchObjectFullScreenItemIndex = this.$store.watch(
      state => state.fullScreenItemIndex,
      (newValue, ignoredOldValue) => {
        if (newValue != -1) {
          const item = self.$store.state.fullScreenItems[newValue];
          this.$logger.logArticleView(item);
        }
      }
    );
    this.storeWatchFullScreenVideo = this.$store.watch(
      state => state.showingFullScreenVideo,
      (newValue, ignoredOldValue) => {
        if (newValue) {
          document.body.classList.add(["fullscreenVideo"]);
        } else {
          document.body.classList.remove(["fullscreenVideo"])
        }
      }
    );
    document.addEventListener("swUpdated", this.showAppUpdated);
    document.addEventListener("visibilitychange", this.visibilityChanged);
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', this.controllerChanged);
      if (navigator.serviceWorker.controller != null) {
        console.log("Service worker already controlling this page!")
        this.serviceWorkerLoaded = true;
      }
    } else {
      // No SW support! Need to change all incoming data to a proxy.
      console.log("No service worker support!");
      ProxyHandler.useStaticProxy = true;
      this.serviceWorkerFallbackLoaded = true;
      this.updateFlavor();
    }
    
    // Insert default font definition
    const roboto = {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Bold.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-BoldItalic.ttf"
    };
    fontHelper.generateFontFaceImports({Roboto: roboto}, "defaultFont");

    this.updateFlavor();
    this.textSizeUpdated(this.$store.state.textSizeAdjustment);
  },

  beforeDestroy() {
    document.removeEventListener("swUpdated", this.showAppUpdated);
    document.removeEventListener("visibilitychange", this.visibilityChanged);
    navigator.serviceWorker.removeEventListener('controllerchange', this.controllerChanged);
  },

  destroyed() {
    if (this.storeWatchObject != null) {
      this.storeWatchObject();
      this.storeWatchObject = null;
    }
    if (this.storeWatchObjectFullScreenItemIndex != null) {
      this.storeWatchObjectFullScreenItemIndex();
      this.storeWatchObjectFullScreenItemIndex = null;
    }
    if (this.storeWatchObjectTextSize != null) {
      this.storeWatchObjectTextSize();
      this.storeWatchObjectTextSize = null;
    }
    if (this.storeWatchFullScreenVideo != null) {
      this.storeWatchFullScreenVideo();
      this.storeWatchFullScreenVideo = null;
    }
  },

  data() {
    return {
      serviceWorkerLoaded: false,
      serviceWorkerFallbackLoaded: false,
      processCancelCallback: null,
      processTitle: "Working, please wait...",
      showAppUpdatedToast: false,
      showAppUpdatedToastTimeout: 5000
    };
  },

  methods: {
    visibilityChanged(ignoredEvent) {
      if (document.visibilityState === "visible") {
        this.refreshFeeds();
      }
    },
    controllerChanged(ignoredEvent) {
      console.log("Service worker controlling the page");
      this.serviceWorkerLoaded = true;
      this.updateFlavor();
    },
    showAppUpdated(ignoredEvent) {
      var newVersion = this.$root.appVersionString;
      var oldVersion = this.$store.state.currentAppVersion;
      this.$store.commit("setCurrentAppVersion", newVersion);
      if (oldVersion != null && newVersion != oldVersion) {
        // Log version updated
        this.$logger.logAppUpdated();
        this.showAppUpdatedToast = true;
      }
    },

    shareItem(item) {
      console.log("Share item: " + item.title);
      let link = item.link;
      if (link != null && link.startsWith("https://")) {
        console.log(item.link);
        if (navigator.share) {
          navigator
            .share({
              title: item.title,
              url: link
            })
            .then(() => {
              console.log("Thanks for sharing!");
            })
            .catch(console.error);
        } else {
          // fallback
        }
      }
    },

    shareItemFacebook(item) {
      let link = item.link;
      if (link != null && link.startsWith("https://")) {
        let fbLink = "https://www.facebook.com/sharer.php?u=" + encodeURI(link);
        console.log("Open new tab to: " + fbLink);
        window.open(fbLink, "_blank");
      }
    },

    blobToBase64(blob, callback) {
      var reader = new FileReader();
      reader.onload = function() {
        var dataUrl = reader.result;
        var base64 = dataUrl.split(",")[1];
        callback(base64);
      };
      reader.readAsDataURL(blob);
    },

    downloadMedia(item) {
      if (item.enclosure != null) {
        MediaCache.getMedia(item.enclosure, true, function(url) {
          const link = document.createElement("a");
          link.href = url;
          link.download = item.title || "Download";
          link.click();
          MediaCache.releaseMedia(url);
        }, function() {
          this.$logger.logArticleDownload(item, item.hasVideoAttachment() ? "video" : "audio");
        }.bind(this));
      }
    },

    printItem(item) {
      this.$logger.logArticleDownload(item, "article");

      var fonts;
      const flavor = config.flavors[this.$store.state.flavor];
      if (flavor && flavor.fonts) {
        fonts = JSON.parse(JSON.stringify(flavor.fonts)); // Make a copy!
      }
      fonts = fonts || {};
      var font = "Roboto";
      var fontKeys = Object.keys(fonts);
      if (fontKeys && fontKeys.length > 0) {
        font = fontKeys[0];
      }

      // Add fallback font
      fonts.Roboto = {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Bold.ttf",
        italics: "Roboto-Italic.ttf",
        bolditalics: "Roboto-BoldItalic.ttf"
      };

      // Transform all font paths to <website>/assets/fonts/<font>
      fontKeys = Object.keys(fonts);
        for (var key of fontKeys) {
          var fontObject = fonts[key];
          if (!fontObject.normal) {
            continue;
          }
          if (!fontObject.bold) {
            fontObject.bold = fontObject.normal;
          }
          if (!fontObject.italics) {
            fontObject.italics = fontObject.normal;
          }
          if (!fontObject.bolditalics) {
            fontObject.bolditalics = fontObject.bold;
          }
          var prefix = window.location.origin + window.location.pathname;
          prefix = prefix.substring(0, prefix.lastIndexOf("/"));
          prefix = prefix + "/assets/fonts/";
          for (var t of Object.keys(fontObject)) {
            fontObject[t] = prefix + fontObject[t];
          }
        }

      new Printer(item, function(docDefinition) {
          if (fonts != null) {
            for (const styleName in docDefinition.styles) {
              var style = docDefinition.styles[styleName];
              style.font = font;
            }
            docDefinition.defaultStyle = docDefinition.defaultStyle || {};
            Object.assign(docDefinition.defaultStyle, { font: "Roboto" });
          }
          // vfs = vfs || {};
          // Object.assign(vfs, pdfMake.vfs);
          docDefinition.info = {
            title: item.title
          };
          pdfMake
            .createPdf(docDefinition, null, fonts)
            .download(item.title + ".pdf");
        });
    },

    updateFlavor() {
      if (!this.$store.state.onboarded) {
        console.log("SET FLAVOR - Not yet onboarded!");
        return;
      }
      if (!this.serviceWorkerLoaded && !this.serviceWorkerFallbackLoaded) {
        console.log("SET FLAVOR - Service worker not loaded yet...");
        return;
      }
      console.log("SET FLAVOR TO " + this.$store.state.flavor);
      var flavor = config.flavors[this.$store.state.flavor];
      if (flavor === undefined) {
        flavor = config.flavors["default"];
      }

      // Set "locale" for translations. Basically the translation
      // file filename.
      this.$i18n.locale = flavor.translationKey;

      // Set RTL from config
      this.$vuetify.rtl = flavor.isRTL;

      // Insert font definitions
      fontHelper.generateFontFaceImports(flavor.fonts);

      // Insert language specific CSS file
      var cssFile =
        flavor.cssFile !== undefined
          ? flavor.cssFile
          : "./assets/css/default.css";
      var cssThemeLink = document.getElementById("cssThemeLink");
      if (cssThemeLink == null) {
        console.log("CSS link not found, creating!");
        cssThemeLink = document.createElement("link");
        cssThemeLink.id = "cssThemeLink";
        document.head.appendChild(cssThemeLink);
      } else {
        console.log("CSS link found, reusing");
      }
      cssThemeLink.rel = "stylesheet";
      cssThemeLink.type = "text/css";
      cssThemeLink.href = cssFile;

      //var WebFont = require("webfontloader");
      //WebFont.load(flavor.webFontConfig);

      // Stop playing
      this.$root.clearMediaItem();
      this.$root.mediaShowList = false;
      this.$root.mediaPlayerDocked = false;

      // Clear old items
      let service = flavor.services[0];
      this.$store.commit("setCurrentFeedTitle", "");
      this.$store.commit("setCurrentFeedItems", null);
      this.$store.commit(
        "clearCategories",
        (service.categories != null && config.enableCategories) ? service.categories.length : 0
      );

      this.refreshFeeds();
    },

    textSizeUpdated(adjustment) {
      let factor = 1 + ((adjustment > 0 ? 0.4 : 0.2) * adjustment) / 100;
      document.documentElement.style.setProperty("--v-scale-factor", factor);
    },

    refreshFeeds() {
      let flavor = config.flavors[this.$store.state.flavor];
      let service = flavor.services[0];

      const self = this;
      rssparser.fetchUrl(service.url, function(feed, items) {
        self.$store.commit("setCurrentFeedTitle", feed.title);
        self.$store.commit("setCurrentFeedItems", items);
        if (config.enableCategories && service.categories != null) {
          for (var i = 0; i < service.categories.length; i++) {
            const index = i;
            var category = service.categories[i];
            let url = category.url;
            rssparser.fetchUrl(url, function(feed, items) {
              //              var catTitle = feed.category;
              var catTitle = feed.title;
              if (catTitle == null || catTitle.length == 0) {
                catTitle = "Category " + (index + 1);
              }

              // Mark all items with this category!
              if (items != null) {
                for (var i = 0; i < items.length; i++) {
                  const item = items[i];
                  item.category = catTitle;
                }
              }

              self.$store.commit("addCategoryItems", {
                category: catTitle,
                index: index,
                feed: feed,
                items: items
              });
            });
          }
        }
      });
    }
  },

  computed: {
    flavorName() {
      return this.$store.state.flavor;
    }
  }
};
</script>

<style>
@import url("./assets/css/sizes.css");

body {
  -webkit-user-select: none;
}

.updateAvailable {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  background-color: rgba(243, 236, 169, 0.856);
  z-index: 90;
}

.updateAvailableTitle {
  font-size: 13px;
}

.updateAvailableSubTitle {
  font-size: 8px;
}

.processingView {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 100;
}

.processingContainer {
  height: 80%;
  width: 50%;
  margin: auto auto;
}

/* From https://loading.io/css/ */
.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
