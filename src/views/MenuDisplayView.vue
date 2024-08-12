<template>
    <div class="display-container">
      <div class="display">
        <div class="display-header">
          <h1 class="love-ya-like-a-sister-regular">Menu du jour</h1>
          <!-- <Divider /> -->
          <Leaf class="left" />
          <Leaf class="right" />
        </div>
        <div class="display-body">
          <div class="midday">
            <div class="starter">
              <h2>Entrée</h2>
              <p v-html="midday ? midday.starter : ''"></p>
            </div>
            <div class="dish">
              <h2>Plat</h2>
              <p v-html="midday ? midday.dish : ''"></p>
            </div>
            <div class="dessert">
              <h2>Dessert</h2>
              <p v-html="midday ? midday.dessert : ''"></p>
            </div>
          </div>
          <div class="afternoon">
            <div class="starter">
              <h2>Entrée</h2>
              <p v-html="afternoon ? afternoon.starter : ''"></p>
            </div>
            <div class="dish">
              <h2>Plat</h2>
              <p v-html="afternoon ? afternoon.dish : ''"></p>
            </div>
            <div class="dessert">
              <h2>Dessert</h2>
              <p v-html="afternoon ? afternoon.dessert : ''"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import router from "../router";
import Divider from "../components/icons/IconDivider.vue"
import Leaf from "../components/icons/IconLeaf.vue"
import { socket, state } from "@/socket";
import { read, utils } from 'xlsx';
import moment from "moment";

export default {
    name: "app-menu-display",
    props: {
    },
    components: {
      Divider,
      Leaf
    },
    data() {
        return {
          midday: {},
          afternoon: {}
        }
    },
    emits: [],
    mounted() {
      socket.on("menus info", () => {
        this.resetFormData();
      });
    },
    methods: {
      resetFormData() {
        const currentMenu = state.menus.find(e => moment().isSame(e.date, 'day'));
        
        if (currentMenu) {
          this.midday.starter = currentMenu.midday.starter.replaceAll('\n', '<br />');
          this.midday.dish = currentMenu.midday.dish.replaceAll('\n', '<br />');
          this.midday.dessert = currentMenu.midday.dessert.replaceAll('\n', '<br />');

          this.afternoon.starter = currentMenu.afternoon.starter.replaceAll('\n', '<br />');
          this.afternoon.dish = currentMenu.afternoon.dish.replaceAll('\n', '<br />');
          this.afternoon.dessert = currentMenu.afternoon.dessert.replaceAll('\n', '<br />');
        }
        else {
          this.midday.starter = "";
          this.midday.dish = "";
          this.midday.dessert = "";

          this.afternoon.starter = "";
          this.afternoon.dish = "";
          this.afternoon.dessert = "";
        }
      }
    },
    computed: {
    }
};
</script>

<style>
.display-container {
  @apply absolute w-screen h-screen bg-no-repeat bg-center bg-cover inset-0 overflow-hidden;
  background-image: url(../assets/background.svg);
}
.display-container .display {
  @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-[10px] border-solid border-white/80 rounded-[2rem] bg-white/60;
  @apply shadow-xl shadow-gray-400/30 overflow-hidden flex flex-col py-4;
}
.display .display-header {
  @apply flex w-full justify-center h-[9rem] relative;
}
.display .display-header svg {
  @apply absolute w-[30rem] mt-6 mx-auto fill-white/70;
}
.display .display-body {
  @apply flex w-full h-4/5 justify-around;
}
.display .display-body > div {
  @apply flex flex-col w-1/2 items-center text-center h-full relative;
}
.display .display-body > div > div {
  @apply flex flex-col w-[50rem] h-[12rem] items-center mb-4;
}
.display .display-body .midday::after {
  @apply absolute top-[15%] bottom-[2.5%] w-2 bg-white/70 right-0 rounded-3xl;
  content: '';
}
.display .display-header h1 {
  @apply text-7xl font-normal text-center mt-5;
}
.display .display-body h2 {
  @apply text-5xl font-semibold px-2 pb-2 border-b-4 border-black mb-3;
}
.display .display-body p {
  @apply text-3xl font-medium;
}
.display .display-header .left,
.display .display-header .right {
  @apply w-[22rem];
}
.display .display-header .left {
  @apply left-[7%];
}
.display .display-header .right {
  @apply right-[7%] -scale-100;
}
</style>