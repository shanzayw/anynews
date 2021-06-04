<template>
  <v-container fluid ma-0 pa-1>
    <v-layout text-center wrap justify-center align-center>
      <v-flex xs3 v-if="showShare">
        <v-btn style="margin-top: 3px" class="medium-button" icon color="black" @click="share">
          <v-icon>$vuetify.icons.share</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs3 v-if="showShareFacebook">
        <v-btn class="medium-button" icon color="black" @click="shareFacebook">
          <v-icon>$vuetify.icons.facebook</v-icon>
        </v-btn>
      </v-flex>
      <v-flex style="margin-top: 1px" xs3 v-if="showDownload">
        <v-btn class="medium-button" icon color="black" @click="download">
          <v-icon>$vuetify.icons.download</v-icon>
        </v-btn>
      </v-flex>
      <v-flex style="margin-top: 1px" xs3 v-if="showFavorite">
        <ItemFavoriteButton class="ma-0 pa-0 medium-button" :item="item" :mediaType="mediaType" />
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Download</v-card-title>

        <v-card-text>Item contains media. Download media or text?</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="dialog = false;downloadMedia()">Media</v-btn>

          <v-btn color="green darken-1" text @click="dialog = false;downloadText()">Text</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import ItemModel from "../models/itemmodel";
import ItemFavoriteButton from "./ItemFavoriteButton";

export default {
  components: {
    ItemFavoriteButton
  },
  props: {
    showDownload: {
      type: Boolean,
      default: function() {
        return true;
      }
    },
    showFavorite: {
      type: Boolean,
      default: function() {
        return true;
      }
    },
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
  data() {
    return {
      dialog: false
    };
  },
  computed: {
    showShare: function() {
      return navigator.share != null || window.navigator.share != null;
    },
    showShareFacebook: function() {
      return false;
    }
  },
  methods: {
    share() {
      this.$root.appInstance.componentInstance.shareItem(this.item);
    },
    shareFacebook() {
      this.$root.appInstance.componentInstance.shareItemFacebook(this.item);
    },
    download() {
      if (this.item.hasVideoAttachment() || this.item.hasAudioAttachment()) {
        this.dialog = true;
      } else {
        this.downloadText();
      }
    },
    downloadMedia() {
      this.$root.appInstance.componentInstance.downloadMedia(this.item);
    },
    downloadText() {
      this.$root.appInstance.componentInstance.printItem(this.item);
    }
  }
};
</script>
