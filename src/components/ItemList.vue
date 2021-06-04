<template>
  <div class="ma-0 pa-0" ref="container">
    <v-list ref="list" pa-0 ma-0 class="itemList">
      <v-container fluid grid-list-sm ma-0 pa-0>
        <v-layout ma-0 pa-0 xs12 row wrap justify-space-between>
          <v-flex
            v-bind:class="classesForIndex(item, index)"
            v-for="(item, index) in items"
            :key="item.guid"
          >
            <v-lazy ma-0 pa-0 :class="{'flexrow':(item.displayType == 2 || item.displayType == 3) ? true : false}" transition="fade-transition" min-height="var(--v-theme-image-width-min)" style="width:100%">
              <ItemCategoryTitle
                v-if="item.displayType == 1"
                :ref="item.guid"
                :class="{'item': true, 'item1coltitle': index == 0, 'item1coltitlecategory': index != 0}"
                :item="item"
                :odd="false"
                v-on:itemClicked="itemClicked($event)"
                v-on:playItem="playItem($event)"
                v-on:playStarted="onPlayStarted($event)"
              />
              <ItemHalfWidth
                v-else-if="item.displayType == 2 || item.displayType == 3"
                :ref="item.guid"
                :class="{'item': true, 'item2colleft': item.displayType == 2, 'item2colright': item.displayType == 3}"
                :item="item"
                :odd="item.displayType == 2"
                v-on:itemClicked="itemClicked($event)"
                v-on:playItem="playItem($event)"
                v-on:playStarted="onPlayStarted($event)"
              />
              <Item
                v-else
                :ref="item.guid"
                class="item item1col"
                :item="item"
                :odd="false"
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
import ItemHalfWidth from "./ItemHalfWidth";
import ItemCategoryTitle from "./ItemCategoryTitle";

export default {
  extends: ItemListBase,
  components: {
    Item,
    ItemHalfWidth,
    ItemCategoryTitle
  },
  methods: {
    classesForIndex(item, ignoredIndex) {
      let o = {};
      if (item.displayType == 2 || item.displayType == 3) {
        o["xs6"] = true;
        o["flexrow"] = true;
      } else {
        o["xs12"] = true;
      }
      o["pa-0"] = true;
      return o;
    }
  }
};
</script>

<style scoped>
.flexrow {
  display: flex;
}
</style>