<template>
  <div class="display-container">
    <div class="display">
      <div class="display-header">
        <Arrow class="left" />
        <h1 class="love-ya-like-a-sister-regular">Menu du jour</h1>
        <Arrow class="right" />
      </div>
      <div class="display-body grandstander">
        <div class="part-section midday">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
            Midi
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
          </h2>
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
        <div class="part-section afternoon">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
            Soir
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
          </h2>
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
import Arrow from "../components/icons/IconFork.vue"
import { socket, state } from "@/socket";
import moment from "moment";

export default {
  name: "app-menu-display",
  props: {
  },
  components: {
    Arrow
  },
  data() {
    return {
      midday: {},
      afternoon: {}
    }
  },
  emits: [],
  mounted() {
    socket.on("menu info", ({ menu }) => {
      this.resetFormData();
    });
  },
  methods: {
    resetFormData() {
      const currentMenu = state.displayMenus.find(e => moment().isSame(e.date, 'day'));
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

<style lang="scss">
.display-container {
  @apply absolute w-screen h-screen bg-no-repeat bg-center bg-cover inset-0 overflow-hidden;
  @apply flex flex-col justify-center p-4 w-full;
  background-image: url(../assets/background.svg);

  @screen md {
    @apply w-auto;
  }

  .display {
    @apply border-[10px] border-solid border-white/80 rounded-[2rem] bg-white/60 min-h-[60vh] justify-around;
    @apply shadow-xl shadow-gray-400/30 overflow-x-hidden overflow-y-scroll flex flex-col py-[3vh];

    @screen md {
      @apply overflow-hidden;
    }
  }

  .display-header {
    @apply flex w-full justify-around h-[10vh] pb-[7vh] relative items-center;

    svg {
      @apply mx-auto fill-white/70 hidden w-1/4 max-h-[27.5vh] px-4 rotate-90;

      @screen md {
        @apply flex;
      }

      &.right {
        @apply -scale-100;
      }
    }

    h1 {
      @apply text-4xl font-normal text-center w-full pb-4 underline underline-offset-4;

      @screen md {
        @apply text-5xl w-auto pb-0 no-underline;
      }

      @screen 2xl {
        @apply text-6xl;
      }
    }
  }

  .display-body {
    @apply flex flex-col justify-around space-y-4;

    @screen md {
      @apply flex-row space-y-0;
    }

    .part-section {
      @apply flex flex-col w-full items-center text-center h-full relative;

      @screen md {
        @apply w-1/2;
      }

      &>h2 {
        @apply self-start ml-6 border-0 flex items-center mb-0;

        svg {
          @apply size-5 mx-1 mb-1;
        }

        svg+svg {
          @apply -scale-x-100;
        }
      }
    }

    h2 {
      @apply text-3xl font-medium px-2 pb-1 border-b-4 border-black mb-6;

      @screen md {
        @apply text-4xl;
      }

      @screen 2xl {
        @apply text-5xl;
      }
    }

    p {
      @apply w-full text-2xl font-medium;

      @screen 2xl {
        @apply text-4xl;
      }
    }
  }
}

.display .display-body>div>div {
  @apply flex flex-col max-w-[50rem] h-[11rem] items-center mb-10 px-3;

  @screen md {
    @apply h-[17.5vh];
  }
}

.display .display-body .midday::after {
  @apply absolute bottom-6 w-[85%] h-2 bg-white/70 rounded-full;
  content: '';

  @screen md {
    @apply flex top-0 bottom-[2.5%] right-0 w-2 h-auto;
  }
}
</style>