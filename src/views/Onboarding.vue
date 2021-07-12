<template>
  <v-content>
    <div>
      <h3>Onboarding</h3>
    </div>
    <div
      class="mt-2 mb-0 ml-4 mr-4 language-item"
      v-for="service in services"
      :key="service.value"
    >
      <v-btn
        block
        :color="selected == service.value ? 'accent' : '#efefef'"
        @click="selected = service.value"
        :class="service.value"
        :style="styleForService(service.value)"
        >{{ service.name }}</v-btn
      >
    </div>
    <div class="ma-4">
      <v-btn block color="primary" @click="useConfig(selected)">{{
        $t("GO")
      }}</v-btn>
    </div>
  </v-content>
</template>

<script>
import config from "../config";
import fontHelper from "../services/fonthelper";

export default {
  name: "Onboarding",
  data() {
    return {
      selected: "default",
    };
  },
  mounted() {
    var fonts = {};
    for (var flavor of Object.keys(config.flavors)) {
      // Select any by default (based on browser language)?
      var defaultForLanguages = config.flavors[flavor].defaultForLanguages;
      if (defaultForLanguages) {
        for (var langPrefix of defaultForLanguages) {
          if (this.language.startsWith(langPrefix)) {
            this.selected = flavor;
            break;
          }
        }
      }

      // Any fonts needed?
      if (config.flavors[flavor].fonts) {
        fonts = Object.assign(fonts, config.flavors[flavor].fonts);
      }
    }
    fontHelper.generateFontFaceImports(fonts, "fontsTemp");
  },
  computed: {
    services() {
      return Object.keys(config.flavors).map(function (key) {
        return { name: config.flavors[key].name, value: key };
      });
    },
    language: function () {
      var lang = navigator.language || navigator.userLanguage;
      return lang.toLowerCase();
    },
  },
  methods: {
    styleForService(svc) {
      const service = config.flavors[svc];
      return fontHelper.styleForFonts(service.fonts);
    },

    useConfig(config) {
      this.$logger.logFlavorSelect(config, false);
      this.$store.commit("setFlavor", config);
      this.done();
    },

    done() {
      this.$root.onboarded = true;
      this.$root.$router.replace("/");
    },
  },
};
</script>

<style scoped>
@import url("../assets/css/item-style.css");
</style>