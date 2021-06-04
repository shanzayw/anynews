<template>
  <div class="ma-0 pa-0" ref="container">
    <v-list ref="list" class="itemList">
      <div
        v-for="(item, index) in items"
        :key="item.guid"
        style="background-color: var(--v-audioCardBackground-base)"
      >
      <v-lazy ma-0 pa-0 transition="fade-transition" min-height="60px">
        <AudioItem
          :ref="item.guid"
          class="ma-0"
          :item="item"
          :isSelected="item == selectedItem"
          v-on:itemClicked="playItem($event)"
          v-on:playItem="playItem($event)"
        />
      </v-lazy>
        <!-- If not last item, add a divider between items -->
        <div ma-0 pa-0 v-if="index < items.length - 1" class="listDivider" />
      </div>
    </v-list>
  </div>
</template>


<script>
import ItemListBase from "./ItemListBase";
import AudioItem from "./AudioItem";

export default {
  extends: ItemListBase,
  components: {
    AudioItem
  }
};
</script>
