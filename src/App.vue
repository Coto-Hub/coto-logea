<script>
import Swal from "sweetalert2";
import { RouterLink, RouterView } from 'vue-router';
import { socket, state } from "@/socket";

export default {
  name: "App",
  components: {
  },
  setup() {

    return {
    };
  },
  mounted() {
    socket.on("alert", (obj) => {
      Swal.mixin({
        customClass: {
          confirmButton: `btn mx-3 ${obj.isError ? 'btn-cancel' : 'btn-confirm'}`,
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: obj.title,
        text: obj.error,
      });
    });
  },
  computed: {
    isConnected() {
      return state.company ? state.company.id : false;
    },
    getCurrentName() {
      return state.company.name;
    }
  }
};
</script>

<template>
  <header class="w-full h-14 flex bg-white/60">
    <div class="container pl-4 flex justify-between h-full items-center">
      <h1 class="font-semibold text-xl">{{ getCurrentName ?? "Villa" }}</h1>
      <nav class="nav-container">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink v-if="isConnected" to="/residents">Résidents</RouterLink>
        <RouterLink v-if="isConnected" to="/menus">Menus</RouterLink>
      </nav>
    </div>
  </header>
  <div class="page-container container mx-auto">
    <RouterView />
  </div>
</template>

<style lang="scss">
html,
body {
  @apply w-full h-full;
}

main {
  @apply w-full h-full mx-4 flex flex-col justify-center items-center;
}

#app {
  @apply w-screen h-screen bg-no-repeat bg-center bg-cover flex flex-col absolute;
  background-image: url(./assets/background.svg);
}

.container {
  @apply mx-auto;
}

.page-container {
  @apply w-full flex text-lg justify-center items-center;
  height: calc(100% - 3.5rem);
}

.page-container h1 {
  @apply font-semibold text-3xl;
}

.nav-container {
  @apply flex text-lg h-full;
}

.nav-container a {
  @apply flex h-full font-medium items-center px-6;
}

.nav-container a:hover {
  @apply bg-gray-500/5;
}

.nav-container a.router-link-active {
  @apply font-bold bg-gray-500/10;
}

.swal2-container {
  @apply w-full max-w-[100vw];
}

.swal2-container .swal2-modal {
  @apply rounded-2xl border-solid border-4 bg-white border-gray-500/70 overflow-hidden shadow shadow-gray-400;
}

.swal2-container .swal2-modal h2 {
  @apply bg-transparent;
}

.swal2-container .swal2-modal .btn:hover {
  @apply border-gray-500/70 bg-gray-500/30;
}

.swal2-container .swal2-modal .btn-import {
  @apply bg-gray-300/30 border-gray-300/70;
}

.swal2-container .swal2-modal label {
  @apply font-semibold;
}

.swal2-container .swal2-actions {
  @apply px-4 flex justify-around w-full;
}

.swal2-container .swal2-actions .btn {
  @apply min-w-28 outline-none;
}

.swal2-container .swal2-modal input[type=date] {
  @apply border-[3px] border-gray-300/70 bg-gray-300/30 rounded-xl text-xl font-medium px-3 py-1 outline-none w-48 select-none;
}

.swal2-container .swal2-modal .btn-import.isActive {
  @apply bg-green-500/30 border-green-500/70;
}

.checkbox {
  @apply border-4 border-gray-300/70 bg-gray-300/30 w-2/3;

  &:hover {
    @apply bg-gray-300/50;
  }
}

.select-checkbox,
.checkbox {
  @apply flex p-2 cursor-pointer rounded-xl space-x-4 items-center;

  @screen md {
    @apply w-full max-w-80;
  }

  p {
    @apply w-5/6;
  }

  .checkbox-display {
    @apply relative flex size-4 border-[3px] border-blue-400 rounded;

    &::after {
      @apply absolute bg-blue-400 inset-1/2 transition-all;
      content: '';
    }
  }

  &.checked .checkbox-display::after {
    @apply inset-px;
  }
}

.research {
  @apply flex overflow-hidden rounded-xl font-medium border-4 text-black/80 border-white bg-white/30 w-auto max-w-44;

  @screen md {
    @apply w-44;
  }

  input {
    @apply w-full outline-none px-3 py-1.5 bg-transparent placeholder:text-black/40 text-center;
  }
}

.general-container {
  @apply w-full mx-4 flex border-4 rounded-3xl shadow-xl shadow-gray-400/30 px-4 pt-6 pb-3 bg-white/60 border-white/70 flex-col items-center relative;

  @screen lg {
    @apply w-3/4;
  }

  .general-content {
    @apply w-full overflow-x-hidden overflow-y-scroll flex flex-col items-center pt-4;
  }
}

.menu-form-btn {
  @apply flex w-full justify-center space-x-10 py-1;
}

.btn {
  @apply flex border-4 h-12 justify-center items-center rounded-xl text-black/80 font-semibold border-white bg-white/30 w-auto max-w-44;

  @screen md {
    @apply w-44;
  }
}

.multi-select {
  @apply flex border-4 h-10 justify-center items-center rounded-xl text-black/80 font-semibold border-gray-300/70 bg-gray-300/30 w-full max-w-64;
  @apply relative;

  .multi-select-options {
    @apply absolute h-0 overflow-y-scroll overflow-x-hidden flex transition-all duration-700;
    @apply border-0 border-gray-300/70 bg-gray-100 rounded-xl z-10;
    @apply top-full mt-2 flex-col inset-x-0;

    label {
      @apply w-full flex px-3 py-1;

      p {
        @apply w-full;
      }

      &:hover {
        @apply bg-gray-200 rounded-lg;
      }
    }
  }

  .multi-select-label {
    @apply w-full h-full relative flex items-center justify-center cursor-pointer;

    svg {
      @apply absolute size-6 stroke-2 top-1/2 -translate-y-1/2 right-1.5 left-auto mt-0.5 transition-all duration-500;
    }
  }

  &.active {
    .multi-select-label svg {
      @apply rotate-180;
    }

    .multi-select-options {
      @apply h-44 p-2 border-4;
    }
  }
}

.btn:not(.disabled):hover {
  @apply bg-white/40 border-white/10 cursor-pointer;
}

.btn svg {
  @apply mr-6 stroke-[3px] stroke-black/80;
}

.btn-cancel {
  @apply border-red-500/70 bg-red-500/30;
}

.btn.disabled {
  @apply cursor-default opacity-20;
}

.btn-confirm {
  @apply border-green-500/70 bg-green-500/30;
}
</style>
