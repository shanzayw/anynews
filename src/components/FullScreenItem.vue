<template>
  <v-container
    fluid
    ma-0
    pa-0
    :class="{'dodgeDockedPlayer':(this.$root.mediaPlayerDocked && this.$root.mediaPlayerItem != null)}"
  >
    <v-layout>
      <v-flex xs12>
        <v-app-bar flat fixed class="black--text toolbar" :style="cssProps">
          <v-app-bar-nav-icon @click="onClose()" :style="cssProps">
            <v-icon class="backButton" :color="iconColor">arrow_back</v-icon>
          </v-app-bar-nav-icon>
          <!--<v-toolbar-title class="toolbarTitle">{{ item.title }}</v-toolbar-title>-->
        </v-app-bar>
        <v-card color="white" flat :style="cssProps">
          <div class="imageBackdrop">
            <div
              @click.prevent="showZoomImage(imageSrc)"
              class="imageContainer"
              style="display: grid"
            >
              <v-img
                class="white--text"
                :src="imageSrc"
                gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,1)"
                style="grid-column: 1; grid-row: 1"
                v-if="hasImage"
                @error="$logger.logFetchError(imageSrc)"
              >
                <viewer
                  ref="zoomViewer"
                  v-if="zoomedImage != null"
                  :options="zoomOptions"
                  style="width: 100%; height: 100%"
                >
                  <img
                    :src="zoomedImage"
                    style="width: 100%; height: 100%;object-fit: cover;z-index: -1"
                  />
                </viewer>
              </v-img>
              <div
                v-else
                style="grid-column: 1; grid-row: 1; background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));"
              ></div>

              <div
                style="grid-column: 1; grid-row: 1; align-self: end; z-index: 80"
                class="titleBlock"
              >
                <div class="white--text featuredHeadline featuredHeadline6lines">{{ item.title }}</div>
                <div>
                  <PlayButtonSquare
                    v-if="playableItem"
                    :item="item"
                    playerColor="white"
                    :showMediaPlayer="true"
                    large
                    class="playButton"
                    v-on:playStarted="onPlayStarted($event)"
                  />
                  <DateView class="white--text date verticalCenter" :date="item.pubDate" ago />&nbsp;
                  <!--<ItemType :item="item" color="white" />-->
                </div>
              </div>
            </div>
          </div>

          <Share class="share" :item="item" mediaType="article" />

          <v-container :class="{'noImage': !hasImage}" class="contentBlock">
            <div v-html="item.description" class="smallHeadline scaled mb-4" />
            <hr
              v-if="item.description != null && item.description.length > 0"
              class="teaserSeparator"
            />
            <div
              @click="handleClicks"
              v-html="item.content"
              class="storyText dynamic-content"
              ref="itemBody"
            />
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
import ItemBase from "./ItemBase";
import Share from "../components/Share";
import PlayButtonSquare from "../components/PlayButtonSquare";
import DateView from "../components/DateView";

import "viewerjs/dist/viewer.css";

export default {
  name: "FullScreenItem",
  extends: ItemBase,
  components: {
    Share,
    PlayButtonSquare,
    DateView
  },
  data: () => ({
    moveFraction: 1,
    fadeFraction: 0,
    zoomedImage: null,
    zoomOptions: {
      toolbar: false,
      minZoomRatio: 0.5,
      maxZoomRatio: 5,
      tooltip: false,
      navbar: false,
      className: "zoomImageViewer"
    }
  }),

  destroyed: function() {
    this.$el.parentElement.removeEventListener("scroll", this.onScroll);
  },

  mounted: function() {
    this.$el.parentElement.addEventListener("scroll", this.onScroll);

    this.insertTwitterScript();

    // Set handler for when zoomed image is closed. Need to do it here, because
    // we want a reference to "this".
    this.zoomOptions.hidden = this.hideZoomImage;

    if (!this.hasImage) {
      this.moveFraction = 0;
      this.fadeFraction = 0;
    } else {
      this.moveFraction = 1;
      this.fadeFraction = 1;
    }
  },
  computed: {
    cssProps() {
      return {
        "pointer-events": "all",
        "--v-move-fraction": this.moveFraction,
        "--v-fade-fraction": this.fadeFraction
      };
    },
    iconColor() {
      return "rgba(calc(255 * var(--v-fade-fraction)),calc(255 * var(--v-fade-fraction)),calc(255 * var(--v-fade-fraction)),1)";
    },
    playerColor() {
      return "rgba(calc(255 * var(--v-fade-fraction)),calc(255 * var(--v-fade-fraction)),calc(255 * var(--v-fade-fraction)),calc(1 - var(--v-fade-fraction)))";
    },
    imageTitlePlayerColor() {
      return "rgba(255, 255, 255, var(--v-fade-fraction))";
    },
    playableItem() {
      return (
        this.item != null &&
        (this.item.hasAudioAttachment() || this.item.hasVideoAttachment())
      );
    }
  },
  methods: {
    onClose() {
      this.$emit("close");
    },
    onScroll(e) {
      if (this.hasImage) {
        let offsetTop = e.target.scrollTop;
        this.moveFraction = Math.min(
          1,
          Math.max(0, 1 - offsetTop / 150)
        ).toFixed(2);
        if (this.moveFraction < 0.2) {
          this.fadeFraction = (this.moveFraction / 0.2).toFixed(2);
        } else {
          this.fadeFraction = 1;
        }
      }
    },

    // From https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
    //
    rgbToHex(rgb) {
      var hex = Number(rgb).toString(16);
      if (hex.length < 2) {
        hex = "0" + hex;
      }
      return hex;
    },

    fullColorHex(r, g, b) {
      var red = this.rgbToHex(r);
      var green = this.rgbToHex(g);
      var blue = this.rgbToHex(b);
      return "#" + red + green + blue;
    },

    pause() {
      this.$root.mediaPlayer.pause();
    },

    play() {
      if (this.$root.mediaPlayerItem != this.item) {
        this.item.autoplay = true;
        this.$root.setMediaItem(this.item);
      } else {
        this.$root.mediaPlayer.play();
      }
      this.$root.mediaPlayerDocked = true;
    },

    onPlayStarted(ignoredEvent) {
      // If this is a video, we play it in the list view, so open that
      if (
        this.$root.mediaPlayerItem != null &&
        this.$root.mediaPlayerItem.hasVideoAttachment()
      ) {
        this.$emit("close");
        this.$root.mediaShowList = true;
        this.$root.mediaPlayerDocked = false;
      } else {
        this.$root.mediaPlayerDocked = true;
      }
    },

    showZoomImage(source) {
      // Check that we are still on this page, we might have reacted to a swipe event that we could not prevent.
      if (this.$store.state.fullScreenItems != null && this.$store.state.fullScreenItems[this.$store.state.fullScreenItemIndex] == this.item) {
        this.zoomedImage = source;
        this.$nextTick(() => {
          this.$refs.zoomViewer.$viewer.show();
        });
      }
    },

    hideZoomImage(ignoredEvent) {
      this.zoomedImage = null;
    },

    insertTwitterScript() {
      var script = document.getElementById("twitterScript");
      if (script == null) {
        console.log("Twitter script link not found, creating!");
        script = document.createElement("script");
        script.id = "twitterScript";
        script.async = true;
        script.src = "https://platform.twitter.com/widgets.js";
        script.onload = function(ignoredF) {
          if (this.$refs.itemBody != null) {
            window.twttr.widgets.load(this.$refs.itemBody.$el);
          }
        }.bind(this);
        document.head.appendChild(script);
      } else if (window.twttr != null) {
        console.log("Twitter script found, reusing");
        if (this.$refs.itemBody != null) {
          window.twttr.widgets.load(this.$refs.itemBody.$el);
        }
      }
    },
    // Adapted from here: https://dennisreimann.de/articles/delegating-html-links-to-vue-router.html
    //
    // We handle all links, make sure that target is set to "_blank".
    handleClicks($event) {
      // ensure we use the link, in case the click has been received by a subelement
      let { target } = $event;
      let originalTarget = target;

      while (target && target.tagName !== "A") target = target.parentNode;
      // handle only links that occur inside the component and do not reference external resources
      if (target && target.matches(".dynamic-content a") && target.href) {
        // some sanity checks taken from vue-router:
        // https://github.com/vuejs/vue-router/blob/dev/src/components/link.js#L106
        const {
          altKey,
          ctrlKey,
          metaKey,
          shiftKey,
          button,
          defaultPrevented
        } = $event;
        // don't handle with control keys
        if (metaKey || altKey || ctrlKey || shiftKey) return;
        // don't handle when preventDefault called
        if (defaultPrevented) return;
        // don't handle right clicks
        if (button !== undefined && button !== 0) return;
        // don't handle if `target="_blank"`
        if (target && target.getAttribute) {
          const linkTarget = target.getAttribute("target");
          if (/\b_blank\b/i.test(linkTarget)) return;
        }
        // don't handle same page links/anchors
        const url = new URL(target.href);
        const to = url.pathname;
        if (window.location.pathname !== to) {
          target.target = "_blank";
        }
      } else if (originalTarget.tagName === "IMG") {
        // This is not a link. It is, however, an image. Zoom!
        this.showZoomImage(originalTarget.src);
        return;
      }
    }
  }
};
</script>

<style scoped>
.toolbar {
  pointer-events: none;
  height: 50px;
  width: 80px;
  background-color: transparent !important;
  z-index: 100;
}

.v-app-bar__nav-icon {
  margin-left: -16px !important;
}

.toolbarTitle {
  position: relative;
  color: rgba(
    calc(255 * var(--v-fade-fraction)),
    calc(255 * var(--v-fade-fraction)),
    calc(255 * var(--v-fade-fraction)),
    calc(1 - var(--v-fade-fraction))
  );
}

.v-application--is-rtl .backButton {
  -moz-transform: scale(-1, 1);
  -webkit-transform: scale(-1, 1);
  -o-transform: scale(-1, 1);
  -ms-transform: scale(-1, 1);
  transform: scale(-1, 1);
}

.titleBlock {
  /* Item paddings, t,r,b,l */
  margin: 16px var(--v-item-gutter-h) 16px var(--v-item-gutter-h);
}

.contentBlock {
  /* Item paddings, t,r,b,l */
  padding: 16px var(--v-item-gutter-h) 16px var(--v-item-gutter-h);
}

.dodgeDockedPlayer {
  padding-bottom: 70px !important;
}

.imageBackdrop {
  /* background: var(--v-category-image);
  background-size: cover;
  background-repeat: no-repeat; */
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 */
  overflow: hidden;
  position: relative;
}

.imageContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  /* padding: 60px var(--v-item-gutter-h) calc(var(--v-item-gutter-v) / 2) var(--v-item-gutter-h) !important;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)); */
  overflow: hidden;
}

.share {
  background-color: white;
  height: 60px;
  position: sticky;
  top: 0px;
  z-index: 90;
}

.progress {
  position: sticky;
  top: 110px;
  z-index: 101;
}

.noImage {
  /* Prevent the content from disappearing under toolbar and share bar! */
  padding-top: 110px;
}

hr.teaserSeparator {
  border: 0;
  height: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  margin: 20px;
}

.playButton {
  display: inline-block;
  margin-inline-start: -12px !important;
  background-color: transparent !important;
}
</style>

<style>
.image-inline {
  width: 100% !important;
}

.zoomImageViewer {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

.storyText div.image-inline, .storyText figure {
  /*width: 100% !important;*/
  margin-top: 35px;
  margin-bottom: 35px;
}

.storyText .image-caption, .storyText figcaption {
  font-size: calc(0.8 * var(--v-theme-font-size-scaled));
  padding: 4px;
}

.storyText .image-inline div {
  width: 100% !important;
}

.storyText .image-inline img {
  width: 100% !important;
  height: auto !important;
}

/* Links blue and not underlined */
.storyText a {
  text-decoration: none;
  color: #1955a5;
}

/* Hide the zoom button from image captions */
.storyText div#zoomattribute {
  display: none;
}

.storyText figure {
  width: calc(100% + 2 * var(--v-item-gutter-h)) !important;
  margin-left: calc(-1 * var(--v-item-gutter-h)) !important;
  margin-right: calc(-1 * var(--v-item-gutter-h)) !important;
  height: auto !important;
  overflow: none;
}

.storyText figure img {
  width: 100% !important;
  /* height: auto !important; */
}

.storyText div.image-inline {
  width: calc(100% + 2 * var(--v-item-gutter-h)) !important;
  margin-left: calc(-1 * var(--v-item-gutter-h)) !important;
  margin-right: calc(-1 * var(--v-item-gutter-h)) !important;
}

.storyText iframe:not([src^='https://www.facebook.com']):not([src^='https://www.youtube.com']) {
  /* width: calc(100% + 2 * var(--v-item-gutter-h)) !important;
  margin-left: calc(-1 * var(--v-item-gutter-h)) !important;
  margin-right: calc(-1 * var(--v-item-gutter-h)) !important; */
  overflow: hidden;
}

/* If no hard coded height, use auto */
/* .storyText iframe:not([height]):not([src~='//www.facebook.com']):not([src~='//www.youtube.com']) {
  height: auto !important;
} */

/* Facebook iframes */
.storyText iframe[src^='https://www.facebook.com'] {
  width: calc(100% + 2 * var(--v-item-gutter-h)) !important;
  margin-left: calc(-1 * var(--v-item-gutter-h)) !important;
  margin-right: calc(-1 * var(--v-item-gutter-h)) !important;
  overflow: hidden;
  padding-top: 35px;
  padding-bottom: 35px;
}

/* Handle YouTube by setting aspect ratio */
.storyText .videoWrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  overflow: hidden;
  margin-top: 35px;
  margin-bottom: 35px;
  width: calc(100% + 2 * var(--v-item-gutter-h)) !important;
  height: auto !important;
  margin-left: calc(-1 * var(--v-item-gutter-h)) !important;
  margin-right: calc(-1 * var(--v-item-gutter-h)) !important;
}

.storyText .videoWrapper iframe {
  border: 0px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
/* End youtube specific */
</style>

