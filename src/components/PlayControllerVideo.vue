<template>
  <div ref="playerRoot" :class="{'playerRoot':true,'fullscreen':showVideoFullscreen}">
    <div class="playerContainer" style="overflow: hidden; background-color:black">
      <!-- VIDEO PLAYER -->
      <div
        class="player text-center"
        :id="playerId"
        @click.stop="showHideOverlayControls"
      />
    </div>

    <transition name="fade">
      <div class="overlayControls" v-show="showOverlayControls">
        <!-- TOP PART - MINIMIZE AND CLOSE BUTTONS -->
        <v-btn
          text
          icon
          color="white"
          @click="minimize()"
          ma-2
          pa-2
          class="tiny-button"
          style="position: absolute; left: 10px; top: 10px"
          v-show="showCloseMinimizeButtons && !showVideoFullscreen && !alwaysFullscreen"
        >
          <v-icon class="small">$vuetify.icons.collapse</v-icon>
        </v-btn>
        <!-- Size up -->
        <v-btn
          text
          icon
          color="white"
          @click="sizeUp()"
          ma-2
          pa-2
          class="tiny-button"
          style="position: absolute; right: 44px; top: 10px"
          v-show="showCloseMinimizeButtons && !showVideoFullscreen"
        >
          <v-icon class="medium">$vuetify.icons.fullscreen</v-icon>
        </v-btn>
        <!-- Size down -->
        <v-btn
          text
          icon
          color="white"
          @click="sizeDown()"
          ma-2
          pa-2
          class="tiny-button"
          style="position: absolute; right: 44px; top: 10px"
          v-show="showCloseMinimizeButtons && showVideoFullscreen && !alwaysFullscreen"
        >
          <v-icon class="medium">$vuetify.icons.fullscreenExit</v-icon>
        </v-btn>
        <v-btn
          text
          icon
          color="white"
          @click="close()"
          ma-2
          pa-2
          class="tiny-button"
          style="position: absolute; right: 10px; top: 10px"
          v-show="showCloseMinimizeButtons"
        >
          <v-icon class="small">$vuetify.icons.close</v-icon>
        </v-btn>

        <!-- MIDDLE PART - REPLAY, PLAY AND SKIP -->
        <v-container fluid fill-height pa-0 ma-0 class="ltr">
          <v-row class="ma-0 pa-0" align="center" justify="center">
            <v-btn
              v-show="!isLive && !isErrored"
              text
              icon
              color="white"
              @click="$root.mediaPlayer.replay10()"
              class="ma-0 pa-0 large-button"
            >
              <v-icon size="40">$vuetify.icons.replay10</v-icon>
            </v-btn>
            <v-btn
              v-show="!$root.mediaPlayer.isPlaying && !isErrored"
              text
              icon
              color="white"
              @click="$root.mediaPlayer.play()"
              class="ma-1 pa-0 x-large-button"
            >
              <v-icon size="48">$vuetify.icons.play</v-icon>
            </v-btn>
            <v-btn
              v-show="$root.mediaPlayer.isPlaying && !isErrored"
              text
              icon
              color="white"
              @click="$root.mediaPlayer.pause()"
              class="ma-1 pa-0 x-large-button"
            >
              <v-icon size="48">$vuetify.icons.pause</v-icon>
            </v-btn>
            <v-btn
              v-show="!isLive && !isErrored"
              text
              icon
              color="white"
              @click="$root.mediaPlayer.forward10()"
              class="ma-0 pa-0 large-button"
            >
              <v-icon size="40">$vuetify.icons.forward10</v-icon>
            </v-btn>
          </v-row>
        </v-container>

        <!-- BOTTOM PART - PROGRESS -->
        <v-slider
          ref="slider"
          v-show="!showVideoFullscreen && !isErrored"
          height="4px"
          hide-details
          color="green lighten-1"
          class="progress ma-0 pa-0"
          background-color="transparent"
          track-color="green lighten-5"
          track-fill-color="green lighten-1"
          style="background-color:transparent;position: relative; top: -8px"
          v-on:start="draggingSlider = true; enableOverlayControlsTimeout(false)"
          v-on:end="draggingSlider = false; enableOverlayControlsTimeout(true)"
          v-bind="!draggingSlider ? { value: $root.mediaPlayer == null ? 0 : $root.mediaPlayer.currentPlayPercentage} : {}"
          :readonly="isLive"
          step="0"
          max="10000"
          v-on:change="$root.mediaPlayer.seekToPercentage($event)"
        />
      </div>
    </transition>

    <!-- LOAD ERROR CONTAINER -->
    <v-container
      class="overlayControls text-center"
      style="pointer-events: none"
      fill-height
      fluid
      v-if="isErrored"
    >
      <v-row align="center" justify="center">
        <v-col>
          <div class="storyText" style="color:white">{{ $t('media_failed_to_load') }}</div>
        </v-col>
      </v-row>
    </v-container>

  </div>
</template>

<script>
import PlayControllerBase from "./PlayControllerBase";

export default {
  extends: PlayControllerBase,
  props: {
    playerId: {
      type: String,
      default: function() {
        return "videoPlaceholderController"
      }
    },
    showCloseMinimizeButtons: {
      type: Boolean,
      default: function() {
        return true;
      }
    }
  },
  data() {
    return {
    };
  },
  watch: {
    '$store.state.showingFullScreenVideo'(value, ignoredOldValue) {
      if (!value && this.$store.state.isLandscapeMode) {
        // If landscape and exit full screen, that means "close".
        this.close();
      }
    }
  },
  mounted() {
    // Hardcode slider to LTR
    this.$refs.slider.$vuetify = {};
    this.storeWatchObject = this.$store.watch(
      state => state.isLandscapeMode,
      (newValue, ignoredOldValue) => {
        console.log("Detected orientation change in PlayControllerVideo");
        if (newValue == true) {
          // If landscape, set full screen always
          this.$store.commit("showingFullScreenVideo", true);
        }
      }
    );
    if (this.$store.state.isLandscapeMode) {
      this.$store.commit("showingFullScreenVideo", true);
    }
  },

  destroyed() {
    if (this.storeWatchObject != null) {
      this.storeWatchObject();
      this.storeWatchObject = null;
    }
    this.$store.commit("showingFullScreenVideo", false);
  },
  computed: {
    alwaysFullscreen() {
      return this.$store.state.isLandscapeMode;
    },
    showVideoFullscreen() {
      return (
        this.$root.mediaPlayerItem != null &&
        this.$root.mediaPlayerItem.hasVideoAttachment() &&
        !this.$root.mediaPlayerDocked &&
        this.$store.state.showingFullScreenVideo
      );
    }
  },
  methods: {
    update() {
      PlayControllerBase.methods.update.call(this);
    },
    close() {
      this.$store.commit("showingFullScreenVideo", false);
      PlayControllerBase.methods.close.call(this);
      this.$root.mediaPlayer.hidden = true;
    },
    sizeUp() {
      this.$store.commit("showingFullScreenVideo", true);
    },
    sizeDown() {
      this.$store.commit("showingFullScreenVideo", false);
    }
  }
};
</script>

<style scoped>

.ltr {
  direction: ltr;
} 

.playerRoot {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0; /*var(--v-video-player-height);*/
  z-index: 30;
  transition: 0.3s;
  overflow: hidden;
}

.playerContainer,
.overlayControls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.player {
  min-height: 0;
  min-width: 0;
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
}

.playerRoot.fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  z-index: 966;
  padding-bottom: initial;
}

.overlayControls {
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 950;
}

.v-btn {
  min-width: 0;
  padding: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.image {
  width: 65px;
  height: 65px;
  object-fit: cover;
}

.itemLiveMarker {
  border-radius: 3px;
  padding: 2px 8px 2px 8px;
  color: white;
  font-family: var(--v-theme-font);
  font-size: calc(0.8 * var(--v-theme-font-size));
  line-height: calc(0.8 * var(--v-theme-line-height));
}

.itemLiveMarkerIcon {
  font-size: calc(0.8 * var(--v-theme-font-size)) !important;
  line-height: calc(0.8 * var(--v-theme-line-height)) !important;
  vertical-align: middle;
  padding-bottom: 2px;
}
</style>

<style>
.player video {
  height: 100%;
  width: 100%;
  overflow: hidden;
  object-fit: contain;
}
</style>
