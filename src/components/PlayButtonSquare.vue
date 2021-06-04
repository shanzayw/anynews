<template>
  <div :class="{'ma-0': true, 'pa-0': true, 'itemPlayButton': !large, 'itemPlayButtonLarge': large}" v-if="item != null && (item.hasAudioAttachment() || item.hasVideoAttachment())">
    <v-btn
      v-show="this.$root.mediaPlayer != null && this.$root.mediaPlayer.item == item && this.$root.mediaPlayer.isPlaying"
      text
      icon
      :color="playerColor"
      @click.stop="pause()"
      style="width: 100%; height: 100%"
      :class="{'ma-0': true, 'pa-0': true}"
    >
      <v-icon class="itemPlayButtonIcon">$vuetify.icons.pauseNoCircle</v-icon>
    </v-btn>
    <v-btn
      v-show="this.$root.mediaPlayer == null || this.$root.mediaPlayer.item != item || !this.$root.mediaPlayer.isPlaying"
      text
      icon
      :color="playerColor"
      @click.stop="play()"
      style="width: 100%; height: 100%"
      :class="{'ma-0': true, 'pa-0': true}"
    >
      <v-icon class="itemPlayButtonIcon">$vuetify.icons.playNoCircle</v-icon>
    </v-btn>
  </div>
</template>


<script>
import ItemModel from "../models/itemmodel";

export default {
  name: "PlayButton",
  props: {
    item: {
      type: ItemModel,
      default: function() {
        return new ItemModel();
      }
    },
    large: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
    playerColor: {
      type: String,
      default: function() {
        return "#000000";
      }
    },

    /**
     * Whether the media player should be shown when playback is started. Defaults to 'false'.
     */
    showMediaPlayer: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  },

  mounted: function() {
    // If we are playing this item, hide the docked media player since we already
    // show the play/pause button next to the title.
    //if (this.$root.mediaPlayerItem == this.item) {
    //  this.$root.mediaPlayerDocked = this.showMediaPlayer;
    //}
  },
  methods: {
    pause() {
      this.$root.mediaPlayer.pause();
    },

    play() {
      if (this.$root.mediaPlayerItem != this.item) {
        // eslint-disable-next-line
        this.item.autoplay = true;
        this.$root.setMediaItem(this.item);
      } else {
        this.$root.mediaPlayer.play();
      }
      this.$root.mediaPlayerDocked = this.item.hasAudioAttachment() && this.showMediaPlayer;
      this.$emit("playStarted", this.item);
    }
  }
};
</script>

<style>
</style>

