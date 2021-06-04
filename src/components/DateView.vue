<template>
  <span>{{ dateString }}</span>
</template>

<script>
import moment from "moment";

export default {
  props: {
    date: {
      type: String,
      default: function() {
        return new Date().toUTCString();
      }
    },
    ago: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
  },
  data: function() {
    return {
      dateString: "",
      timer: null
    };
  },
  watch: {
    date() {
      this.changed();
    },
    ago() {
      this.changed();
    }
  },
  mounted: function() {
    this.changed();
  },
  methods: {
    changed() {
      if (this.timer != null) {
        let timer = this.timer;
        this.timer = null;
        clearInterval(timer);
      }
      this.updateDateString();
      if (this.ago) {
        const self = this;
        this.timer = setInterval(() => { self.updateDateString() }, 6000);
      }
    },
    updateDateString() {
      var m = moment(this.date);
      if (this.ago) {
        this.dateString = this.toLocalNumbers(this.getDateString(m.toDate()));
      } else {
        this.dateString = m.format("D MMMM YYYY");
      }
    },

    toLocalNumbers(str) {
      if (this.$store.state.flavor == "burmese") {
        // Translate to burmese numerals
        var result = "";
        for (var i = 0; i < str.length; i++) {
          var c = str.charCodeAt(i);
          if (c >= 48 && c <= 57) {
            result += String.fromCharCode(c + 0x1040 - 48);
          } else {
            result += String.fromCharCode(c);
          }
        }
        return result;
      } else if (this.$store.state.flavor == "tibetan") {
        // Translate to tibetan numerals
        result = "";
        for (i = 0; i < str.length; i++) {
          c = str.charCodeAt(i);
          if (c >= 48 && c <= 57) {
            result += String.fromCharCode(c + 0x0f20 - 48);
          } else {
            result += String.fromCharCode(c);
          }
        }
        return result;
      }

      return str;
    },

    getDateString(date) {
      var ti = Math.abs(new Date().getTime() - date.getTime());
      ti = ti / 1000; // Convert to seconds
      if (ti < 1) {
        return "";
      } else if (ti < 60) {
        return this.$t("time.recently");
      } else if (ti < 3600 && Math.round(ti / 60) < 60) {
        return this.$tc("time.minutes", Math.round(ti / 60));
      } else if (ti < 86400 && Math.round(ti / 60 / 60) < 24) {
        return this.$tc("time.hours", Math.round(ti / 60 / 60));
      } else {
        return this.$tc("time.days", Math.round(ti / 60 / 60 / 24));
      }
    }
  },
  beforeDestroy() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
    this.timer = null;
  }
};
</script>
