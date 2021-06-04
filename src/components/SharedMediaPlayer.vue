<template>
  <div v-show="!hidden">
    <video
      v-if="item != null && ((item.isLive && hlssupported) || item.hasVideoAttachment())"
      v-renderToId:placeholder="videoPlaceholderName"
      ref="player"
      @canplay="onCanPlay"
      @loadstart="onLoadStart"
      @loadeddata="onLoaded"
      @error="onError"
      @seeked="onSeeked"
      @pause="onPaused"
      @play="onPlay"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      playsinline
      v-show="hasSource"
    >
      <source :src="enclosureURL" :type="enclosureType" v-if="!item.isLive && hasSource" @error="onErrorWithUrl(enclosureURL, $event)" />Your browser does not support the audio tag.
    </video>
    <audio
      v-else
      v-show="false"
      class="player"
      ref="player"
      @click="showHideOverlayControls"
      @canplay="onCanPlay"
      @loadstart="onLoadStart"
      @loadeddata="onLoaded"
      @error="onError"
      @seeked="onSeeked"
      @pause="onPaused"
      @play="onPlay"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
    >
      <source :src="enclosureURL" :type="enclosureType"  v-if="hasSource" @error="onErrorWithUrl(enclosureURL, $event)" />Your browser does not support the audio tag.
    </audio>
  </div>
</template>


<script>
import MediaPlayerBase from "./MediaPlayerBase.vue";
import Hls from "hls.js";

export default {
  extends: MediaPlayerBase,
  data: () => ({
    hls: null,
    hlsTimeAdjust: 0,
    hidden: false // Set to true to make invisible until a new (different) item is set!
  }),
  mounted() {
    console.log("Install shared player");
    this.$root.mediaPlayer = this;
    this.playerObject = this.$refs.player;
  },
  updated() {
    this.playerObject = this.$refs.player;
  },
  watch: {
    isPlaying: function(newValue) {
      if (newValue) {
        // If starting playback, we are no longer hidden!
        this.hidden = false;
      }
    }
  },
  computed: {
    hasSource() {
      return this.enclosureURL != null && this.enclosureURL != "";
    },
    isLive() {
      return this.item != null && this.item.isLive;
    },
    videoPlaceholderName() {
      if (this.hidden) {
        // Set a new value for renderToId
        return "";
      }
      if (this.$root.mediaPlayerDocked) {
        console.log("videoPlaceholder now: videoPlaceholderDocked");
        return "videoPlaceholderDocked";
      } else {
        console.log("videoPlaceholder now: videoPlaceholderController");
        return "videoPlaceholderController" + this.$route.name;
      }
    },
    isVideo() {
      return this.item != null && this.item.hasVideoAttachment();
    },

    hlssupported() {
      return Hls.isSupported();
    }
  },
  methods: {
    onLoadStart() {
      // If loading a new item, we are no longer hidden!
      this.hidden = false;
      MediaPlayerBase.methods.onLoadStart.call(this);
    },
    loadMedia() {
      console.log("SharedMediaPlayer - Load Media");
      const video = this.playerObject;
      if (this.isLive) {
        console.log("Is live");
        this.hlsTimeAdjust = 0;
        const self = this;
        if (Hls.isSupported()) {
          console.log("using hls");
          console.log("SharedMediaPlayer - Load live media");
          const hls = new Hls();
          this.hls = hls;

          // bind them together
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, function() {
            console.log("video and hls.js are now bound together !");
            hls.loadSource(self.enclosureURL);
            hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
              console.log(
                "manifest loaded, found " +
                  data.levels.length +
                  " quality level"
              );
              video.play();
            });

            hls.on(Hls.Events.ERROR, function(event, data) {
              if (data.fatal) {
                console.log("FATAL ERROR LOADING MEDIA");
                self.hls.detachMedia();
                self.hls = null;
                self.$root.clearMediaItem();
              }
            });

            // TODO - Wrong timezone on the timestamps?!?
            hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data) {
              console.log("** FRAG_PARSING_METADATA");
              console.log(event);
              console.log(data);
              //   const programTime = data && data.frag && data.frag.rawProgramDateTime;
              //   if (programTime) {
              //     var stamp = moment.parseZone(programTime);
              //     var now = new moment();
              //     var diff = moment.duration(now.diff(stamp));
              //     console.log("NOW: "+ now.format());
              //     console.log("PROG: "+ stamp.format());
              //     console.log("DIFF: " + diff.asSeconds());
              //     this.hlsTimeAdjust = diff.asSeconds();
              //   } else {
              //     this.hlsTimeAdjust = 0;
              //   }
            });
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          console.log("Can play m3u");
          this.enclosureType = "application/vnd.apple.mpegurl";
          this.$nextTick(function() {
            MediaPlayerBase.methods.loadMedia.call(self);
          });
        }
      } else {
        if (Hls.isSupported()) {
          if (this.hls != null) {
            this.hls.detachMedia();
          }
          this.hls = null;
        }
        MediaPlayerBase.methods.loadMedia.call(this);
      }
    },

    getCurrentAndDuration() {
      return MediaPlayerBase.methods.getCurrentAndDuration.call(this);
    }
  }
};
</script>
