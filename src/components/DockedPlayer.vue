<template>
  <div
    :class="{'dockedPlayer':true, 'dockedPlayerFullscreen':($store.state.fullScreenItems != null)}"
    @click.stop="maximize()"
    v-if="$root.mediaPlayer != null"
  >
    <div style="width: 100%;position:absolute;top:0px" class="text-center">
      <v-btn
        class="ma-0 pa-0"
        text
        small
        icon
        color="black"
        style="min-width: 40px;min-height: 0"
      >
        <v-icon class="tiny">$vuetify.icons.expand</v-icon>
      </v-btn>
    </div>
    <v-container fluid fill-height ma.0 pa-0>
      <v-row
        no-gutters
        ma-0
        pa-0
        class="flex-nowrap"
        style="overflow: hidden;height: 70px"
        align="center"
      >
        <v-col v-if="isVideo" cols="3">
          <div style="height:70px;overflow:hidden" id="videoPlaceholderDocked" />
        </v-col>
        <v-col ma-0 pa-0 :cols="isVideo ? 7 : 10" style="flex-shrink: 1;min-width:0">
          <div
            class="smallHeadline smallHeadline1line"
            style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:22px;margin-left:22px"
          >{{ itemTitle }}</div>
        </v-col>
        <v-col ma-0 pa-0 cols="1" style="flex-shrink: 0;min-width:60px">
          <v-btn
            v-show="!$root.mediaPlayer.isPlaying && $root.mediaPlayer.error == null"
            class="large-button"
            text
            icon
            color="black"
            @click.stop="$root.mediaPlayer.play()"
          >
            <v-icon size="40">$vuetify.icons.play</v-icon>
          </v-btn>
          <v-btn
            v-show="$root.mediaPlayer.isPlaying && $root.mediaPlayer.error == null"
            class="large-button"
            text
            icon
            color="black"
            @click.stop="$root.mediaPlayer.pause()"
          >
            <v-icon size="40">$vuetify.icons.pause</v-icon>
          </v-btn>

          <!-- Warning icon, showing error loading -->
          <v-btn
            v-show="$root.mediaPlayer.error != null"
            class="large-button"
            text
            icon
            color="black"
          >
            <v-icon size="40">$vuetify.icons.warning</v-icon>
          </v-btn>
        </v-col>
        <v-col ma-0 pa-0 cols="1" style="flex-shrink: 0;min-width:60px">
          <v-btn class="small-button" text icon color="black" @click.stop="close()">
            <v-icon>$vuetify.icons.close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
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
    itemRoute: {
      type: Object,
      default: function() {
        return null;
      }
    }
  },
  computed: {
    isVideo() {
      return this.item != null && this.item.hasVideoAttachment();
    },
    itemTitle() {
      if (this.item != null) {
        return this.item.title;
      }
      return "";
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    maximize() {
      this.$emit("maximize", {
        item: this.item,
        itemRoute: this.itemRoute
      });
    }
  }
};
</script>

<style scoped>
@import url("../assets/css/item-style.css");
@import url("../assets/css/shared-styles.css");

.dockedPlayer {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 30;
  transition: 0.3s;
  overflow: hidden;
  background-color: #fafafa;
  bottom: 60px;
  left: 0px;
  width: 100%;
  height: 70px;
  border: 1px solid gray;
}

.dockedPlayerFullscreen {
  bottom: 0px !important;
}

.overlayControls {
  background-color: #ffffff;
  z-index: 100;
}

.v-btn {
  min-width: 0;
  padding: 0;
}
</style>

<style>
#videoPlaceholderDocked video {
  height: 100%;
  width: 100%;
  overflow: hidden;
  object-fit: contain;
}
</style>
