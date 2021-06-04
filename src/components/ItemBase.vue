<template>
  <div />
</template>

<script>
import ItemModel from "../models/itemmodel";
import MediaCache from "../mediacache";

export default {

  props: {
    item: {
      type: ItemModel,
      default: function() {
        return new ItemModel();
      }
    },
    odd: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  },

  destroyed: function() {
    MediaCache.releaseMedia(this.imageUrl);
    this.imageUrl = null;
  },

  mounted: function() {
    var self = this;
    if (this.item != null && this.item.imageSrc != null) {
      MediaCache.getMedia(this.item.imageSrc, false, function(url) {
        self.imageUrl = url;
        self.$emit("imageUrlSet");
      });
    } else {
      this.imageUrl = null;
      this.$emit("imageUrlSet");
    }
  },
  data: () => ({
    imageUrl: null
  }),
  computed: {
    playable: function() {
      return this.item != null && (this.item.hasVideoAttachment() || this.item.hasAudioAttachment());
    },
    hasImage: function() {
      return this.item != null && this.item.imageSrc != null;
    },
    // A property that can be used as "src" in images. It can fetch the image from a blob, a url or just defaults to '' to avoid errors.
    imageSrc: function() {
      return this.imageUrl == null ? '' : this.imageUrl;
    }
  },
  methods: {
    onPlayStarted(item) {
      this.$emit("playStarted", item);
    },
    playItem() {
      this.$emit("playItem", {
        item: this.item
      });
    },
    itemClicked() {
      var rect = null;
      if (this.$refs.card != null) {
        rect = this.$refs.card.getBoundingClientRect();
      }
      this.$emit("itemClicked", {
        item: this.item,
        rect: rect
      });
    }
  }
}
</script>

<style>

.itemList {
  padding: 0px !important;
}

/* Special cleanup of the display */
.itemList a:empty {
  display: none;
}
.itemList br {
  content: ' ';
  display: none !important;
}
.itemList .storyText p:last-of-type {
  margin-bottom: 0px;
}
</style>