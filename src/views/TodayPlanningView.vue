<template>
  <div class="display-container">
    <div class="display">
      <div class="display-header">
        <Arrow class="left" />
        <h1 class="love-ya-like-a-sister-regular">Planning du jour</h1>
        <Arrow class="right" />
      </div>
      <div class="display-body grandstander">
        <div class="display-row" v-for="anim in getPlanning" :key="anim.id">
          <span class="hour">{{ anim.hour }} : </span>
          <p>{{ anim.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Arrow from "../components/icons/IconArrow.vue"
import { socket, state } from "@/socket";
import moment from "moment";

export default {
  name: "app-planning-display",
  props: {
  },
  components: {
    Arrow
  },
  data() {
    return {
    }
  },
  emits: [],
  mounted() {
    socket.on("planning info", ({ planning, decorations }) => {
      // this.resetFormData();
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
    getPlanning() {
      return state.plannings.filter(a => moment(a.dateTime).isSame(moment(), 'days')).map(a => {
        return {
          id: a.id,
          hour: moment(a.dateTime).format("HH[h]mm").replace(/^0/, ''),
          content: a.content
        };
      });
    }
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
    @apply border-[10px] border-solid border-white/80 rounded-[2rem] bg-white/60;
    @apply shadow-xl shadow-gray-400/30 overflow-x-hidden overflow-y-scroll flex flex-col py-4;

    @screen md {
      @apply overflow-hidden;
    }
  }

  .display-header {
    @apply flex w-full justify-around h-[6rem] pb-4 relative items-center;

    svg {
      @apply mx-auto fill-white/70 hidden w-1/4 px-4;

      @screen md {
        @apply flex;
      }
    }

    h1 {
      @apply text-4xl font-normal text-center w-full pb-4 underline underline-offset-4;

      @screen md {
        @apply text-5xl w-auto pb-0 no-underline;
      }

      @screen xl {
        @apply text-7xl;
      }
    }
  }

  .display-body {
    @apply flex flex-col items-center justify-around space-y-4 min-h-[70vh];

    .display-row {
      @apply flex justify-center items-center;

      p {
        @apply w-full text-2xl font-medium;

        @screen xl {
          @apply text-5xl;
        }
      }

      .hour {
        @apply text-5xl pr-2 text-nowrap;
        font-family: "Lazy Dog Regular";
        // text-shadow: 0.1rem 0.1rem 0.5rem red; //rgba(0, 0, 0, 0.3);
      }
    }
  }
}

.display .display-body>div>div {
  @apply flex flex-col max-w-[50rem] h-[11rem] items-center mb-10 px-3;

  @screen md {
    @apply h-[12rem];
  }
}

.display .display-body .midday::after {
  @apply absolute bottom-6 w-[85%] h-2 bg-white/70 rounded-full;
  content: '';

  @screen md {
    @apply flex top-0 bottom-[2.5%] right-0 w-2 h-auto;
  }
}

.display .display-header .right {
  @apply -scale-100;
}
</style>