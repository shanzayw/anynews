<template>
  <v-container fluid grid-list-lg pb-1 pt-4 pl-0 pr-0 ma-0>
    <v-layout ref="card" xs12 style="background-color: var(--v-cardBackground-base)">
      <v-flex xs4 mt-0 pt-0>
        <v-img aspect-ratio="1.77" max-height="70px" :src="imageSrcOrFeedImage" @error="$logger.logFetchError(imageSrcOrFeedImage)" ma-0 pa-0 />
      </v-flex>
      <v-flex @click="itemClicked()" xs7 ml-2 mr-2 mt-0 pt-0>
        <div :class="{smallHeadline: true, smallHeadline2lines: true, selected: isSelected}">
          {{ item.title }}
        </div>
        <div>
            <DateView class="date verticalCenter" :date="item.pubDate" ago />
            &nbsp;
            <span class="verticalCenter">
              <v-icon class="ma-0 pa-0 tiny" small>$vuetify.icons.typeVideo</v-icon>
            </span>
        </div>
      </v-flex>
      <v-flex xs1 ma-0 pa-0 style="min-width: 70px" class="text-center ma-0 pa-0">
        <ItemFavoriteButton :item="item" mediaType="video" />
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
import ItemBase from "./ItemBase";
import db from "../database";
import DateView from "./DateView";
import ItemFavoriteButton from "./ItemFavoriteButton";
import MediaCache from "../mediacache";

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
  watch: {
    item: function() {
      if (this.feedImageSrc != null) {
        MediaCache.releaseMedia(this.feedImageSrc);
      }
      this.feedImageSrc = null;
      console.log("VideoItem - item changed!!!");
      this.updateItem();
    }
  },
  mounted: function() {
    this.updateItem();
  },
  data: () => ({
    feedImageSrc: null
  }),
  computed: {
    imageSrcOrFeedImage: function() {
      return this.feedImageSrc == null ? this.imageSrc : this.feedImageSrc;
    }
  },
  methods: {
    itemClicked() {
      this.$emit("itemClicked", {
        item: this.item,
        rect: this.$refs.card.getBoundingClientRect()
      });
    },

    updateItem() {
      if (this.item.imageSrc != null) {
        MediaCache.getMedia(this.item.feedImageSrc, true, function(url) {
          self.feedImageSrc = url;
        })
        return;
      }
      if (!this.hasImage) {
        console.log("Video item - no image!!!");
        const self = this;
        db.getFeed(this.item.feed).then(feed => {
          if (feed != null) {
            MediaCache.getMedia(feed.imageUrl, true, function(url) {
              console.log("Using feed blob " + url);
              self.feedImageSrc = url;
            });
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.selected {
  color: green !important;
}
</style>