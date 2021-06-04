import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'settings',
  storage: localStorage,
  reducer: state => ({
    onboarded: state.onboarded,
    showMedia: state.showMedia,
    flavor: state.flavor,
    flavorStatic: state.flavorStatic,
    textSizeAdjustment: state.textSizeAdjustment,
    currentAppVersion: state.currentAppVersion,
    currentProxy: state.currentProxy
  })
})

export default new Vuex.Store({
  state: {
    onboarded: false,
    showMedia: false,
    flavor: "unknown",
    flavorStatic: false,
    currentAppVersion: null, // Last known version we ran. Used for displaying "you just updated to ..."
    textSizeAdjustment: 0,
    currentFeedTitle: "",
    currentFeedItems: [],
    currentFeedCategories: [],
    currentFeedCategoriesWithItems: [],
    fullScreenItems: null,
    fullScreenItemIndex: -1,
    isLandscapeMode: false,
    showingFullScreenVideo: false,
    currentProxy: null,
  },
  mutations: {
    onboarded (state, onboarded) {
      state.onboarded = onboarded;
    },
    showMedia (state, value) {
      state.showMedia = value;
    },
    setFlavor(state, flavor) {
      state.flavor = flavor;
    },
    setFlavorStatic(state, flavorStatic) {
      state.flavorStatic = flavorStatic;
    },
    setCurrentAppVersion(state, version) {
      state.currentAppVersion = version;
    },
    setTextSizeAdjustment(state, adjustment) {
      state.textSizeAdjustment = adjustment;
    },
    setCurrentFeedTitle(state, title) {
      state.currentFeedTitle = title;
    },
    setCurrentFeedItems(state, items) {
      state.currentFeedItems = items;
    },
    clearCategories(state, numCategories) {
      state.currentFeedCategories = [];
      state.currentFeedCategoriesWithItems = [];
      for (var i = 0; i < numCategories; i++) {
        state.currentFeedCategories.push({feed:null,items:null});
      }
    },
    addCategoryItems(state, category) {
      Object.assign(state.currentFeedCategories[category.index], category);
      state.currentFeedCategoriesWithItems = state.currentFeedCategories.filter(function(i) {
        return i.items != null;
      });
    },

    setFullScreenItems(state, data) {
      state.fullScreenItems = data.items;
      state.fullScreenItemIndex = data.activeIndex;
    },
    setFullScreenItemIndex(state, index) {
      state.fullScreenItemIndex = index;
    },
    setLandscapeMode(state, isLandscapeMode) {
      state.isLandscapeMode = isLandscapeMode;
    },
    showingFullScreenVideo(state, showingFullScreenVideo) {
      state.showingFullScreenVideo = showingFullScreenVideo;
    },
    setCurrentProxy(state, proxy) {
      state.currentProxy = proxy;
    },
 },
  plugins: [vuexPersist.plugin]
})
