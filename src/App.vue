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
        <RouterLink v-if="isConnected" to="/plannings">Plannings</RouterLink>
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

.general-form {
  @apply flex flex-col mt-2 space-y-3;
}

.general-form-date {
  @apply flex h-14 items-center w-full justify-around;

  input[type=date] {
    @apply border-[3px] border-white bg-white/30 rounded-2xl text-xl font-medium px-3 py-1 outline-none w-48 select-none;
  }

  .date-btn {
    @apply border-4 border-white/70 rounded-full p-2;

    &:hover {
      @apply bg-white/60;
    }

    svg {
      @apply stroke-[3] stroke-black/80;
    }
  }
}

.swal2-container {
  @apply w-full max-w-[100vw];

  .swal2-modal {
    @apply rounded-2xl border-solid border-4 bg-white border-gray-500/70 overflow-hidden shadow shadow-gray-400;

    input[type=date] {
      @apply border-[3px] border-gray-300/70 bg-gray-300/30 rounded-xl text-xl font-medium px-3 py-1 outline-none w-48 select-none;
    }

    .btn-import.isActive {
      @apply bg-green-500/30 border-green-500/70;
    }

    h2 {
      @apply bg-transparent;
    }

    .btn:hover {
      @apply border-gray-500/70 bg-gray-500/30;
    }

    .btn-import {
      @apply bg-gray-300/30 border-gray-300/70;

      &.import-view {
        @apply relative;

        svg {
          @apply absolute inset-0 w-full h-full p-3 flex items-center justify-center;
        }

        &.active {
          @apply flex;

          &:hover {
            @apply flex;
          }

          img {
            @apply flex;
          }

          svg {
            @apply hidden;
          }

          &::after {
            @apply absolute top-0 right-0 w-9 h-9 -translate-y-1/4 translate-x-1/3;
            content: '';
            background-size: 100%;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="oklch(82.8% 0.111 230.318)" viewBox="0 0 24 24" stroke-width="1.5" stroke="oklch(48.8% 0.243 264.376)"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>');
          }

          &:hover svg {
            @apply flex;
          }
        }

        img {
          @apply hidden w-full h-full object-contain object-center;
        }
      }
    }

    .btn-input {
      @apply flex rounded-xl border-[3px] bg-gray-200/30 border-gray-300/70 outline-none px-2 py-1.5 text-base font-medium;
    }

    label {
      @apply font-semibold;
    }
  }

  .swal2-actions {
    @apply px-4 flex justify-around w-full;


    .btn {
      @apply min-w-28 outline-none;
    }
  }

  .inputs {
    @apply w-0 h-full flex space-x-3 overflow-hidden transition-all duration-700;

    svg {
      @apply fill-none stroke-2 max-w-8 cursor-pointer;

      &.edit-icon {
        @apply stroke-blue-500;
      }

      &.trash-icon {
        @apply stroke-red-500;
      }
    }

    .icon {
      @apply w-1/2 h-full flex justify-center items-center;
    }
  }

  .anim-list-container,
  .reccurence-list-container {
    @apply flex flex-col items-center rounded-xl w-3/4 h-[30vh] border-[3px] border-gray-300/70 relative pt-12 overflow-hidden;

    .btn-input.btn-anim {
      @apply -inset-x-1 -top-1 absolute px-5 py-2 text-lg;
    }

    .anim-list,
    .reccurence-list {
      @apply w-full h-full flex flex-col space-y-2 overflow-y-scroll;

      li {
        @apply flex w-full border-b-2 px-3 py-1 cursor-default relative text-base;

        p {
          @apply w-full text-start content-center text-ellipsis h-10 pr-1 text-nowrap;
          @apply overflow-hidden transition-all duration-700;
        }

        &:last-child {
          @apply border-b-0;
        }
      }
    }

    .anim-list {
      li:hover {
        .inputs {
          @apply w-20;

          svg {
            @apply w-full h-full;
          }
        }
      }
    }

    .reccurence-list {
      @apply space-y-0;

      &>li {
        @apply flex-col p-0 border-b-4 border-gray-300/70 h-[3.25rem] relative transition-all duration-700 cursor-pointer;

        .inputs {
          @apply absolute right-0 top-1/2 -translate-y-1/2;
        }

        &>p {
          @apply px-2 absolute h-12 w-full z-10 bg-white flex items-center;

          svg {
            @apply w-6 h-6 transition-all duration-700 mr-1;
          }
        }

        ul {
          @apply px-3 pt-12 overflow-hidden;

          p {
            @apply px-3;
          }

          li:hover .inputs {
            @apply w-16 h-full;

            svg {
              @apply w-full h-full;
            }
          }
        }

        &.active {
          &>p {
            @apply shadow;

            svg {
              @apply rotate-90;
            }
          }
        }

        &:last-child {
          @apply border-b-4;
        }
      }
    }
  }

  .edit-planning-container {
    @apply w-full flex flex-col items-center justify-center;

    ul {
      @apply flex flex-col items-center rounded-xl w-3/4 max-h-[30vh] border-[3px] border-gray-300/70 relative overflow-hidden;

      li {
        @apply flex justify-between items-center w-full text-start py-1.5 px-3 border-b-2;

        span {
          @apply font-semibold pr-1;
        }

        &:last-child {
          @apply border-b-0;
        }

        &:hover {
          @apply bg-gray-200/30 cursor-pointer;

          .inputs {
            @apply w-[3.25rem] h-full;

            svg {
              @apply w-full h-full;
            }
          }
        }
      }
    }
  }

  .add-anim-modal-container {
    @apply space-y-0;

    .btn-input {
      @apply px-3 py-1.5 text-lg;
    }

    h2 {
      @apply text-xl pt-4 pb-1 font-medium;
    }
  }

  .add-reccurence-modal-container,
  .add-anim-day-modal-container {
    .animation-search-input {
      @apply relative;

      .btn-input:focus+.animation-search-result {
        @apply w-[110%] h-44 overflow-y-scroll border-gray-300/70 bg-gray-100;
      }

      .animation-search-result {
        @apply absolute left-1/2 top-full -translate-x-1/2 mt-1 flex flex-col border-4 border-transparent bg-transparent rounded-lg w-0 h-0 overflow-hidden z-20;
        @apply shadow delay-200 transition-all;

        li {
          @apply px-2 py-1 flex justify-center cursor-pointer border-b-[3px];

          &:hover {
            @apply bg-gray-200/30;
          }
        }
      }

      .btn-input {
        @apply px-4 border-green-300/70 bg-green-300/30;

        &[data-id=null] {
          @apply bg-gray-200/30 border-gray-300/70;
        }
      }
    }
  }

  .export-modal-container {
    h2 {
      @apply text-xl font-medium;
    }

    .export-week {
      @apply flex flex-col justify-center space-y-3;
    }

    .btn-default {
      @apply border-neutral-200;
    }
  }

  .reccurence-inputs {
    @apply flex flex-col w-full space-y-2;

    .reccurence-day {
      @apply flex items-center justify-around w-3/4 self-center py-2;

      .btn-input {
        @apply w-2/3 p-0 flex h-10;

        &:hover {
          @apply bg-gray-200/30 border-gray-300/70;
        }
      }

      svg {
        @apply w-10 cursor-pointer;

        &:hover {
          @apply opacity-75;
        }
      }
    }

    .reccurence-hour {
      @apply flex items-center justify-center w-3/4 self-center py-2;

      .btn-input {
        @apply w-10 text-center p-0 flex h-10;

        &:hover {
          @apply bg-gray-200/30 border-gray-300/70;
        }
      }

      .points-icon {
        @apply relative w-8 h-full;

        &::before,
        &::after {
          @apply absolute top-0 left-1/2 w-1.5 h-1.5 bg-black/80 transform -translate-x-1/2 translate-y-1/2 rounded-full;
          content: "";
        }

        &::after {
          @apply top-auto bottom-0 -translate-y-1/2;
        }
      }
    }
  }

  .icons-list {
    @apply overflow-x-hidden overflow-y-scroll flex-wrap gap-y-2 h-40;

    .icon-container:not(.active) {
      &:hover {
        @apply border-green-600/70;

        &::after {
          @apply bg-green-300/40;
          background-image: none;
        }
      }
    }
  }

  .add-anim-day-modal-container {
    .animation-search-input {
      .btn-input:focus+.animation-search-result {
        @apply h-24;
      }
    }
  }

  .icons-list {
    @apply w-full p-2 flex border-4 border-gray-300/70 rounded-xl overflow-x-scroll gap-x-3;

    .btn-import,
    .icon-container {
      @apply p-0 flex-none w-[4.5rem] h-[4.5rem];

      svg {
        @apply m-0 w-10 h-10;
      }

      p {
        @apply hidden;
      }
    }

    .icon-container {
      @apply border-4 border-gray-300/70 rounded-xl cursor-pointer relative p-1 bg-violet-200 flex justify-center items-center;

      img {
        @apply object-cover max-h-full;
      }

      &.can-delete:not(.active):hover {
        @apply border-red-600/70;

        &::after {
          @apply absolute inset-0 bg-red-300/70 bg-no-repeat bg-center;
          content: '';
          background-size: 75%;
          background-image: url('data:image/svg+xml,<svg viewBox="0 0 24 24" fill="none" stroke="black" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>');
        }
      }

      &.remove-icon {
        @apply hidden;
      }

      svg {
        @apply w-full h-full p-1.5 fill-none stroke-2 stroke-black/80;
      }

      &.active::after {
        @apply absolute top-0 right-0 w-9 h-9 -translate-y-1/4 translate-x-1/3;
        content: '';
        background-size: 100%;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="oklch(82.8% 0.111 230.318)" viewBox="0 0 24 24" stroke-width="1.5" stroke="oklch(48.8% 0.243 264.376)"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>');
      }
    }
  }

  .edit-decoration-container {
    .icons-list {
      @apply overflow-x-hidden overflow-y-scroll flex-wrap gap-y-2 h-40;

      .icon-container:not(.active) {
        &:hover {
          @apply border-green-600/70;

          &::after {
            @apply bg-green-300/40;
            background-image: none;
          }
        }
      }

      .active {
        @apply cursor-default;
      }
    }

    .icon-placement {
      @apply flex flex-col;

      h2 {
        @apply text-xl pb-2 font-medium;
      }

      .radio-choice-container {
        @apply flex flex-wrap justify-center gap-6;

        .radio-choice {
          @apply flex items-center space-x-3 border-[3px] px-3 py-2 rounded-xl;

          .radio {
            @apply border-4 rounded-full w-4 h-4 border-gray-400/70 bg-gray-300/30;
          }

          &:not(.active) {
            @apply cursor-pointer;

            &:hover {
              @apply bg-gray-300/20;

              .radio {
                @apply bg-gray-300/50;
              }
            }
          }

          &.active {
            @apply border-blue-400/70 bg-blue-300/30 cursor-default;

            .radio {
              @apply border-blue-500/80 bg-blue-400/40;
            }
          }
        }
      }
    }
  }

  .custom-img-day-modal-container {
    .img-upload-container {
      @apply flex w-44 h-44 my-7 relative overflow-hidden;

      .btn-import {
        @apply w-full h-full max-w-none border-[6px] z-10;

        svg {
          @apply w-1/2 h-1/2 m-0 transition-all duration-300 stroke-gray-500 stroke-2;
        }
      }

      &.active .btn-import {
        svg {
          @apply opacity-20;

          &:hover {
            @apply opacity-100;
          }
        }
      }

      img {
        @apply absolute inset-0 object-cover object-center self-center hidden p-3;
      }

      &.active img {
        @apply flex;
      }
    }
  }
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

.general-form-btn {
  @apply flex w-full justify-center space-x-10 py-1;
}

.btn {
  @apply flex border-4 h-12 justify-center items-center rounded-xl text-black/80 font-semibold border-white bg-white/30 w-auto max-w-44 outline-none;

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

.btn-close {
  @apply border-neutral-300/70 bg-neutral-300/30;
}

.custom-month-input {
  @apply flex items-center justify-center w-52 h-10 border-[3px] border-white bg-white/30 relative;
  @apply rounded-2xl text-xl font-medium outline-none select-none;

  span {
    @apply w-full h-full flex items-center justify-center cursor-pointer;


    &:hover {
      @apply bg-white/50;
    }
  }

  .month-container {
    @apply w-full h-full text-center;
  }

  input:focus+.month-container .month-modal {
    @apply absolute bottom-full -inset-x-2 mb-2 flex flex-col;
    @apply bg-gray-50/70 border-white border-4 rounded-xl;
  }
}

.month-select-btn {
  @apply flex border-[3px] border-white bg-white/30 h-10 justify-center items-center rounded-2xl font-medium text-xl;
  @apply relative outline-none w-52;

  .click-input {
    @apply hidden absolute inset-0 cursor-pointer z-10;
  }

  .select-items {
    @apply flex flex-col items-center absolute bottom-full w-full rounded-xl mb-1.5 z-10;
    @apply overflow-hidden transition-all delay-200 duration-500 max-h-0 bg-white;
  }

  .label {
    @apply absolute inset-0 text-center px-2 bg-transparent outline-none rounded-xl caret-transparent;
    @apply cursor-pointer;
  }

  &:hover .label {
    @apply bg-black/5;
  }

  &.active {
    .click-input {
      @apply flex;
    }

    .select-items {
      @apply max-h-40;

      &.has-selected {
        @apply pb-8;

        .select-remove {
          @apply opacity-100 h-8 delay-200;
        }
      }

      .select-items-container {
        @apply border-gray-500/30;
      }
    }
  }
}

.modal-container {
  @apply flex flex-col space-y-6 items-center;

  label:not(.btn) {
    @apply flex justify-around w-4/5 items-center font-medium;
  }
}
</style>
