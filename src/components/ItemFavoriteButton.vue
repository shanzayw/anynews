<template>
  <v-btn icon v-blur @click="toggle" class="ma-0 pa-0 text-center align-center justify-center">
    <v-icon :color="iconColor">{{icon}}</v-icon>
  </v-btn>
</template>


<script>
import ItemModel from "../models/itemmodel";
import db from "../database";

export default {
  props: {
    item: {
      type: ItemModel,
      default: function() {
        return new ItemModel();
      }
    },
    /**
     * "article", "audio" or "video"
     */
    mediaType: {
      type: String,
      default: function() {
        return "article";
      }
    }
  },
  watch: {
    item: function() {
      this.updateItem();
    },
    isFavorite() {
      console.log("Updated isFavorite!!!");
      if (this.loaded) {
        this.storeFavorite(this.isFavorite);
      }
    }
  },
  computed: {
    iconColor() {
      return this.isFavorite ? "accent" : "secondary";
    },
    icon() {
      return this.isFavorite ? "$vuetify.icons.favorite" : "$vuetify.icons.favoriteNot";
    }
  },
  mounted: function() {
    this.updateItem();
  },
  data: () => ({
    loaded: false,
    isFavorite: false
  }),
  methods: {
    toggle() {
      this.isFavorite = !this.isFavorite;
    },

    // Toggle favorite status of item.
    storeFavorite(isFav) {
      if (!isFav) {
        // eslint-disable-next-line
        this.item.savedByUser = null;
        db.items
          .where("id")
          .equals(this.item.guid)
          .delete();
        this.item.deleteDownloadedMedia();
      } else {
        // eslint-disable-next-line
        this.item.savedByUser = Date.now();

        // Log favorited
        this.$logger.logArticleFavorited(this.item, this.mediaType);

        db.items
          .put({
            id: this.item.guid,
            feed: this.item.feed,
            item: this.item.serialize()
          })
          .catch(function(error) {
            console.log("DEXIE Error: " + error);
          });
        this.item.downloadMedia();
      }
      this.$root.$emit("favChanged");
    },
    updateItem() {
      if (this.item == null) {
        this.isFavorite = false;
        this.loaded = false;
        return;
      }

      const self = this;
      db.items
        .get(this.item.guid)
        .then(item => {
          self.isFavorite = ItemModel.fromString(item.item).savedByUser != null;
          self.$nextTick(function() {
            self.loaded = true;
          });
        })
        .catch(function() {
          self.isFavorite = false;
          self.$nextTick(function() {
            self.loaded = true;
          });
        });
    }
  }
};
</script>