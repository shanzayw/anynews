<template>
  <div class="ma-0 pa-0" ref="container">
    <v-list ref="list" pa-0 ma-0 class="itemList">
      <v-container fluid grid-list-sm ma-0 pa-0>
        <v-layout ma-0 pa-0 xs12 row wrap justify-space-between>
          <v-flex class="xs12 pa-0"
            v-for="item in items"
            :key="item.guid"
          >
          <v-lazy ma-0 pa-0 transition="fade-transition" min-height="var(--v-theme-image-width-min)">
            <Item
              :ref="item.guid"
              class="item item1col"
              :item="item"
              :odd="false"
              :showFavorites="showFavorites"
              v-on:itemClicked="itemClicked($event)"
              v-on:playItem="playItem($event)"
              v-on:playStarted="onPlayStarted($event)"
            />
          </v-lazy>
          </v-flex>
        </v-layout>
      </v-container>
    </v-list>
  </div>
</template>


<script>
import ItemListBase from "./ItemListBase";
import Item from "./Item";

export default {
  extends: ItemListBase,
  components: {
    Item
  },
  props: {
    showFavorites: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  }
};
</script>
