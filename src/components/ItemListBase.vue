<template>
  <div />
</template>

<script>
import ItemModel from "../models/itemmodel";

export default {
  props: {
    items: {
      type: Array,
      // Object or array defaults must be returned from
      // a factory function
      default: function() {
        return [];
      }
    },
    selectedItem: {
      type: ItemModel,
      default: function() {
        return new ItemModel();
      }
    }
  },
  watch: {
    items: function(old, nu) {
      if (!this.arraysEqual(old, nu)) {
        // Items changed, scroll to top!
        console.log("Items changed, scroll to top!");
        this.$refs.container.scrollTop = 0;
      }
    },
  },
  mounted() {},
  methods: {
    itemClicked(eventInfo) {
      this.$emit("itemClicked", eventInfo);
    },
    playItem(eventInfo) {
      this.$emit("playItem", eventInfo);
    },
    onPlayStarted(eventInfo) {
      this.$emit("playStarted", eventInfo);
    },
    arraysEqual(a, b) {
      // From: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
  }
};
</script>
