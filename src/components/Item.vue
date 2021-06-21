<template>
  <v-container fluid grid-list-sm>
    <v-row
      style="background-color: var(--v-cardBackground-base);--v-image-actual-height: 70px"
      justify-space-between
      class="ma-0 pa-0"
    >
      <v-col
        cols="auto"
        shrink
        style="width: 130px;max-width: 33%"
        class="ma-0 pa-0"
        v-bind:class="imageClassObject"
      >
        <v-img
          ref="itemImage"
          :aspect-ratio="1/1"
          :key="item.guid + 'image'"
          class="image ma-0 pa-0 text-center"
          :src="imageSrc"
          @error="$logger.logFetchError(imageSrc)"
          style="width: 100%"
          v-on="{ click: itemClicked }"
        >
          <v-container ma-0 pa-0 fluid fill-height align-end>
            <v-row ma-0 pa-0 no-gutters>
              <v-col ma-0 pa-0>
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
      </v-col>

      <v-col @click="itemClicked()" v-bind:class="textClassObject" class="ma-0 pa-0" 
      style="display: flex; flex-direction: column;overflow:none">
        <div class="pa-0 ma-0" style="flex:1 1 auto;display: flex; flex-direction: column;overflow:none">
          <div style="flex: 0 0 auto" ref="topic" class="topic" v-if="item.getCategoryName().length > 0">{{ item.getCategoryName() }}</div>
          <div style="flex: 1 1 auto;display:flex;overflow:hidden">
            <LineCroppedText :text="item.title" class="smallHeadline smallHeadline4lines" />
          </div>
          <div style="flex: 0 0 auto;line-height:15px" ref="date" class="nobreak pa-0 ma-0">
            <DateView class="date" :date="item.pubDate" ago />&nbsp;
            <ItemType :item="item" />
          </div>
        </div>
      </v-col>

      <v-col cols="auto" order-xs3 v-if="showFavorites">
        <ItemFavoriteButton :item="item" mediaType="article" />
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import ItemBase from "./ItemBase";
import ItemType from "./ItemType";
import ItemFavoriteButton from "./ItemFavoriteButton";
import ItemModel from "../models/itemmodel";
import DateView from "./DateView";
import PlayButtonSquare from "./PlayButtonSquare";
import LineCroppedText from './LineCroppedText';

export default {
  extends: ItemBase,
  components: {
    DateView,
    PlayButtonSquare,
    ItemType,
    ItemFavoriteButton,
    LineCroppedText
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
