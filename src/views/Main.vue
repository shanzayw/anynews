<template>
  <div>
    <div
      :class="{
        contentView: true,
        contentViewOverflowing: $store.state.fullScreenItems != null,
      }"
      style="z-index: 3"
    >
      <transition :name="transitionName">
        <keep-alive>
          <router-view :key="'view_' + $route.name" />
        </keep-alive>
      </transition>
    </div>

    <DockedPlayer
      :item="$root.mediaPlayerItem"
      :itemRoute="$root.mediaPlayerItemRoute"
      v-if="$root.mediaPlayerDocked"
      v-on:close="onCloseDockedPlayer()"
      v-on:maximize="onMaximizeDockedPlayer($event)"
    />

    <SharedMediaPlayer :item="$root.mediaPlayerItem" />

    <v-bottom-navigation
      fixed
      height="60px"
      width="100%"
      style="z-index: 2"
      class="navigationBar text-center"
      color="accent"
      mandatory
      grow
    >
      <v-btn
        v-blur
        class="navButton"
        :to="{ name: 'home' }"
        @click="logNav('home')"
      >
        <v-icon v-blur>$vuetify.icons.logo</v-icon>
      </v-btn>
      <v-btn
        v-if="showCategoriesTab"
        v-blur
        class="navButton"
        to="categories"
        @click="logNav('categories')"
      >
        <v-icon>$vuetify.icons.categories</v-icon>
      </v-btn>
      <v-btn v-blur class="navButton" to="saved" @click="logNav('saved')">
        <v-icon>$vuetify.icons.favorites</v-icon>
      </v-btn>
      <v-btn v-blur class="navButton" to="more" @click="logNav('more')">
        <v-icon>$vuetify.icons.more</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import SharedMediaPlayer from "../components/SharedMediaPlayer";
import DockedPlayer from "../components/DockedPlayer";
import config from "../config";

export default {
  name: "Main",
  components: {
    SharedMediaPlayer,
    DockedPlayer,
  },
  data() {
    return {
      transitionName: null,
    };
  },
  computed: {
    showCategoriesTab() {
      if (!config.enableCategories) {
        return false;
      }
      var flavor = config.flavors[this.$store.state.flavor || "default"];
      console.log("Flavor", flavor);
      return flavor.categories && flavor.categories.length > 0;
    },
  },
  watch: {
    $route(to, from) {
      const toDepth = to.meta.tab || 0;
      const fromDepth = from.meta.tab || 0;
      this.transitionName = toDepth < fromDepth ? "slide-left" : "slide-right";
      if (!to.query || !to.query.nodockplayer) {
        this.$root.mediaShowList = false;
      }
    },
  },

  methods: {
    logNav(page) {
      this.$logger.logNavigation(page);
    },

    onCloseDockedPlayer() {
      console.log("onCloseDockedPlayer");
      this.$logger.logClosePlayer(
        this.$root.mediaPlayerItem,
        this.$root.mediaPlayerItem != null &&
          this.$root.mediaPlayerItem.hasVideoAttachment()
          ? "video"
          : "audio"
      );
      this.$root.clearMediaItem();
      this.$root.mediaShowList = false;
      this.$root.mediaPlayerDocked = false;
    },

    onMaximizeDockedPlayer(event) {
      // If full screen mode, close that to show list with currently playing
      if (this.$store.state.fullScreenItems != null) {
        this.$store.commit("setFullScreenItems", {
          items: null,
          activeIndex: -1,
        });
      }

      const { itemRoute } = event;
      this.$root.mediaShowList = true;
      this.$root.mediaPlayerDocked = false;
      this.$router
        .replace({ name: itemRoute.name, query: { nodockplayer: true } })
        .catch((ignoredErr) => {});
    },
  },
};
</script>

<style scoped>
@import url("../assets/css/item-style.css");
@import url("../assets/css/shared-styles.css");

.contentView {
  position: fixed;
  top: 0px;
  left: 0px;
  bottom: 60px;
  right: 0px;
  overflow-y: hidden;
}

/* When doing full screen video, use whole screen */
.fullscreenVideo .contentView {
  bottom: 0px;
}

.contentViewOverflowing {
  overflow-y: visible !important;
}

.navigationBar {
  position: fixed;
  background-color: #fafafa;
}

.navButton {
  min-width: 10% !important;
}

.navButton.v-btn--active {
  color: var(--v-accent-base) !important;
}

.notificationIcon {
  display: inline-block;
  position: absolute;
  bottom: calc(50% + 8px);
  left: calc(50% + 8px);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: green;
}

.notificationIcon::after {
  content: "";
  position: absolute;
  top: calc(50% - 5px);
  left: calc(50% - 5px);
  border: 2px solid green;
  opacity: 0.5;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  animation: 10s sonar 1s 3;
}

@keyframes sonar {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  10% {
    transform: scale(2.5);
    opacity: 0;
  }
  19% {
    transform: scale(1);
    opacity: 0;
  }
  20% {
    transform: scale(1);
    opacity: 1;
  }
  30% {
    transform: scale(2.5);
    opacity: 0;
  }
  39% {
    transform: scale(1);
    opacity: 0;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(2.5);
    opacity: 0;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.5s;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-to {
  transform: translate(-100%, 0);
}

.slide-left-leave-to,
.slide-right-enter {
  transform: translate(100%, 0);
}
</style>
