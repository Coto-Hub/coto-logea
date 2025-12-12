<template>
  <div class="display-container">
    <div class="display">
      <div class="display-header">
        <Flower class="left" />
        <h1 class="love-ya-like-a-sister-regular">Planning du jour</h1>
        <Flower class="right" />
      </div>
      <div class="display-body grandstander">
        <div class="anim-list">
          <div class="display-row" v-for="anim in getPlanning" :key="anim.id">
            <div class="hour">
              <p>{{ anim.hour }}</p>
            </div>
            <p>{{ anim.content }}</p>
          </div>
        </div>
        <div v-if="icons && icons.length" class="icon-list">
          <div class="display-icon">
            <img v-for="icon in icons" :class="{ active: icon.active }" :key="icon.id"
              :src="getUrl + icon.path.replace('./', '/')" :alt="icon.label" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Flower from "../components/icons/IconArrow.vue"
import { socket, state } from "@/socket";
import moment from "moment";


export default {
  name: "app-planning-display",
  props: {
  },
  components: {
    Flower
  },
  data() {
    return {
      icons: [],
      currentInterval: null
    }
  },
  emits: [],
  mounted() {
    socket.on("planning info", ({ planning, decorations }) => {
      this.resetFormData();
    });
    this.resetFormData();
  },
  methods: {
    resetFormData() {
      this.icons = [];
      const icons = [];
      const current = state.displayDecorations.find(d => moment(d.date).isSame(moment(), 'days'));
      if (current) {
        current.active = false;
      }
      state.displayPlannings.filter(a => moment(a.dateTime).isSame(moment(), 'days')).forEach(a => {
        if (a.icons && a.icons.length > 0) {
          a.icons.forEach(icon => {
            if (current && icon.id == current.iconId) {
              return;
            }
            if (!icons.find(i => i.id == icon.id)) {
              icons.push({ ...icon, active: false });
            }
          });
        }
      });
      this.icons = current ? [current, ...this.shuffleArray(icons)] : this.shuffleArray(icons);
      setTimeout(() => {
        if (this.icons.length > 0) {
          this.icons[0].active = true;
          clearInterval(this.currentInterval);
          this.currentInterval = setInterval(() => {
            this.updateCurrentIcon();
          }, 5000);
        }
      }, 300);
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    updateCurrentIcon() {
      const currentIndex = this.icons.findIndex(i => i.active) ? this.icons.findIndex(i => i.active) : 0;
      this.icons[currentIndex].active = false;
      const nextIndex = (currentIndex + 1) % this.icons.length;
      this.icons[nextIndex].active = true;
    }
  },
  computed: {
    getUrl() {
      return state.url;
    },
    getPlanning() {
      return state.displayPlannings.filter(a => moment(a.dateTime).isSame(moment(), 'days')).map(a => {
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
    @apply border-[10px] border-solid border-white/80 rounded-[2rem] bg-white/60 w-[95vw] mx-auto;
    @apply shadow-xl shadow-gray-400/30 overflow-x-hidden overflow-y-scroll flex flex-col py-[2vh];

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

      &.right {
        @apply -scale-100;
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
    @apply flex flex-row min-h-[70vh] pl-8 pr-4;

    .anim-list {
      @apply flex flex-col items-center justify-around space-y-4 w-2/3;
    }

    .icon-list {
      @apply flex flex-col justify-center items-center w-1/3;

      .display-icon {
        @apply overflow-hidden flex justify-center items-center relative bg-rose-200 shadow-inner shadow-black/70;
        @apply aspect-square w-2/3 rounded-full border-8 border-rose-500/50;

        img {
          @apply absolute max-w-none max-h-none transition-all duration-1000 ease-in-out opacity-0 aspect-square object-contain w-full h-full;
          @apply shadow-inner shadow-rose-400/30;

          &.active {
            @apply opacity-100;
          }
        }
      }
    }

    .display-row {
      @apply flex justify-center w-full items-center min-h-[14vh] border-8 border-rose-500/50 rounded-full relative;
      @apply shadow-md space-x-4 bg-white/30 pl-[14.5vh] max-w-[50vw];

      &>p {
        @apply w-full text-2xl font-medium pr-[1.5vh];

        @screen xl {
          @apply text-5xl;
        }
      }

      .hour {
        @apply absolute flex justify-center items-center aspect-square rounded-full text-center;
        @apply -left-5 -inset-y-5 bg-rose-200 border-rose-600/50 border-8;

        p {
          @apply text-3xl text-nowrap font-bold text-neutral-900/90;
          font-family: "Lazy Dog Regular";

          @screen xl {
            @apply text-4xl;
          }
        }

        // text-shadow: 0.1rem 0.1rem 0.5rem red; //rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>