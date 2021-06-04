<template>
  <div style="display: flex;flex-direction: column;flex-grow:1">
    <v-img
      style="flex: 0 0 auto"
      :aspect-ratio="4/3"
      class="image ma-0 mb-2 pa-0 text-center"
      :src="imageSrc"
      @error="$logger.logFetchError(imageSrc)"
      v-on="{click: itemClicked }"
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

      <div @click="itemClicked()" ml-2 mr-2 mt-0 pt-0 xs12 style="flex: 0 0 auto"
          v-if="item.getCategoryName().length > 0"
          class="topic verticalCenter text-start text-truncate">
          {{ item.getCategoryName() }}
      </div>

      <div @click="itemClicked()" ml-2 mr-2 mt-0 pt-0 xs12 style="flex: 1 1 auto" class="smallHeadline">{{ item.title }}</div>
      <div @click="itemClicked()" ml-2 mr-2 mt-0 pt-0 xs12 style="flex: 0 0 auto" class="nobreak">
        <DateView class="date verticalCenter" :date="item.pubDate" ago />&nbsp;
        <ItemType :item="item" />
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
  }
};
</script>

<style scoped>
.contentBlock {
  display: block;
}

.imageContainer {
  display: grid;
}

.image {
  object-fit: cover;
  background-color: #efefef;
  border-radius: 6px;
}

.nobreak {
  overflow: hidden;
  white-space: nowrap;
}
</style>
