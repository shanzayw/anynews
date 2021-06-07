<template>
  <v-container fluid grid-list-sm>
    <v-layout
      ref="card"
      xs12
      style="background-color: var(--v-cardBackground-base);--v-image-actual-height: 70px"
      justify-space-between
      ma-0 pa-0
    >
      <v-flex
        shrink
        style="width: 130px;max-width: 33%"
        mt-0
        pa-0
        mb-0
        v-if="hasImage || playable"
        v-bind:class="imageClassObject"
      >
        <v-img
          ref="itemImage"
          :aspect-ratio="1/1"
          :key="item.guid + 'image'"
          class="image ma-0 mb-2 pa-0 text-center"
          :src="imageSrc"
          @error="$logger.logFetchError(imageSrc)"
          style="width: 100%"
          v-on="{ click: itemClicked }"
        >
          <v-container ma-0 pa-0 fluid fill-height align-end>
            <v-row ma-0 pa-0 no-gutters>
              <v-col ma-0 pa-0>
                <vue-resize-sensor @resize="onImageResize" style="position:absolute;top:0;bottom:0;left:0;right:0" />
                <PlayButtonSquare
                  class="pa-0 ma-0"
                  v-if="playable"
                  :item="item"
                  :playerColor="hasImage ? 'white' : 'black'"
                  showMediaPlayer
                  v-on:playStarted="onPlayStarted($event)"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-img>
      </v-flex>

      <v-flex @click="itemClicked()" v-bind:class="textClassObject" mt-0 pt-0 mb-0 pb-0 
      style="display: flex; flex-direction: column;max-height: var(--v-image-actual-height);overflow:none">
        <div class="pa-0" style="flex:1 1 auto;display: flex; flex-direction: column;overflow:none">
          <div style="flex: 0 0 auto" ref="topic" class="topic" v-if="item.getCategoryName().length > 0">{{ item.getCategoryName() }}</div>
          <div style="flex: 1 1 auto;display:flex">
            <vue-resize-sensor style="flex: 1 1 auto" ref="itemTitleResizer" @resize="onTitleResize">
              <div style="position:absolute;top:0;left:0;right:0;bottom:0" ref="itemTitle" class="smallHeadline smallHeadline4lines">{{ item.title }}</div>
            </vue-resize-sensor>
          </div>
          <div style="flex: 0 0 auto" />
          <div style="flex: 0 0 auto;line-height:15px" ref="date" class="nobreak pa-0 ma-0">
            <DateView class="date" :date="item.pubDate" ago />&nbsp;
            <ItemType :item="item" />
          </div>
        </div>
      </v-flex>

      <v-flex style="flex: 0 1 auto" order-xs3 v-if="showFavorites">
        <ItemFavoriteButton :item="item" mediaType="article" />
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
import ItemBase from "./ItemBase";
import ItemType from "./ItemType";
import ItemFavoriteButton from "./ItemFavoriteButton";
import ItemModel from "../models/itemmodel";
import DateView from "./DateView";
import PlayButtonSquare from "./PlayButtonSquare";
import VueResizeSensor from '@seregpie/vue-resize-sensor';

export default {
  extends: ItemBase,
  components: {
    DateView,
    PlayButtonSquare,
    ItemType,
    ItemFavoriteButton,
    VueResizeSensor
  },
  props: {
    item: {
      type: ItemModel,
      default: function() {
        return new ItemModel();
      }
    },
    showFavorites: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  },
  // mounted() {
  //   console.log("Item mounted: " + this.item.title);
  // },
  methods: {
    onImageResize(ignoredElement) {
      const image = this.$refs.itemImage;
      if (image) {
          this.$refs.card.style.setProperty("--v-image-actual-height", (image.$el.clientHeight + 4) + "px");
      }
    },
    onTitleResize(ignoredSize) {
      // We figure out how much space we have, then set max-height to an even number of lines!
      //
      // 1. Get height of container
      const itemTitleResizer = this.$refs.itemTitleResizer;
      const itemTitle = this.$refs.itemTitle;
      const h = itemTitleResizer.$el.clientHeight;

      // 2. Get line height and calculate an integer number of lines we can display
      var lineHeight = parseFloat(getComputedStyle(itemTitle).getPropertyValue("line-height"));
      var numLines = Math.floor(h / lineHeight);

      // 3. Set max-height to this value
      itemTitle.style.setProperty("max-height", (numLines * lineHeight) + "px");
    }
  },
  computed: {
    imageClassObject: function() {
      var sort = 1;
      if (this.odd) {
        sort = 2;
      }
      let sortClass = "order-xs" + sort;
      let o = {};
      o[sortClass] = true;
      return o;
    },
    textClassObject: function() {
      var sort = this.hasImage || this.playable ? 2 : 1;
      let o = {};
      if (this.odd != this.$vuetify.rtl) {
        sort = 1;
        o["ml-0"] = true;
        o["mr-2"] = true;
      } else {
        o["mr-0"] = true;
        o["ml-2"] = true;
      }
      let sortClass = "order-xs" + sort;
      o[sortClass] = true;
      return o;
    }
  }
};
</script>

<style scoped>
.contentBlock {
  display: block;
}

.imageContainer {
  position: relative;
  width: 100%;
  padding-top: 76%;
}

.imageContainerContent {
  display: grid;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.image {
  object-fit: cover;
  background-color: #efefef;
  border-radius: 6px;
}

.nobreak {
  overflow: hidden;
  white-space: nowrap;
  padding: 0;
}
</style>
