<template>
  <div ref="text" v-resize="onResize">{{ text }}</div>
</template>


<script>
export default {
  props: {
    text: {
      type: String,
      default: function() {
        return null;
      }
    },
  },
  methods: {
    onResize(ignoredSize) {
      // We figure out how much space we have, then set max-height to an even number of lines!
      //
      // 1. Get height of container
      const text = this.$refs.text;
      const textParent = text.parentElement;
      const h = textParent.clientHeight;

      // 2. Get line height and calculate an integer number of lines we can display
      var lineHeight = parseFloat(getComputedStyle(text).getPropertyValue("line-height"));
      var numLines = Math.floor(h / lineHeight);

      // 3. Set max-height to this value
      text.style.setProperty("max-height", (numLines * lineHeight) + "px");
    }
  }
};
</script>

<style scoped>
</style>
