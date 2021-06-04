<template>
  <v-container ref="card" fluid fill-height ma-0 pl-3 pr-3 pt-3 pb-2 @click="itemClicked()">
    <v-row no-gutters nowrap>
      <v-col>
        <!-- Item category -->
        <div
          style="color: black"
          class="topic verticalCenter text-start text-truncate"
        >{{ item.getCategoryName() }}</div>
        <!-- Item title -->
        <div
          style="margin-top:8px"
          :class="{smallHeadline: true, smallHeadline2lines: true, selected: isSelected}"
        >{{ item.title }}</div>
        <!-- Date and type -->
        <div>
          <span class="verticalCenter">
            <v-icon
              v-if="isSelected"
              class="selected ma-0 pa-0 tiny"
              small
            >$vuetify.icons.typeAudioPlaying</v-icon>
            <v-icon v-else class="ma-0 pa-0 tiny" small>$vuetify.icons.typeAudio</v-icon>
          </span>
          &nbsp;
          <DateView class="date verticalCenter" :date="item.pubDate" ago />
        </div>
      </v-col>
      <v-col cols="1" ml-0 mr-0 mb-0 pa-0 style="min-width: 60px;margin-top:-6px" class="text-center">
        <ItemFavoriteButton :item="item" mediaType="audio" class="small-button" />
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import ItemBase from "./ItemBase";
import ItemFavoriteButton from "./ItemFavoriteButton";
import DateView from "./DateView";

export default {
  extends: ItemBase,
  components: {
    DateView,
    ItemFavoriteButton
  },
  props: {
    isSelected: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  },
  methods: {
    itemClicked() {
      this.$emit("itemClicked", {
        item: this.item,
        rect: this.$refs.card.getBoundingClientRect()
      });
    }
  }
};
</script>

<style scoped>
.selected {
  color: green !important;
}
</style>