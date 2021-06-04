<template>
  <div class="ma-0 pa-0" ref="container">
    <v-list ref="list" class="itemList">
      <div v-for="item in items" :key="item.guid">
        <v-lazy ma-0 pa-0 transition="fade-transition" min-height="70px">
          <VideoItem
            :ref="item.guid"
            class="ml-2 mr-2 mt-0 mb-0"
            :item="item"
            :isSelected="item == selectedItem"
            v-on:itemClicked="playItem($event)"
            v-on:playItem="playItem($event)"
          />
        </v-lazy>
      </div>
    </v-list>
  </div>
</template>


<script>
import ItemListBase from "./ItemListBase";
import VideoItem from "./VideoItem";

export default {
  extends: ItemListBase,
  components: {
    VideoItem
  }
};
</script>
