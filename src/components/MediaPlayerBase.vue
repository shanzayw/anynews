<template>
  <div />
</template>


<script>
import db from "../database";
import ItemModel from "../models/itemmodel";
import MediaCache from "../mediacache";

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
    playerObject: null,
    itemTitle: "",
    autoPlay: false,
    isPlaying: false,
    imageUrl: null,
    enclosureURL: "",
    enclosureType: null,
    duration: 0,
    currentPlaySeconds: 0,
    currentPlayPercentage: 0,
    showOverlayControls: false,
    overlayTimeoutObject: null,
    error: null
  }),
  mounted: function() {
    this.update();
  },
  watch: {
    item: function() {
      if (this.item) {
        this.autoPlay = this.item.autoplay !== false;
        // eslint-disable-next-line
        this.item.autoplay = false; // reset flag
      } else {
        this.autoPlay = false;
      }

      this.update();
    }
  },

  destroyed: function() {
    MediaCache.releaseMedia(this.enclosureURL);
    this.enclosureURL = null;
  },

  computed: {},
  filters: {
    timeInColonFormat: function(value) {
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
    // load(item, autoplay) {
    //   this.item = item;
    //   this.autoplay = autoplay;
    // },

    /* Take care of actually loading the media into the player */
    loadMedia() {
      console.log("MediaPlayerBase - Load Media");
      if (this.playerObject != null) {
        this.playerObject.load();
      }
    },

    update() {
      if (
        this.item != null &&
        (this.item.hasVideoAttachment() || this.item.hasAudioAttachment())
      ) {
        console.log("Updating item!");
        this.itemTitle = this.item.title;
        const self = this;
        this.error = null;
        this.enclosure(function(url) {
          self.enclosureURL = url;
          self.enclosureType = self.item.enclosureType;
          self.pause();
          console.log("Call load media to url " + url);
          self.loadMedia();
        });
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
        this.pause();
        this.error = null;
      }
    },

    enclosure(callback) {
      if (this.item != null && this.item.enclosure != null) {
        MediaCache.getMedia(this.item.enclosure, false, function(url) {
          callback(url);
        });
      }
    },

    onCanPlay() {
      if (this.item != null && this.autoPlay) {
        this.autoPlay = false;
        console.log("Can play called");
        this.play();
      }
    },

    onLoadStart() {
      console.log("On load start called");
      this.error = null;
    },

    onLoaded() {
      console.log("On loaded called");
      this.error = null;

      if (this.item && this.item.enclosureDuration) {
        // Hardcoded duration, like for live radio shows
        this.duration = this.item.enclosureDuration;
      } else if (this.playerObject != null) {
        this.duration = this.playerObject.duration;

        // Store in item
        // eslint-disable-next-line
        this.item.enclosureDuration = this.duration;
      } else {
        this.duration = 0;
      }

      // Check if we have stored a playhead position for this video
      //
      if (this.item != null) {
        var url = this.item.enclosure;
        if (localStorage.getItem("playhead:" + url) != null) {
          let time = localStorage.getItem("playhead:" + url);
          // TODO - dont do this for live
          if (this.playerObject != null) {
            this.playerObject.currentTime = time;
          }
        }
      }

      if ("mediaSession" in navigator && this.item != null) {
        let meta = {
          title: this.item.title
        };
        // eslint-disable-next-line
        navigator.mediaSession.metadata = new MediaMetadata(meta);
        db.getFeed(this.item.feed).then(feed => {
          if (feed != null) {
            navigator.mediaSession.metadata.artist = feed.title;
            if (feed.imageUrl != null) {
              console.log("Set artwork to " + feed.imageUrl);
              navigator.mediaSession.metadata.artwork = [
                {
                  src: feed.imageUrl
                }
              ];
            }
          }
        });
      }
    },

    onErrorWithUrl(url, e) {
      this.onError(e);

      // Log fetch error
      this.$logger.logFetchError(url);
    },
    onError(e) {
      console.log("ERROR");
      console.log(e);
      if (this.enclosure != null && this.enclosure != "") {
        if (!e.target || e.target.src != "") {
          this.error = e;
        }
      }
    },
    onSeeked() {
      // Save the current playhead position for this video (identified by url)
      //
      if (
        this.item != null &&
        this.item.enclosure != null &&
        this.playerObject != null
      ) {
        var url = this.item.enclosure;
        var time = this.playerObject.currentTime;
        localStorage.setItem("playhead:" + url, time);
      }
    },
    onPlay() {
      this.isPlaying = true;
      this.$logger.logMediaPlay(this.item);
    },

    onPaused() {
      this.isPlaying = false;
      this.onSeeked();
      this.$logger.logMediaPause(this.item);
    },

    onEnded() {
      this.$logger.logMediaComplete(this.item);
    },

    play() {
      try {
        this.playerObject.play();
      } catch (e) {
        console.log("Error playing: " + e);
      }
    },

    pause() {
      console.log("Calling pause");
      if (this.playerObject != null) {
        this.playerObject.pause();
      }
    },

    /**
    * Percentage is actually percent * 100
    */
    seekToPercentage(percentage) {
      if (this.playerObject != null) {
        this.playerObject.currentTime =
          (this.playerObject.duration * percentage) / 10000;
      }
    },

    replay10() {
      if (this.playerObject != null) {
        this.playerObject.currentTime = Math.max(
          0,
          this.playerObject.currentTime - 10
        );
      }
    },
    forward10() {
      if (this.playerObject != null) {
        this.playerObject.currentTime = Math.min(
          this.playerObject.duration,
          this.playerObject.currentTime + 10
        );
      }
    },

    /*
      Return an object with {current:<num>,duration:<num>} for progress. Can be overridden by radio
      etc. to show correct program lengths */
    getCurrentAndDuration() {
      var duration = 0;
      var current = 0;
      if (this.playerObject != null) {
        duration = this.playerObject.duration;
        current = Math.round(this.playerObject.currentTime);
      }
      return { current: current, duration: duration };
    },

    onTimeUpdate() {
      // Update progress bar of current playback. TODO - allow click on progress bar to seek.
      var { duration, current } = this.getCurrentAndDuration();
      if (current != this.currentPlaySeconds) {
        this.currentPlaySeconds = current;
        this.currentPlayPercentage = (10000 * current) / duration;

        if (!isNaN(duration) && isFinite(duration)) {
          this.duration = duration; // In case it has changed
        }
      }
    },

    minimize() {
      this.showOverlayControls = false;
      this.$emit("minimize");
    },

    maximize() {
      this.$emit("maximize");
    },

    close() {
      console.log("Calling close");
      this.pause();
      this.$emit("close");
    },

    showHideOverlayControls() {
      this.overlayTimeoutObject = null;
        this.showOverlayControls = !this.showOverlayControls;
        if (this.showOverlayControls) {
          this.overlayTimeoutObject = setTimeout(
            this.showHideOverlayControls,
            3000
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
