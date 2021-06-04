<template>
  <div :class="{'playerRoot':true,'showMore':showMore}">
    <v-container fluid ma-0 pa-0>
      <v-layout column ma-0 pa-0 xs12>
        <!-- MINIMIZE AND CLOSE BUTTONS -->
        <v-flex ma-0 pa-0 pt-4 pb-4 xs2 class="overlayControls">
          <v-btn
            text
            icon
            color="black"
            @click="minimize()"
            ma-2
            pa-2
            class="tiny-button"
            style="position: absolute; left: 10px; top: 10px"
            v-show="showCloseMinimizeButtons"
          >
            <v-icon class="small">$vuetify.icons.collapse</v-icon>
          </v-btn>
          <v-btn
            text
            icon
            color="black"
            @click="close()"
            ma-2
            pa-2
            class="tiny-button"
            style="position: absolute; right: 10px; top: 10px"
            v-show="showCloseMinimizeButtons"
          >
            <v-icon class="small">$vuetify.icons.close</v-icon>
          </v-btn>
        </v-flex>

        <!-- ITEM IMAGE AND TEXT -->
        <v-flex ma-0 pa-0 pl-4 pr-4 xs4 v-if="item != null" class="overlayControls">
          <v-container fluid grid-list-sm pa-0 ma-0>
            <v-row no-gutters class="flex-nowrap">
              <v-col v-if="imageUrl != null" class="ma-0 pa-0"
                cols="auto"
              >
                  <v-img aspect-radio="1" :src="imageUrl" @error="$logger.logFetchError(imageUrl)" class="mr-2 ml-0 mt-0 mb-0 pa-0 image" />
              </v-col>
              <v-col 
                @click="itemClicked()"
                style="overflow-x:hidden"
                ml-2
                mr-2
                mt-0
                pt-0
              >
                <div>
                  <div v-if="isLive">
                    <span class="itemLiveMarker accent">
                      <v-icon
                        class="ma-0 pa-0 tiny"
                        style="padding-bottom: 2px !important"
                        small
                        color="white"
                      >$vuetify.icons.live</v-icon>LIVE
                    </span>
                  </div>
                  <DateView v-else class="date verticalCenter" :date="item.pubDate" />
                </div>
                <div
                  class="smallHeadline smallHeadline2lines line-clamp2lines"
                  style="text-overflow:ellipsis"
                >{{ itemTitle }}</div>

                <div v-if="showMore" style="margin-top: 8px;margin-right:10px" class="storyText noscale">
                  {{ itemDescription }}
                  </div>
                <div class="contentBlock mt-2">
                  <span class="storyText noscale" style="color: green" @click="showMore = !showMore" flat>{{ showMore ? $t('show_less') : $t('show_more') }}</span>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-flex>

        <!-- REPLAY, PLAY AND SKIP -->
        <v-flex ma-0 pa-0 pl-2 pr-2 xs3 shrink class="overlayControls ltr">
          <v-container fluid fill-height pa-0 ma-0>
            <v-row class="ma-0 pa-0" align="center" justify="center">
              <div v-if="isErrored" class="storyText" style="color:black">{{ $t('media_failed_to_load') }}</div>
              <v-btn
                v-if="!isLive && !isErrored"
                text
                icon
                color="black"
                @click="$root.mediaPlayer.replay10()"
                class="ma-0 pa-0 large-button"
              >
                <v-icon size="40">$vuetify.icons.replay10</v-icon>
              </v-btn>
              <v-btn
                v-if="!$root.mediaPlayer.isPlaying && !isErrored"
                text
                icon
                color="black"
                @click="$root.mediaPlayer.play()"
                class="ma-1 pa-0 x-large-button"
              >
                <v-icon size="48">$vuetify.icons.play</v-icon>
              </v-btn>
              <v-btn
                v-if="$root.mediaPlayer.isPlaying && !isErrored"
                text
                icon
                color="black"
                @click="$root.mediaPlayer.pause()"
                class="ma-1 pa-0 x-large-button"
              >
                <v-icon size="48">$vuetify.icons.pause</v-icon>
              </v-btn>
              <v-btn
                v-if="!isLive && !isErrored"
                text
                icon
                color="black"
                @click="$root.mediaPlayer.forward10()"
                class="ma-0 pa-0 large-button"
              >
                <v-icon size="40">$vuetify.icons.forward10</v-icon>
              </v-btn>
            </v-row>
          </v-container>
        </v-flex>

        <!-- SLIDER -->
        <v-flex ma-0 pa-0 pl-2 pr-2 xs2 shrink class="overlayControls ltr" v-show="!isErrored">
          <v-container fluid fill-height pa-0 ma-0>
            <v-layout align-center justify-center row pa-0 ma-0>
              <v-flex xs2 class="text-center">
                <div
                  class="mediaDurationText secondary--text"
                >{{ $root.mediaPlayer.currentPlaySeconds | timeInColonFormat }}</div>
              </v-flex>
              <v-flex xs8 class="text-center">
                  <v-slider
                    ref="slider"
                    height="4px"
                    hide-details
                    color="green lighten-1"
                    class="progress ma-2 pa-0"
                    background-color="green lighten-5"
                    track-color="green lighten-5"
                    track-fill-color="green lighten-1"
                    v-bind="!draggingSlider ? { value: $root.mediaPlayer == null ? 0 : $root.mediaPlayer.currentPlayPercentage} : {}"
                    :readonly="isLive"
                    v-on:change="$root.mediaPlayer.seekToPercentage($event)"
                    v-on:start="draggingSlider = true"
                    v-on:end="draggingSlider = false"
                    step="0"
                    max="10000"
                  />
              </v-flex>
              <v-flex xs2 class="text-center">
                <div
                  class="mediaDurationText secondary--text"
                >{{ $root.mediaPlayer.duration | timeInColonFormat }}</div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>

        <!-- SHARE -->
        <v-flex ma-0 pa-0 xs1 shrink class="overlayControls" style="z-index:99">
          <Share
            :item="item"
            mediaType="audio"
            :showDownload="!isLive"
            :showFavorite="!isLive"
            style="background-color:white"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>


<script>
import PlayControllerBase from "./PlayControllerBase";
import Share from "./Share.vue";
import DateView from "./DateView";

export default {
  extends: PlayControllerBase,
  components: {
    Share,
    DateView
  },
  props: {
    showCloseMinimizeButtons: {
      type: Boolean,
      default: function() {
        return true;
      }
    }
  },
  data: () => ({
    showMore: false
  }),
  mounted() {
    // Hardcode slider to LTR
    this.$refs.slider.$vuetify = {};
  },
  computed: {
    itemDescription() {
      if (this.item != null) {
        return this.item.description;
      }
      return "";
    }
  }
};
</script>

<style scoped>

.ltr {
  direction: ltr;
} 

.playerRoot {
  width: 100%;
  height: var(--v-audio-player-height);
  z-index: 30;
  transition: 0.3s;
  overflow: hidden;
}

.playerRoot.showMore {
  height: auto;
  overflow-y: auto;
}

.player {
  min-height: 0;
  min-width: 0;
  width: 100%;
  height: auto;
  max-height: 100%;
}

.overlayControls {
  background-color: #ffffff;
  z-index: 100;
}

.v-btn {
  min-width: 0;
  padding: 0;
}

.image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 6px;
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


