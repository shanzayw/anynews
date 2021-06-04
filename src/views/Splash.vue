<template>
  <v-container
      fill-height
      fluid
      class="processingView white--text"
    >
      <v-row align="center" justify="center">
        <v-container fluid class="white--text">
          <v-row align="center" justify="center">
            <div class="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </v-row>
          <v-row align="center" justify="center">
            <div class="processingText"> </div>
          </v-row>
        </v-container>
      </v-row>
    </v-container>
</template>

<script>
export default {
  name: "Splash"
};
</script>

<style scoped>
.processingView {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 110;
}

.processingContainer {
  height: 80%;
  width: 50%;
  margin: auto auto;
}

/* From https://loading.io/css/ */
.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>