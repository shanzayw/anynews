<template>
  <span class="verticalCenter" style="padding-bottom:3px">
    <v-icon v-if="item.hasVideoAttachment()" :color="color" class="ma-0 pa-0 tiny" small>$vuetify.icons.typeVideo</v-icon>
    <v-icon
      v-else-if="item.hasAudioAttachment()"
      :color="color"
      class="ma-0 pa-0 tiny"
      small
    >$vuetify.icons.typeAudio</v-icon>
    <v-icon v-else class="ma-0 pa-0 tiny" :color="color" small>$vuetify.icons.typeText</v-icon>
  </span>
</template>


<script>
import ItemModel from "../models/itemmodel";

export default {
  props: {
    item: {
      type: ItemModel,
      default: function() {
        return new ItemModel();
      }
    },
    color: {
      type: String,
      default: function() {
        return "secondary";
      }
    }
  }
};
</script>

