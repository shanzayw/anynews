<template>
  <div class="mainRoot" :style="cssProps">
    <v-app-bar
      flat
      :absolute="useFadingAppBar"
      :class="{
        mainListHeader: !useFadingAppBar,
        transparentAppBar: useFadingAppBar,
      }"
    >
      <v-icon v-if="useFadingAppBar" color="#158E45"
        >$vuetify.icons.logo</v-icon
      >
      <v-icon v-else color="accent">$vuetify.icons.logoInverted</v-icon>
      <!-- <v-spacer />
      <v-toolbar-title
        v-if="useFadingAppBar"
        class="feedTitleFadingToBlack feedTitle text-uppercase"
      >{{ (headerTitle != null) ? headerTitle : $store.state.currentFeedTitle }}</v-toolbar-title>
      <v-toolbar-title
        v-else
        class="feedTitleWhite feedTitle text-uppercase"
      >{{ (headerTitle != null) ? headerTitle : $store.state.currentFeedTitle }}</v-toolbar-title> -->
    </v-app-bar>

    <div
      :class="{
        mainItemList: useFadingAppBar,
        mainItemListMinusAppBar: !useFadingAppBar,
        'ma-0': true,
      }"
      v-on:scroll="onHeaderScroll"
      ref="mainItemList"
    >
      <!-- IF headerTags prop is set, show a header -->
      <div
        v-if="headerType != null"
        class="mainListHeader pl-2 pr-2 pt-0 pb-0"
        style="position: sticky; top: 0px; z-index: 5"
      >
        <div v-if="headerType == 'saved'" class="tagContainer">
          <span
            v-for="tag in headerTagsSaved"
            :key="tag.value"
            :class="{
              'text-uppercase': true,
              topicTitle: true,
              topicTitleSelected:
                currentHeaderTag != null && currentHeaderTag == tag,
            }"
            @click="onHeaderTag(tag)"
            >{{ tag.name }}</span
          >
        </div>

        <div
          v-if="headerType == 'categories' && headerTagsCategories.length == 0"
          class="tagContainer"
        >
          <!-- No categories loaded, just insert a hidden placeholder here -->
          <span :class="{ 'text-uppercase': true, topicTitle: true }"
            >&nbsp;</span
          >
        </div>

        <div v-else-if="headerType == 'categories'" class="tagContainer">
          <span
            v-for="tag in headerTagsCategories"
            :key="tag.value"
            :class="{
              'text-uppercase': true,
              topicTitle: true,
              topicTitleSelected:
                currentHeaderTag != null && currentHeaderTag.value == tag.value,
            }"
            @click="onHeaderTag(tag)"
            >{{ tag.name }}</span
          >
        </div>
      </div>
      <!-- End of header -->

      <!-- If empty saved tab -->
      <v-container
        v-if="
          currentHeaderTag != null &&
          currentHeaderTag.value.startsWith('saved_') &&
          filteredItems.length == 0
        "
        fluid
      >
        <v-layout fill-height justify-center align-center>
          <v-flex>
            <div class="text-center">
              <v-icon
                class="ma-5 pa-0"
                style="width: 64px; height: 64px"
                color="green"
                >$vuetify.icons.favorites</v-icon
              >
            </div>
            <div class="text-center">{{ this.$t("saved_placeholder") }}</div>
          </v-flex>
        </v-layout>
      </v-container>

      <!-- If empty categories tab -->
      <v-container
        v-else-if="
          headerType == 'categories' && headerTagsCategories.length == 0
        "
        fluid
      >
        <v-layout fill-height justify-center align-center>
          <v-flex>
            <div class="text-center">
              <v-icon
                class="ma-5 pa-0"
                style="width: 64px; height: 64px"
                color="green"
                >$vuetify.icons.favorites</v-icon
              >
            </div>
            <div class="text-center">{{ $t("categories_placeholder") }}</div>
          </v-flex>
        </v-layout>
      </v-container>

      <ItemListPlain
        v-else-if="currentHeaderTag != null"
        v-bind:items="filteredItems"
        v-on:itemClicked="itemClicked($event)"
        v-on:playItem="playItem($event)"
        v-on:playStarted="onPlayStarted($event)"
        class="pt-0 ma-0"
        :showFavorites="
          currentHeaderTag != null &&
          currentHeaderTag.value.startsWith('saved_')
        "
      />
      <ItemList
        v-else
        v-bind:items="filteredItems"
        v-on:itemClicked="itemClicked($event)"
        v-on:playItem="playItem($event)"
        v-on:playStarted="onPlayStarted($event)"
        class="pt-0 ma-0"
        :plain="currentHeaderTag != null"
      />
    </div>

    <div
      class="videoItemList"
      v-if="
        $root.mediaShowList &&
        $root.mediaPlayerItem != null &&
        $root.mediaPlayer.isVideo
      "
    >
      <!-- Video player, current item info (including share) and a list of videos -->
      <PlayControllerVideo
        :playerId="videoPlayerId"
        style="flex-grow: 0; flex-shrink: 0"
        :item="$root.mediaPlayerItem"
        v-on:close="onClose()"
        v-on:minimize="onMinimize()"
        v-on:maximize="onMaximize()"
        v-on:openFullscreen="itemClicked($event)"
      />
      <v-container fluid grid-list-sm pa-0 ma-0 class="videoListCurrentItem">
        <v-layout xs12>
          <v-flex xs12 ml-2 mr-2 mt-0 pt-0>
            <div>
              <DateView
                class="date verticalCenter"
                :date="$root.mediaPlayerItem.pubDate"
              />
            </div>
            <div class="smallHeadline smallHeadline2lines">
              {{ $root.mediaPlayerItem.title }}
            </div>
            <div class="contentBlock mt-2">
              <div
                v-html="$root.mediaPlayerItem.description"
                class="storyText storyText2lines"
              />
            </div>
            <Share :item="$root.mediaPlayerItem" mediaType="video" />
          </v-flex>
        </v-layout>
      </v-container>
      <ItemListVideo
        :items="filteredItems | videoItems"
        :selectedItem="$root.mediaPlayerItem"
        v-on:playItem="playItemFromMediaList($event)"
        v-on:itemClicked="playItemFromMediaList($event)"
        class="videoList"
      />
    </div>

    <div
      class="audioItemList"
      v-if="
        $root.mediaShowList &&
        $root.mediaPlayerItem != null &&
        !$root.mediaPlayer.isVideo
      "
    >
      <PlayControllerAudio
        style="flex-grow: 0; flex-shrink: 0"
        :item="$root.mediaPlayerItem"
        v-on:close="onClose()"
        v-on:minimize="onMinimize()"
        v-on:maximize="onMaximize()"
        v-on:openFullscreen="itemClicked($event)"
      />

      <ItemListAudio
        :items="filteredItems | audioItems"
        :selectedItem="$root.mediaPlayerItem"
        v-on:playItem="playItemFromMediaList($event)"
        v-on:itemClicked="playItemFromMediaList($event)"
        class="audioList"
      />
    </div>

    <div
      v-if="$store.state.fullScreenItems != null"
      class="fullScreenItem ma-0 pa-0"
      v-touch:swipe.right="swipeRight"
      v-touch:swipe.left="swipeLeft"
    >
      <v-window
        v-model="$store.state.fullScreenItemIndex"
        class="fullScreenItemInner"
      >
        <v-window-item
          v-for="(item, index) in $store.state.fullScreenItems"
          :value="index"
          :key="'fs_' + item.guid"
          class="fullScreenItemInnerContent"
        >
          <FullScreenItem v-on:close="onCloseFullscreen()" :item="item" />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script>
import ItemList from "../components/ItemList";
import ItemListPlain from "../components/ItemListPlain";
import ItemListAudio from "../components/ItemListAudio";
import ItemListVideo from "../components/ItemListVideo";
import ItemModel from "../models/itemmodel";
import PlayControllerVideo from "../components/PlayControllerVideo";
import PlayControllerAudio from "../components/PlayControllerAudio";
import Share from "../components/Share";
import FullScreenItem from "../components/FullScreenItem";
import DateView from "../components/DateView";
import db from "../database";
import router from "../router";
import moment from "moment";
import config from "../config";

import Vue from "vue";
import Vue2TouchEvents from "vue2-touch-events";

Vue.use(Vue2TouchEvents);

export default {
  name: "Home",
  components: {
    ItemList,
    ItemListPlain,
    ItemListAudio,
    ItemListVideo,
    PlayControllerVideo,
    PlayControllerAudio,
    Share,
    FullScreenItem,
    DateView,
  },
  props: {
    headerType: null,
  },
  // beforeRouteUpdate(to, from, next) {
  //   this.$root.mediaShowList = false;
  //   next();
  // },
  beforeRouteLeave(to, from, next) {
    if (
      this.$root.mediaPlayerItem != null &&
      !this.$root.mediaPlayerDocked &&
      this.$root.mediaPlayer.isPlaying
    ) {
      // When switching tabs, minimize (dock) the player. Unless the "nodockplayer" is query param
      // is set. This will happen when we actually MAXIMIZE the docked player and maybe switch tabs
      // to where the media item is (from where the user has surfed)
      if (!to.query || !to.query.nodockplayer) {
        this.$root.mediaPlayerDocked = true;
      }
    }
    //   this.$root.mediaShowList = false;
    next();
  },
  methods: {
    itemClicked(eventInfo) {
      console.log(
        "Item clicked " + eventInfo.item.title + " at rect " + eventInfo.rect
      );
      this.$store.commit("setFullScreenItems", {
        items: this.filteredItems,
        activeIndex: this.filteredItems.indexOf(eventInfo.item),
      });
    },

    playItem(eventInfo) {
      if (this.$root.mediaPlayerItem != eventInfo.item) {
        eventInfo.item.autoplay = true;
        this.$root.setMediaItem(eventInfo.item);
      } else {
        this.$root.mediaPlayer.play();
      }
      this.$root.mediaPlayerDocked = eventInfo.item.hasAudioAttachment();
      this.$root.mediaShowList = eventInfo.item.hasVideoAttachment();
    },

    playItemFromMediaList(eventInfo) {
      eventInfo.item.autoplay = true;
      this.$root.setMediaItem(eventInfo.item);
    },

    onPlayStarted(item) {
      this.$root.mediaShowList = item.hasVideoAttachment();
    },

    onClose() {
      this.$logger.logClosePlayer(
        this.$root.mediaPlayerItem,
        this.$root.mediaPlayerItem != null &&
          this.$root.mediaPlayerItem.hasVideoAttachment()
          ? "video"
          : "audio"
      );
      this.$root.mediaShowList = false;
      this.$root.mediaPlayerDocked = false;
      //this.$root.mediaPlayerItem = null;
    },

    onMinimize() {
      this.$root.mediaShowList = false;
      this.$root.mediaPlayerDocked = true;
    },

    onMaximize() {
      this.$root.mediaPlayerDocked = false;
      this.$root.mediaShowList = true;
    },

    showOnboarding() {
      router.push({ name: "onboarding" });
    },

    onCloseFullscreen() {
      console.log("onCloseFullscreen()");
      this.$store.commit("setFullScreenItems", {
        items: null,
        activeIndex: -1,
      });
      if (
        !this.$root.mediaPlayerDocked &&
        this.$root.mediaPlayer != null &&
        this.$root.mediaPlayer.isPlaying
      ) {
        this.$root.mediaPlayerDocked = true;
      }
    },

    onHeaderScroll(e) {
      let offsetTop = e.target.scrollTop;
      this.headerScrollFraction = Math.min(
        1,
        Math.max(0, 1 - offsetTop / 40)
      ).toFixed(2);
    },

    onHeaderTag(tag) {
      this.currentHeaderTag = tag;
      this.$logger.logHeaderTagSelected(tag);
    },

    updateHeader() {
      if (this.headerType == "saved") {
        this.headerTitle = this.$t("saved");
        this.currentHeaderTag = this.headerTagsSaved[0];
      } else if (this.headerType == "categories") {
        this.headerTitle = this.$t("categories");
        this.currentHeaderTag = this.headerTagsCategories[0];
      } else {
        this.headerTitle = this.$t("home");
        this.currentHeaderTag = null;
      }
    },

    scrollToTop() {
      //TODO - call this onShow or similar, when tab is changed
      this.$refs.mainItemList.scrollTop = 0;
    },

    updateFilteredItems() {
      if (this.$store.state.currentFeedItems == null) {
        this.filteredItems = [];
      } else if (
        this.currentHeaderTag != null &&
        this.currentHeaderTag.value.startsWith("saved_")
      ) {
        const self = this;
        db.items.toArray().then((items) => {
          self.filteredItems = self.sortItemsOnPubDate(
            items
              .map(function itemObject(item) {
                return ItemModel.fromString(item.item);
              })
              .filter(function (i) {
                return i.savedByUser != null;
              })
              .filter(function (i) {
                var saveDate = new Date(parseInt(i.savedByUser, 10));
                if (self.currentHeaderTag.value == "saved_week") {
                  return moment().subtract(7, "days").isBefore(saveDate);
                } else if (self.currentHeaderTag.value == "saved_month") {
                  return moment().subtract(1, "months").isBefore(saveDate);
                }
                return true;
              })
          );
        });
      } else if (
        this.currentHeaderTag != null &&
        this.currentHeaderTag.value.startsWith("cat_")
      ) {
        var index = parseInt(this.currentHeaderTag.value.substr(4), 10);
        var cat = this.$store.state.currentFeedCategories[index];
        this.filteredItems = this.sortItemsOnPubDate(cat.items);
      } else {
        // TODO - Filter out non-unique items
        //
        var mainFeedItems = this.$store.state.currentFeedItems;
        var categoryItems = this.$store.state.currentFeedCategoriesWithItems[0];

        // Filter out non-unique items!
        const guidmap = new Map();
        const removeDuplicates = function (array, category) {
          return array.filter((item) => {
            if (guidmap.has(item.guid)) {
              //console.log("Ignore duplicate: " + item.title);
              if (category != null) {
                // Mark the existing item with this category instead.
                guidmap.get(item.guid).categoryDisplay = category;
              }
              return false;
            } else {
              guidmap.set(item.guid, item);
              return true;
            }
          });
        };

        mainFeedItems = removeDuplicates(mainFeedItems, null);
        if (categoryItems != null && categoryItems.items != null) {
          categoryItems = Object.assign({}, categoryItems);
          categoryItems.items = removeDuplicates(
            categoryItems.items,
            categoryItems.category
          );
        }

        var idxMainFeed = 0;
        var idxCategory = 0;
        var idxCategoryItem = 0;
        var ret = [];
        const addMainItem = function (displayType) {
          if (idxMainFeed < mainFeedItems.length) {
            const item = mainFeedItems[idxMainFeed];
            item.displayType = displayType;

            // Set item category to "latest news"
            ret.push(item);
            idxMainFeed += 1;
          }
        }.bind(this);
        const addCategoryItem = function (displayType) {
          if (categoryItems && idxCategoryItem < categoryItems.items.length) {
            const item = categoryItems.items[idxCategoryItem];
            item.displayType = displayType;
            item.categoryDisplay = categoryItems.category;
            ret.push(item);
            idxCategoryItem += 1;
          } else {
            addMainItem(displayType);
          }
        };
        addMainItem(1);
        addMainItem(2);
        addMainItem(3);
        while (idxMainFeed < mainFeedItems.length) {
          addMainItem(0);
          addMainItem(0);
          addMainItem(0);
          addMainItem(0);

          // Any category to add?
          addCategoryItem(1);
          addCategoryItem(2);
          addCategoryItem(3);

          // Setup for next category
          idxCategory++;
          if (
            idxCategory <
            this.$store.state.currentFeedCategoriesWithItems.length
          ) {
            categoryItems =
              this.$store.state.currentFeedCategoriesWithItems[idxCategory];
            if (categoryItems != null && categoryItems.items != null) {
              categoryItems = Object.assign({}, categoryItems);
              categoryItems.items = removeDuplicates(
                categoryItems.items,
                categoryItems.category
              );
            }
            idxCategoryItem = 0;
          } else {
            categoryItems = null;
          }
        }
        this.filteredItems = ret;
      }
    },
    sortItemsOnPubDate(items) {
      if (items == null) {
        return [];
      }
      return items.sort(function (a, b) {
        if (a.pubDate == null) {
          return 1;
        } else if (b.pubDate == null) {
          return -1;
        }
        return moment(a.pubDate).isBefore(b.pubDate) ? 1 : -1;
      });
    },

    enableDisableScrolling() {
      document
        .querySelector("html")
        .classList.toggle(
          "application--dialog-opened",
          this.$store.state.fullScreenItems != null || this.$root.mediaShowList
        );
    },

    swipeRight() {
      if (this.$store.state.fullScreenItems != null) {
        let i = this.$store.state.fullScreenItemIndex;
        if (i > 0) {
          this.$store.commit("setFullScreenItemIndex", i - 1);
        }
      }
    },

    swipeLeft() {
      if (this.$store.state.fullScreenItems != null) {
        let i = this.$store.state.fullScreenItemIndex;
        if (i < this.$store.state.fullScreenItems.length - 1) {
          this.$store.commit("setFullScreenItemIndex", i + 1);
        }
      }
    },

    onFavChanged() {
      console.log("On fav changed");
      if (
        this.currentHeaderTag != null &&
        this.currentHeaderTag.value.startsWith("saved_")
      ) {
        this.updateFilteredItems();
      }
    },

    onMediaShowListChanged() {
      console.log("onMediaShowListChanged");
      this.enableDisableScrolling();

      // Showing media list? Log detail view in that case.
      if (this.$root.mediaShowList && this.$root.mediaPlayerItem != null) {
        if (this.$root.mediaPlayer.isVideo) {
          this.$logger.logVideoListView();
        } else {
          this.$logger.logAudioListView();
        }
      }
    },
  },

  filters: {
    videoItems(items) {
      return items.filter(function (i) {
        return i.hasVideoAttachment();
      });
    },
    audioItems(items) {
      return items.filter(function (i) {
        return i.hasAudioAttachment();
      });
    },
  },

  watch: {
    "$store.state.flavor"(ignoredvalue, ignoredoldValue) {
      this.updateHeader();
    },
    headerType: function () {
      console.log("Header type changed to " + this.headerType);
      this.updateHeader();
    },
    currentHeaderTag: function () {
      console.log("Filter items");
      this.updateFilteredItems();
    },
    headerTagsCategories() {
      const val = this.headerTagsCategories;
      if (
        this.headerType == "categories" &&
        !this.currentHeaderTag &&
        val &&
        val.length > 0
      ) {
        // Set default
        this.currentHeaderTag = val[0];
      }
    },
  },

  created() {
    this.$root.$on("favChanged", this.onFavChanged);
    this.$root.$on("mediaShowListChanged", this.onMediaShowListChanged);
  },

  beforeDestroy() {
    console.log("BeforeDestroyed");
    this.$root.$off("favChanged", this.onFavChanged);
    this.$root.$off("mediaShowListChanged", this.onMediaShowListChanged);
  },
  beforeRouteUpdate(to, from, next) {
    console.log("BeforeRouteUpdate");
    console.log(to.params);
    next();
  },
  destroyed() {
    if (this.storeWatchObject != null) {
      this.storeWatchObject();
      this.storeWatchObject = null;
    }
    if (this.storeWatchObject2 != null) {
      this.storeWatchObject2();
      this.storeWatchObject2 = null;
    }
    if (this.storeWatchObject3 != null) {
      this.storeWatchObject3();
      this.storeWatchObject3 = null;
    }
  },

  mounted() {
    console.log("Home mounted, start listening!");
    this.thisRouteName = this.$route.name;
    this.storeWatchObject = this.$store.watch(
      (state) => state.currentFeedItems,
      // eslint-disable-next-line
      (newValue, oldValue) => {
        this.updateFilteredItems();
      }
    );
    this.storeWatchObject2 = this.$store.watch(
      (state) => state.currentFeedCategoriesWithItems,
      // eslint-disable-next-line
      (newValue, oldValue) => {
        this.updateFilteredItems();
      }
    );
    this.storeWatchObject3 = this.$store.watch(
      (state) => state.fullScreenItemIndex,
      // eslint-disable-next-line
      (newValue, oldValue) => {
        this.enableDisableScrolling();

        // Show docked player or not?
        // Note, remove this functionality for now, see issue #12.
        // if (this.$store.state.fullScreenItems != null && newValue >= 0 && newValue < this.$store.state.fullScreenItems.length) {
        //   const item = this.$store.state.fullScreenItems[newValue];
        //   //console.log("Current FS item is " + item.title);
        //   // If we are playing this item, hide the docked media player since we already
        //   // show the play/pause button next to the title.
        //   if (
        //     item != null &&
        //     this.$root.mediaPlayer != null &&
        //     this.$root.mediaPlayer.item != null
        //   ) {
        //     if (this.$root.mediaPlayer.item == item) {
        //         this.$root.mediaPlayerDocked = false;
        //     } else {
        //       this.$root.mediaPlayerDocked = true;
        //     }
        //   }
        // }
      }
    );

    this.updateFilteredItems();
    this.updateHeader();
  },

  data() {
    return {
      filteredItems: [],
      headerTagsSaved: [
        { name: this.$t("all"), value: "saved_all" },
        { name: this.$t("this_week"), value: "saved_week" },
        { name: this.$t("this_month"), value: "saved_month" },
      ],
      headerScrollFraction: 1,
      headerTitle: null,
      currentHeaderTag: null,
      videoPlayerId: "videoPlaceholderController" + this.$route.name,
    };
  },
  computed: {
    cssProps() {
      return {
        "--v-header-scroll-fraction": this.headerScrollFraction,
      };
    },
    useFadingAppBar() {
      return this.headerType == null;
    },
    headerTagsCategories() {
      var cats = [];
      for (var i = 0; i < this.$store.state.currentFeedCategories.length; i++) {
        let cat = this.$store.state.currentFeedCategories[i];
        if (cat.items && cat.items.length > 0) {
          cats.push({ name: cat.category, value: "cat_" + i });
        } else {
          console.log("Ignoring empty category: " + cat.category);
        }
      }
      return cats;
    },
  },
};
</script>

<style scoped>
@import url("../assets/css/item-style.css");
@import url("../assets/css/shared-styles.css");

.tagContainer {
  overflow-x: scroll;
  white-space: nowrap;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tagContainer::-webkit-scrollbar {
  display: none;
}

.topicTitle {
  display: inline-block;
  padding: 10px;
  color: rgba(255, 255, 255, 0.4);
}
.topicTitle.topicTitleSelected {
  color: white !important;
}
</style>

<style>
.application--dialog-opened {
  overflow: hidden;
}

.transparentAppBar {
  background-color: rgba(
    255,
    255,
    255,
    calc(1 - var(--v-header-scroll-fraction))
  ) !important;
}

.mainRoot {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}

.mainItemList {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}

.mainItemListMinusAppBar {
  width: 100%;
  height: calc(100% - 60px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}

.videoItemList,
.audioItemList {
  background-color: white;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.videoListCurrentItem {
  background-color: #f0f0f0;
  overflow-y: hidden;
  overflow-x: hidden;
  z-index: 15;
  flex-grow: 0;
  flex-shrink: 0;
}

.videoList,
.audioList {
  flex-grow: 1;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}

.feedTitleFadingToBlack {
  color: rgba(
    calc(255 * var(--v-header-scroll-fraction)),
    calc(255 * var(--v-header-scroll-fraction)),
    calc(255 * var(--v-header-scroll-fraction)),
    1
  ) !important;
}

.feedTitleWhite {
  color: white !important;
}

.mainListHeader {
  background-color: var(--v-accent-base) !important;
}

.fullScreenItem {
  background-color: white;
  z-index: 20;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
}

.fullScreenItemInner,
.v-window__container {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}

.fullScreenItemInnerContent {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}
</style>