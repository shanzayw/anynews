<template>
  <div />
</template>


<script>
import db from "../database";
import ItemModel from "../models/itemmodel";

export default {
  props: {
    item: {
      type: ItemModel,
      default: function() {
        return new ItemModel();
      }
    }
  },
  data: () => ({
    itemTitle: "",
    imageUrl: null,
    showOverlayControls: false,
    overlayTimeoutObject: null,
    draggingSlider: false
  }),
  watch: {
    item: {
      handler: function(newValue, oldValue) {
        if (oldValue != newValue) {
          this.update();
        }
      },
      immediate: true
    }
  },
  computed: {
    isErrored() {
      return this.$root.mediaPlayer != null && this.$root.mediaPlayer.error != null;
    },
    isLive() {
      if (
        this.$root.mediaPlayerItem != null &&
        this.$root.mediaPlayerItem.isLive !== undefined
      ) {
        return this.$root.mediaPlayerItem.isLive;
      }
      return false;
    }
  },
  filters: {
    timeInColonFormat: function(value) {
      if (isNaN(value) || !isFinite(value)) {
        return "-"
      }
      let hours = parseInt(Math.floor(value / 3600));
      let minutes = parseInt(Math.floor((value - hours * 3600) / 60));
      let seconds = parseInt((value - (hours * 3600 + minutes * 60)) % 60);

      let dHours = hours > 9 ? hours : "0" + hours;
      let dMins = minutes > 9 ? minutes : "0" + minutes;
      let dSecs = seconds > 9 ? seconds : "0" + seconds;
      if (hours > 0) {
        return dHours + ":" + dMins + ":" + dSecs;
      }
      return dMins + ":" + dSecs;
    }
  },
  methods: {
    update() {
      if (
        this.item != null &&
        (this.item.hasVideoAttachment() || this.item.hasAudioAttachment())
      ) {
        console.log("Updating item!");
        this.itemTitle = this.item.title;
        this.currentPlaySeconds = 0;
        this.currentPlayPercentage = 0;
        this.duration = 0;

        this.imageUrl = this.item.imageSrc;

        // If no thumbnail, try generic feed image
        if (this.imageUrl == null) {
          db.getFeed(this.item.feed).then(feed => {
            if (feed != null) {
              this.imageUrl = feed.imageUrl;
            }
          });
        }
      } else {
        this.itemTitle = "";
        this.currentPlaySeconds = 0;
        this.currentPlayPercentage = 0;
        this.duration = 0;
        this.imageUrl = null;
      }
    },

    minimize() {
      this.showOverlayControls = false;
      this.$emit("minimize");
    },

    close() {
      this.$root.mediaPlayer.pause();
      this.$emit("close");
    },

    itemClicked() {
      this.$emit("openFullscreen", { item: this.item, rect: null });
    },

    showHideOverlayControls() {
      this.overlayTimeoutObject = null;
      this.showOverlayControls = !this.showOverlayControls;
      if (this.showOverlayControls) {
        this.overlayTimeoutObject = setTimeout(
          this.showHideOverlayControls,
          5000
        );
      }
    },

    enableOverlayControlsTimeout(enable) {
      if (this.overlayTimeoutObject != null) {
        clearTimeout(this.overlayTimeoutObject);
        this.overlayTimeoutObject = null;
      }
      if (enable) {
        this.overlayTimeoutObject = setTimeout(
          this.showHideOverlayControls,
          3000
        );
      }
    }
  }
};
</script>
