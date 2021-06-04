<template>
  <div :style="cssProps">
    <div class="imageBackdrop" @click="itemClicked()">
      <v-layout ref="card" class="titleContainer" justify-space-between align-end ma-0 pa-0 fill-height>
        <v-flex ma-0 pa-0>
          <div class="topic featured text-uppercase">{{ item.getCategoryName() }}</div>
          <div>
            <div class="featuredHeadline">{{ item.title }}</div>
            <div>
                <PlayButtonSquare
                  v-if="playable"
                  :item="item"
                  playerColor="white"
                  showMediaPlayer
                  class="playButton"
                  v-on:playStarted="onPlayStarted($event)"
                />
              <DateView class="date verticalCenter" :date="item.pubDate" ago />&nbsp;
              <ItemType :item="item" color="white" />
            </div>
          </div>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>


<script>
import ItemBase from "./ItemBase";
import ItemType from "./ItemType";
import DateView from "./DateView";
import PlayButtonSquare from "./PlayButtonSquare";

export default {
  extends: ItemBase,
  components: {
    DateView,
    PlayButtonSquare,
    ItemType
  },
  computed: {
    cssProps() {
      return {
        "--v-category-image": "url(" + this.imageSrc + ")"
      };
    }
  }
};
</script>

<style scoped>
.featuredHeadline,
.storyText,
.date,
.tiny {
  color: white !important;
}

.playButton {
  display: inline-block;
  margin-inline-start: -12px !important;
  /*margin-left: -12px !important;*/
  background-color: transparent !important;
}

.contentBlock {
  display: block;
}

.imageBackdrop {
  background: var(--v-category-image);
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 */
  overflow: hidden;
  position: relative;
}

.titleContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  /* min-height: var(--v-theme-caption-image-height);
  max-height: 70vh; */
  padding: 60px var(--v-item-gutter-h) calc(var(--v-item-gutter-v) / 2) var(--v-item-gutter-h) !important;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  overflow: hidden;
}
</style>