<template>
  <div class="mainRoot">
    <v-app-bar flat class="header">
      <v-app-bar-nav-icon>
        <v-icon color="accent">$vuetify.icons.logoInverted</v-icon>
      </v-app-bar-nav-icon>
      <!-- <v-spacer />
      <v-toolbar-title class="white--text feedTitle text-uppercase">{{$t("more")}}</v-toolbar-title> -->
    </v-app-bar>

    <v-container fluid class="content" pa-5>
      <v-row v-if="!$store.state.flavorStatic">
        <v-col>
          <div class="black--text settingsCategory">{{ $t("service") }}</div>
        </v-col>
      </v-row>
      <v-row v-if="!$store.state.flavorStatic" class="pa-2">
        <v-col class="language-item">
          <v-radio-group v-model="service">
            <v-radio
              v-for="service in services"
              :key="service.value"
              :label="service.name"
              :value="service.value"
              :class="service.value"
              :style="styleForService(service.value)"
            ></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div class="black--text settingsCategory">{{ $t("font_size") }}</div>
        </v-col>
      </v-row>
      <v-row class="pa-2">
        <v-col>
          <v-slider
            v-model="textSizeAdjustment"
            min="-100"
            max="100"
            step="25"
            ticks="always"
            tick-size="5"
          >
            <template v-slot:prepend>
              <span class="settingsSmallFontA">A</span>
            </template>

            <template v-slot:append>
              <span class="settingsLargeFontA">A</span>
            </template>
          </v-slider>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div class="appVersionText">{{ $root.appVersionString }}</div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import config from "../config";
import fontHelper from "../services/fonthelper";

export default {
  name: "More",
  activated() {
    var fonts = {};
    for (var flavor of Object.keys(config.flavors)) {
      if (config.flavors[flavor].fonts) {
        fonts = Object.assign(fonts, config.flavors[flavor].fonts);
      }
    }
    fontHelper.generateFontFaceImports(fonts, "fontsTemp");
  },
  deactivated() {
    // Remove
    fontHelper.generateFontFaceImports(null, "fontsTemp");
  },
  methods: {
    styleForService(svc) {
      const service = config.flavors[svc];
      return fontHelper.styleForFonts(service.fonts);
    },
  },
  computed: {
    services() {
      return Object.keys(config.flavors).map(function (key) {
        return { name: config.flavors[key].name, value: key };
      });
    },

    service: {
      get() {
        return this.$store.state.flavor;
      },
      set(val) {
        this.$logger.logLanguageSelect(val, true);
        this.$store.commit("setFlavor", val);
      },
    },

    textSizeAdjustment: {
      get() {
        return this.$store.state.textSizeAdjustment;
      },
      set(val) {
        this.$store.commit("setTextSizeAdjustment", val);
        this.$logger.logTextSizeSelect(val);
      },
    },
  },

  watch: {
    $route: function (to, ignoredFrom) {
      if (this.thisRouteName == to.name) {
        console.log("More Shown");
      }
    },
  },
};
</script>

<style scoped>
@import url("../assets/css/item-style.css");
@import url("../assets/css/shared-styles.css");

.mainRoot {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  position: absolute;
}
.header {
  height: 60px;
  background-color: var(--v-accent-base) !important;
}

.content {
  width: 100%;
  height: calc(100% - 60px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}
</style>
