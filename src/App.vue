<script>
import Swal from "sweetalert2";
import { RouterLink, RouterView } from 'vue-router';
import { socket, state } from "@/socket";
import moment from "moment";

moment.locale('fr', {
  months: 'Janvier_Février_Mars_Avril_Mai_Juin_Juillet_Août_Septembre_Octobre_Novembre_Décembre'.split('_'),
  monthsShort: 'janv_févr_mars_avr_mai_juin_juil_août_sept_oct_nov_déc'.split('_'),
  monthsParseExact: true,
  weekdays: 'Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi'.split('_'),
  weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
  weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
  weekdaysParseExact: true,
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd D MMMM YYYY HH:mm'
  },
  calendar: {
    sameDay: '[Aujourd’hui à] LT',
    nextDay: '[Demain à] LT',
    nextWeek: 'dddd [à] LT',
    lastDay: '[Hier à] LT',
    lastWeek: 'dddd [dernier à] LT',
    sameElse: 'L'
  },
  relativeTime: {
    future: 'dans %s',
    past: 'il y a %s',
    s: 'quelques secondes',
    m: 'une minute',
    mm: '%d minutes',
    h: 'une heure',
    hh: '%d heures',
    d: 'un jour',
    dd: '%d jours',
    M: 'un mois',
    MM: '%d mois',
    y: 'un an',
    yy: '%d ans'
  },
  dayOfMonthOrdinalParse: /\d{1,2}(er|e)/,
  ordinal: function (number) {
    return number + (number === 1 ? 'er' : 'e');
  },
  meridiemParse: /PD|MD/,
  isPM: function (input) {
    return input.charAt(0) === 'M';
  },
  // In case the meridiem units are not separated around 12, then implement
  // this function (look at locale/id.js for an example).
  // meridiemHour : function (hour, meridiem) {
  //     return /* 0-23 hour, given meridiem token and hour 1-12 */ ;
  // },
  meridiem: function (hours, minutes, isLower) {
    return hours < 12 ? 'PD' : 'MD';
  },
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // Used to determine first week of the year.
  }
});

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
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink v-if="isConnected" to="/meals">Restauration</RouterLink>
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

  .btn.btn-default {
    @apply border-neutral-200 outline-none;
  }

  .swal2-modal {
    @apply rounded-2xl border-solid border-4 bg-white border-gray-500/70 overflow-hidden shadow shadow-gray-400;


    .edit-user-btn,
    .trash-user-btn {
      @apply absolute w-10 h-10 right-4 top-4 cursor-pointer;

      svg {
        @apply fill-none stroke-2 stroke-gray-500/70;
      }

      &:hover {
        svg {
          @apply stroke-gray-900/80 fill-neutral-300/60;
        }
      }

      &.trash-user-btn {
        @apply left-4 right-auto;

        svg {
          @apply stroke-red-500/60 fill-red-300/30;

          &:hover {
            @apply stroke-red-500/80 fill-red-300/60;
          }
        }
      }
    }

    .empty-list {
      @apply py-2;
    }

    .input-row {
      @apply flex w-full justify-center items-center space-x-5;
    }

    input[type=date] {
      @apply border-[3px] border-gray-300/70 bg-gray-300/30 rounded-xl text-xl font-medium px-3 py-1 outline-none w-48 select-none;
    }

    .btn-switch-select {
      @apply relative flex h-10 w-28 items-center border-[3px] bg-gray-200/30 border-gray-300/70 rounded-xl;

      .switch-label {
        @apply absolute inset-0 flex items-center justify-around px-2 cursor-pointer;

        .current-choice {
          @apply w-full text-left;
        }

        svg {
          @apply w-8 fill-none stroke-2 stroke-neutral-700 transition-all duration-500;
        }

        &:hover {
          @apply bg-gray-300/40;
        }
      }

      &.active {
        .switch-label {
          @apply bg-gray-300/20;
        }

        svg {
          @apply rotate-180;
        }

        .switch-list {
          @apply h-full border-2;
        }
      }

      .switch-list {
        @apply flex flex-col absolute top-full mt-1 inset-x-0 h-0 overflow-hidden transition-all duration-500 bg-neutral-100 border-gray-300/70 rounded-xl;

        .choice {
          @apply flex h-full w-full px-2 items-center cursor-pointer;

          &:hover {
            @apply bg-gray-300/40;
          }
        }
      }
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

      &.btn-number {
        @apply p-0;

        input[type="number"] {
          @apply w-10 bg-transparent outline-none text-center font-bold text-xl;
          -moz-appearance: textfield;

          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        }

        svg {
          @apply h-8 w-8 p-1 stroke-gray-600/70 fill-none stroke-[3px] cursor-pointer;

          &:hover {
            @apply stroke-gray-900/80 fill-neutral-300/60;
          }
        }
      }
    }

    .btn-checkbox {
      @apply flex items-center justify-center rounded-xl border-[3px] bg-gray-200/30 border-gray-300/70 w-auto;
      @apply cursor-pointer;

      input {
        @apply hidden;
      }

      input:checked+.checkmark svg {
        @apply stroke-blue-500/90;
      }

      .checkmark {
        @apply ml-1 mr-2 flex w-8 h-8;

        svg {
          @apply w-full h-full fill-none stroke-2 stroke-gray-500/20;
        }
      }

      .label {
        @apply py-2 pr-3;
      }

      &:hover {
        @apply bg-gray-300/40;
      }

      &.active {
        @apply border-blue-500/80;
      }
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
    @apply w-0 h-full flex space-x-3 overflow-hidden transition-all duration-500;

    svg {
      @apply fill-none stroke-2 max-w-8 cursor-pointer;

      &.edit-icon {
        @apply stroke-blue-500;
      }

      &.trash-icon {
        @apply stroke-red-500;
      }
    }

    .order-container {
      @apply flex flex-col;

      svg.order-icon {
        @apply h-1/2 stroke-neutral-400 stroke-[5px] fill-none;

        &:hover {
          @apply stroke-neutral-800;
        }
      }
    }

    .icon {
      @apply w-1/3 h-full flex justify-center items-center;
    }
  }

  .default-list-container {
    @apply flex flex-col items-center rounded-xl w-3/4 h-[30vh] border-[3px] border-gray-300/70 relative pt-12 overflow-hidden;

    .btn-input.btn-search {
      @apply -inset-x-1 -top-1 absolute px-5 py-2 text-lg;
    }

    .default-list {
      @apply w-full h-full flex flex-col overflow-y-scroll;

      li {
        @apply flex w-full border-b-2 px-3 py-1 cursor-default relative text-base;

        p {
          @apply w-full text-start content-center text-ellipsis h-10 pr-1 text-nowrap;
          @apply overflow-hidden transition-all duration-500;
        }

        &:last-child {
          @apply border-b-0;
        }
      }

      &.user-list {
        li {
          @apply cursor-pointer border-b-2;

          &:hover {
            @apply bg-neutral-200/40;
          }

          &:not(.staff-item)[data-configs="0"] {
            @apply bg-red-50;

            &:hover {
              @apply bg-neutral-200/40;
            }
          }

          .config-nb {
            @apply absolute right-2 top-1/2 -translate-y-1/2 text-lg;

            span {
              @apply font-semibold;
            }
          }
        }
      }
    }

    .signle-list {
      li:hover {
        .inputs {
          @apply w-32;

          svg:not(.order-icon) {
            @apply w-full h-full;
          }
        }
      }
    }

    .reccurence-list,
    .history-list {
      @apply space-y-0;

      &>li {
        @apply flex-col p-0 border-b-4 border-gray-300/70 h-[3.25rem] relative transition-all duration-500 cursor-pointer;

        .inputs {
          @apply absolute right-0 top-1/2 -translate-y-1/2;
        }

        &>p {
          @apply px-2 absolute h-12 w-full z-10 bg-white flex items-center;

          svg {
            @apply w-6 h-6 transition-all duration-500 mr-1;
          }

          .trash {
            @apply mr-0;

            .trash-icon {
              @apply fill-none cursor-pointer stroke-2 max-w-8 opacity-50 w-full;
              @apply stroke-red-500/60 fill-red-300/30;

              &:hover {
                @apply stroke-red-500/80 fill-red-300/60 opacity-100;
              }
            }
          }

          .edit {
            .edit-icon {
              @apply fill-blue-200/40 cursor-pointer stroke-2 max-w-8 opacity-50 w-full;
              @apply stroke-blue-500/70;

              &:hover {
                @apply stroke-blue-600/90 opacity-100;
              }
            }
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

            svg.arrow {
              @apply rotate-90;
            }
          }
        }
      }
    }
  }

  .history-modal-container {
    .content-input {
      @apply flex flex-wrap justify-around w-full;

      h1 {
        @apply w-full text-xl font-bold text-center;
      }

      h2 {
        @apply text-lg font-medium text-center;
      }
    }
  }

  .meal-list-container {
    .signle-list.default-list {
      li:first-child .order-container {
        .order-icon:first-child {
          @apply opacity-0 cursor-default;
        }
      }

      li:last-child .order-container {
        .order-icon:last-child {
          @apply opacity-0 cursor-default;
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

        p {
          @apply w-4/5 truncate;
        }

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

  .add-guest-modal-container {
    .content-input {
      @apply flex justify-center items-center flex-wrap w-full space-x-6;

      .btn-switch {
        @apply w-1/2 border-[3px] border-gray-300/70 bg-gray-300/30;

        .active {
          @apply font-semibold;
        }
      }

      p {
        @apply flex-none w-full font-medium pt-4;
      }

      .date-container {
        @apply space-y-1;
      }

      .btn-number {
        @apply w-28;
      }

      h2 {
        @apply text-xl font-medium;
      }
    }
  }

  .animation-search-input,
  .users-search-input {
    @apply relative;

    .btn-input[data-id="null"]:focus+.search-result {
      @apply w-[110%] h-44 overflow-y-scroll border-gray-300/70 bg-gray-100;
    }

    .search-result {
      @apply absolute left-1/2 top-full -translate-x-1/2 mt-1 flex flex-col border-4 border-transparent bg-transparent rounded-lg w-0 h-0 overflow-hidden z-20;
      @apply shadow delay-200 transition-all;

      li {
        @apply px-2 py-1 flex justify-center cursor-pointer border-b-[3px];

        &:hover {
          @apply bg-gray-200/30;
        }
      }
    }

    &.users-search-input .btn-input[data-id="null"]:focus+.search-result {
      @apply h-32;
    }

    .btn-input {
      @apply px-4 border-green-300/70 bg-green-300/30;

      &[data-id=null] {
        @apply bg-gray-200/30 border-gray-300/70;
      }
    }
  }

  .triple-select-input {
    @apply relative w-48;

    .btn-input {
      @apply cursor-pointer caret-transparent pl-9 font-semibold w-full;

      &:hover {
        @apply bg-gray-400/20 text-gray-900;

        +.arrow {
          @apply stroke-gray-900/80;
        }
      }
    }

    .arrow {
      @apply absolute left-1.5 top-2 w-7 transition-transform duration-700 rotate-90;
      @apply cursor-pointer stroke-2 stroke-gray-500/70;
    }

    .triple-select-list {
      @apply flex flex-col absolute bg-white border-4 border-transparent rounded-xl;
      @apply overflow-hidden w-full h-0 transition-all duration-700 top-11;

      li {
        @apply flex w-full text-center py-1 pl-9 border-b-2 cursor-pointer;

        &:hover {
          @apply bg-gray-200/50;
        }
      }
    }

    input:focus {
      ~.triple-select-list {
        @apply h-[4.5rem] border-gray-300/70;
      }

      ~.arrow {
        @apply rotate-0;
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

    .export-list {
      @apply border-4 rounded-xl w-3/4 h-56 relative overflow-hidden flex;

      .btn-list-container {
        @apply w-2/3 flex flex-col justify-around items-center relative;
        box-shadow: 0px 0px 0.75rem 0.125rem rgba(0, 0, 0, 0.125) inset;

        .btn {
          @apply absolute top-1/2 px-3 left-full translate-x-full -translate-y-1/2 transition-all duration-500;
          @apply truncate inline;

          &:first-child {
            @apply left-0 -translate-x-full;
            top: 20%;
          }

          &:last-child {
            @apply left-0 -translate-x-full;
            top: 80%;
          }
        }

        &.active {
          .btn {
            @apply left-1/2 -translate-x-1/2;
          }
        }
      }

      .export-btn {
        @apply h-full w-1/6 bg-neutral-100 border-r-[3px] z-10;

        &.right {
          @apply border-r-0 border-l-[3px];
        }

        svg {
          @apply w-full stroke-neutral-400 stroke-2;
        }

        &:hover {
          @apply bg-neutral-200;

          svg {
            @apply stroke-neutral-500;
          }
        }
      }
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

  .setting-modal-container {
    .setting-part {
      @apply flex flex-col w-full items-center space-y-4;

      h2 {
        @apply text-xl font-semibold border-b-2 border-neutral-600;
      }

      .btn {
        @apply font-medium;
      }
    }
  }

  .show-user-modal-container {
    @apply space-y-0;

    h2 {
      @apply text-2xl font-medium pb-2;
    }
  }

  .user-config-list-container {
    @apply flex flex-col items-center rounded-xl w-4/5 h-[25vh] border-4 relative border-gray-300/70;

    .list-config {
      @apply w-full h-full flex flex-col overflow-y-scroll;

      li {
        @apply w-full py-2 border-b-2 cursor-pointer;

        &:hover {
          @apply bg-gray-300/30;
        }
      }
    }

    .btn-add {
      @apply absolute -right-1 -bottom-1 p-0.5 w-12 h-12 border-4 border-gray-300/70 z-10 bg-white;

      svg {
        @apply w-full h-full m-0;
      }

      &:hover {
        @apply bg-gray-100 border-gray-300/70;
      }
    }
  }

  .add-user-config-modal-container {
    h2 {
      @apply text-xl font-semibold;
    }

    .meal-table {
      @apply w-full border-collapse;

      thead {
        tr {
          @apply border-b-4;
        }

        th {
          @apply border-r-4 border-gray-300/70 py-1;

          &:nth-child(n+2) {
            @apply border-t-4;
          }
        }
      }

      td {
        @apply border-r-2;

        &:last-child {
          @apply border-r-0;
        }
      }

      tbody {
        @apply relative;

        td:first-child {
          @apply text-lg font-medium py-1 border-l-4 border-gray-300/70;
        }

        td:last-child {
          @apply border-r-4 border-gray-300/70;
        }

        tr:last-child {
          @apply border-b-4;
        }

        tr:not(:last-child) {
          @apply border-b-[3px] border-gray-400/60;
        }

        tr[data-meal="false"] {
          td:nth-child(n+3) {
            @apply cursor-not-allowed;

            .custom-checkbox,
            .select-label {
              @apply cursor-not-allowed;
            }
          }

          td:last-child {
            .btn-select {
              @apply text-gray-400 border-gray-100 bg-gray-50;
            }
          }
        }
      }

      .custom-checkbox {
        @apply mx-auto border-[3px] bg-gray-200/20 w-6 h-6 rounded-md cursor-pointer relative border-gray-300/70;

        &:not(.disabled) {
          &:hover {
            @apply bg-gray-200/50 border-gray-400;
          }

          &.active {
            @apply bg-gray-300/50 border-gray-500;

            &::after {
              @apply bg-gray-600/80 shadow shadow-gray-500/70;
            }

            &:hover {
              @apply border-gray-400;
            }
          }

          &::after {
            @apply absolute flex inset-0.5 bg-gray-300/70 rounded-full shadow-inner shadow-gray-400/70;
            content: '';
          }
        }

        &.disabled {
          @apply border-gray-300/20 cursor-not-allowed;
        }
      }

      .btn-select {
        @apply flex items-center h-10 border-[3px] border-gray-300/70 bg-gray-300/30 rounded-xl;
        @apply cursor-pointer text-nowrap font-medium w-40 mx-auto;

        &.not-delivery {
          @apply hidden;
        }

        &[data-nb="0"] {
          @apply bg-gray-200/30 border-gray-300/50 text-gray-400;

          .select-list {
            @apply bg-gray-100 border-gray-400/70 text-neutral-600;
          }
        }

        .select-label {
          @apply absolute flex p-2 w-40 text-base text-center;

          p {
            @apply w-full;
          }
        }

        .select-list {
          @apply absolute h-0 w-40 top-0 right-1/4 bg-gray-100 z-10 border-none rounded-md border-gray-400/70 overflow-hidden;

          .label {
            @apply py-1;

            &:first-child {
              @apply flex justify-around cursor-default;

              svg {
                @apply h-6 w-6 fill-none stroke-2 stroke-gray-500/70;

                &:hover {
                  @apply stroke-gray-900/80 fill-neutral-300/60 cursor-pointer;
                }
              }
            }
          }

          .choice {
            @apply flex items-center w-full px-3 py-1;

            .custom-checkbox {
              @apply ml-0 mr-2 flex-none;
            }

            &.active {
              .custom-checkbox {
                @apply bg-gray-300/50 border-gray-500;

                &::after {
                  @apply bg-gray-600/80 shadow shadow-gray-500/70;
                }
              }
            }

            &:hover {
              @apply bg-gray-300/30;

              .custom-checkbox {
                @apply bg-gray-200/50 border-gray-400;
              }
            }

            &.disabled {
              @apply cursor-not-allowed text-gray-400/70 bg-gray-100/40;

              .custom-checkbox {
                @apply border-gray-300/20 bg-gray-200/20;

                &::after {
                  @apply bg-gray-200/50 shadow-gray-300;
                }
              }
            }
          }
        }

        &.active {
          @apply border-gray-700/70;

          .select-list {
            @apply border-solid border-2 h-auto;
          }
        }
      }
    }

    .content-input {
      @apply flex justify-around w-3/4;

      .date-container {
        @apply space-y-1;

        p {
          @apply h-10 content-center text-xl font-bold tracking-widest;
        }
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

  .general-footer {
    @apply flex w-full justify-around items-center pt-4;

    .btn-left-container,
    .btn-right-container {
      @apply w-1/3 flex justify-around;
    }

    .general-form-date {
      @apply flex h-full items-center justify-around w-1/3;

      .form-date::-webkit-calendar-picker-indicator {
        opacity: 0;
      }
    }
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
    @apply absolute h-0 overflow-y-scroll overflow-x-hidden flex transition-all duration-500;
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

.double-switch,
.triple-switch {
  @apply w-2/3 h-12 flex items-center relative border-4 rounded-2xl outline-none cursor-pointer overflow-hidden;
  @apply text-black/70 font-semibold border-neutral-300/70 bg-neutral-300/30;

  .btn-switch-choice {
    @apply z-10 h-full;

    &:not(.active):hover {
      @apply text-black;
    }

    &.active {
      @apply text-black/90;
    }
  }

  .btn-element {
    @apply absolute h-full bg-white/80 transition-all duration-300 rounded-xl left-0;
  }
}

.triple-switch {

  .btn-element,
  .btn-switch-choice {
    @apply w-1/3;
  }

  &[data-value="event"] {
    .btn-element {
      @apply left-1/3;
    }
  }

  &[data-value="guest"] {
    .btn-element {
      @apply left-2/3;
    }
  }
}

.double-switch {

  .btn-element,
  .btn-switch-choice {
    @apply w-1/2;
  }

  &[data-value="months"] {
    .btn-element {
      @apply left-1/2;
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

  .warning-label {
    @apply text-xl text-orange-500 font-medium relative;

    &::before,
    &::after {
      @apply absolute w-8 h-8 bg-no-repeat bg-center bg-contain -left-10;
      content: '';
      background-image: url('data:image/svg+xml,<%3Fxml version="1.0" encoding="UTF-8"%3F><svg fill="none" stroke="%23f97316" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    }

    &::after {
      @apply left-auto -right-10;
    }
  }
}

.export-meals-view {
  @apply top-0 inset-x-0 h-auto bg-no-repeat bg-center bg-cover flex flex-col absolute m-0 p-[2.5%];
  background-image: url(./assets/background.svg);

  h1 {
    @apply text-4xl font-bold text-center mb-4;
  }

  .export-container {
    @apply flex flex-col items-center w-full h-full space-y-8;

    .export-page-component {
      @apply bg-white flex flex-col justify-start items-center overflow-hidden p-3 shadow-lg shadow-neutral-500 w-3/4;
      aspect-ratio: 1 / 1.4142;

      h2 {
        @apply text-2xl font-medium py-3;
      }

      table {
        @apply leading-none border-collapse border-2 border-black/50 text-center self-start min-w-[60%] max-w-full;
        font-size: 45%;
        // font-size: 0.5rem;

        thead tr th {
          @apply font-semibold;
          // max-width: 1%;
          // min-width: 1%;

          p {
            @apply text-center text-clip;
          }
        }

        tbody tr th,
        tbody tr td {
          min-width: 1.5vw;
          height: 10px;
          // min-height: 10px;
          // max-width: 0.1%;
          // width: 0.1%;

          &:first-child p {
            @apply text-start;
          }
        }

        td,
        th {
          @apply border border-black/50 overflow-hidden;

          p {
            @apply truncate;
          }
        }

        tfoot {
          @apply font-semibold;
        }

        .event {
          @apply bg-yellow-200/80;
        }
      }
    }
  }
}

@screen lg {
  .export-meals-view {
    @apply bottom-0;

    .export-container {
      @apply flex-row justify-around items-center space-y-0;

      .export-page-component {
        @apply w-[40%];
        aspect-ratio: 1 / 1.4142;
      }
    }
  }
}

// Meal
.btn-switch {
  @apply flex border-4 h-12 relative items-center rounded-2xl outline-none cursor-pointer overflow-hidden;
  @apply w-72 text-black/80 font-semibold border-white bg-white/30;

  .slider {
    @apply absolute w-1/2 h-full bg-white/60 transition-all duration-300 rounded-xl left-0;
  }

  input[type=checkbox] {
    @apply hidden;

    &:checked+.slider {
      @apply translate-x-full;
    }
  }

  .choice {
    @apply text-xl w-1/2 h-full flex items-center justify-center z-10 text-neutral-600;

    &.active {
      @apply text-black;
    }
  }
}

// Planning | Meal
.planning-container,
.meal-container {
  @apply px-0 pt-4 overflow-hidden;
  height: calc(100% - 4rem);

  h1 {
    @apply pb-3;
  }

  .btn-container {
    @apply absolute top-2 left-4 flex space-x-3;

    &.right {
      @apply left-auto right-4;
    }

    .btn-setting {
      @apply w-12;

      svg {
        @apply w-full h-full mr-0 fill-none stroke-2 p-0.5 stroke-neutral-800/80;
      }

      &:hover {
        @apply bg-white/40 border-white/10 cursor-pointer;

        svg {
          @apply stroke-neutral-800/100;
        }
      }
    }
  }

  .general-input {
    @apply flex w-full h-full border-y-4 border-white/60 relative;
  }

  // .export-wait {
  //   @apply absolute inset-0 bg-gray-500/30 hidden;

  //   .svg-container {
  //     @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4;
  //   }

  //   svg {
  //     @apply w-full h-full animate-spin stroke-gray-500/70;
  //   }

  //   &.active {
  //     @apply flex;
  //   }
  // }

  @screen md {
    @apply w-full;
  }
}

.month-select-btn .select-items-container {
  @apply w-full py-1 flex flex-col space-y-1 border-white border-4 transition-all duration-500 rounded-xl;

  &>div {
    @apply flex w-full justify-center items-center;
  }

  p {
    @apply w-2/3 text-center;
  }

  svg {
    @apply w-6 h-6 rounded-full cursor-pointer opacity-60;

    &:hover {
      @apply opacity-100;
    }
  }
}

.planning {
  @apply absolute -inset-1;
  width: calc(100% + 0.5rem);
  height: calc(100% + 0.5rem);

  .planning-head {
    @apply h-14 w-full cursor-default;

    tr {
      @apply w-full;

      th {
        @apply text-center border-collapse border-4 border-white/30;
      }
    }
  }

  .planning-body {
    @apply w-full;
    height: calc(100% - 3.5rem);

    tr {
      @apply w-full h-auto;

      td {
        @apply relative text-center border-collapse border-4 border-white/30;
        width: calc(100% / 7);
      }
    }
  }

  .day {
    @apply inset-0 absolute flex flex-col justify-center items-center cursor-pointer py-2;

    .decoration-container {
      @apply h-8 w-full flex;

      img {
        // @apply h-full;
        @apply object-contain;
      }
    }

    .select {
      @apply hidden;
    }

    &>span {
      @apply absolute top-0 right-2 font-semibold text-black/30;

      &.month {
        @apply text-black/80;
      }
    }

    &:hover .select {
      @apply absolute inset-0 bg-black/5 flex items-center justify-center p-3;

      svg {
        @apply w-1/4 fill-green-600;

        &.edit-icon,
        &.img-icon,
        &.paint-icon,
        &.trash-icon {
          @apply w-7 stroke-blue-600 stroke-2 fill-none absolute top-1 left-1;

          &:hover {
            @apply stroke-blue-800;
          }
        }

        &.img-icon,
        &.paint-icon,
        &.trash-icon {
          @apply left-auto right-1 top-auto bottom-1 stroke-gray-600 fill-black/20;

          &:hover {
            @apply stroke-gray-800;
          }
        }

        &.paint-icon {
          @apply right-auto left-1;
        }

        &.trash-icon {
          @apply stroke-red-600;
        }
      }

      .custom .img-icon {
        &:first-child {
          @apply top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2;
        }

        &:last-child {
          @apply bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2;
        }
      }
    }

    .anim-list {
      @apply flex flex-col text-sm w-full justify-around items-center h-3/4;

      .anim {
        @apply flex space-x-1;

        .hour {
          @apply font-semibold mr-1;
        }

        .content {
          @apply text-black/80;
        }
      }

      &.custom {
        @apply h-1/2 text-lg;
      }
    }
  }
}

.meal-container {
  @apply mx-0;

  .general-input {
    @apply grid overflow-hidden bg-white;
    // @apply grid overflow-x-hidden overflow-y-scroll bg-rose-100/60;
    // background-color: #f7d6e0;
    grid-template-rows: 4rem auto 2rem;
    height: calc(100% - 7rem);

    // .table-container {
    //   @apply absolute inset-0 top-[3.55rem] overflow-x-hidden overflow-y-scroll;
    // }
    .meals-body .user-row,
    .meals-body .guest-row,
    .meals-footer .total-row {
      @apply grid h-9 justify-start items-center w-full;
      grid-auto-flow: column;
      grid-template-columns: 16rem repeat(auto-fit, minmax(100px, 1fr));
      // grid-template-columns: 2.5fr repeat(auto-fit, 1fr);

      &>div {
        @apply h-full;
      }
    }

    .meals-header {
      @apply grid w-full cursor-default overflow-y-scroll bg-rose-400/30;
      grid-template-columns: 16rem repeat(auto-fit, minmax(100px, 1fr));
      grid-auto-flow: column;
      // grid-template-columns: 2.5fr repeat(4, 2fr) repeat(3, 1.5fr);

      .user-header,
      .column-header {
        @apply border-b-[3px] border-stone-700/40;
      }

      .user-header {
        @apply w-64;
      }

      .column-header {
        @apply grid items-center border-x border-stone-700/40 text-black font-medium;

        &.with-tray {
          @apply grid-rows-2;

          .kind-meal-label {
            @apply border-b-2 border-stone-700/40;
          }
        }

        .kind-meal-label {
          @apply h-full w-full text-center content-center;
        }

        div p {
          @apply text-center border-stone-700/40 border-solid content-center;
        }
      }
    }

    .meals-overflow {
      @apply bg-rose-400/30;
    }

    .meals-body {
      @apply overflow-hidden grid grid-flow-row self-baseline;
      // background-color: blue;  bg-red-100

      .meals-case-container {
        @apply grid items-center border border-stone-600/30 h-full;

        &.double-checkbox {
          @apply grid-cols-2;
        }

        &:hover {
          @apply bg-stone-400/10;
        }

        &.disabled {
          @apply hidden;
        }
      }

      .custom-checkbox {
        @apply mx-auto border-[3px] bg-gray-200/20 w-6 h-6 rounded-md cursor-pointer relative;
        @apply border-neutral-500/60;

        &:hover {
          @apply border-neutral-600/90;
        }

        &.active {
          @apply border-neutral-600/80 bg-neutral-600/20;

          &::after {
            @apply bg-neutral-600/80;
          }

          &:hover {
            @apply border-neutral-500/60;

            &::after {
              @apply bg-neutral-500;
            }
          }
        }

        &::after {
          @apply absolute flex inset-0.5 rounded-full shadow-inner;
          @apply bg-neutral-400/70 shadow-neutral-500/90;
          content: '';
        }
      }

      .user-label {
        @apply flex items-center px-2 overflow-hidden cursor-default;
        @apply border-y border-r border-stone-600/30;

        p {
          @apply truncate text-ellipsis w-full;
        }
      }

      &>div {
        // @apply border-y border-stone-600/30;

        &:nth-child(2n) {
          background-color: rgba(251, 111, 146, 0.2);
        }

        &.guest-row {
          p {
            @apply pl-4;
          }
        }
      }
    }

    .meals-footer {
      @apply overflow-x-hidden overflow-y-scroll h-10 bg-rose-400/30;

      .total-row {
        @apply font-semibold;

        .total-kd,
        .total-label {
          @apply grid items-center border-x border-stone-600/30;
          @apply text-center border-t-2 border-stone-700/40;

          &.total-label {
            @apply border-l-0;
          }

          p {
            @apply h-full align-middle flex justify-center items-center;
          }

          &.double {
            @apply grid-cols-2;

            p {
              @apply border-stone-600/30;

              &:first-child {
                @apply border-r;
              }

              &:last-child {
                @apply border-l;
              }
            }
          }
        }
      }
    }

    &:not(.staff) .total-kd.hover-meal,
    &:not(.staff) .column-header.hover-meal,
    &:not(.staff) .meals-case-container.hover-meal,
    .meals-body .user-row:hover,
    .meals-body .guest-row:hover {
      @apply bg-rose-100;

      .meals-case-container:hover {
        box-shadow: inset 0 0 0.25rem rgba(0, 0, 0, 0.8);
      }
    }
  }
}

.meals {
  @apply absolute inset-0 overflow-hidden;
  width: 100%;
  // height: calc(100% + 0.5rem);

  tbody {
    @apply bg-zinc-200/20;

    td {
      &:nth-child(2n) {
        @apply bg-black/5;
      }
    }

    tr {
      @apply border-t-2 border-white/40;

      &:hover,
      &:hover+tr {
        @apply border-neutral-400;
      }

      &:hover {
        @apply bg-white/60;
      }

      &.guest {
        @apply bg-pink-200/50;
      }
    }
  }

  // .meals-case-container {
  //   @apply flex w-full h-full p-1;

  //   .custom-checkbox {
  //     @apply mx-auto border-[3px] border-gray-300/70 bg-gray-200/20 w-8 h-8 rounded-md cursor-pointer relative;

  //     &:hover {
  //       @apply bg-gray-200/50 border-gray-400;
  //     }

  //     &.active {
  //       @apply bg-gray-300/50 border-gray-500;

  //       &::after {
  //         @apply bg-gray-600/80 shadow shadow-gray-500/70;
  //       }

  //       &:hover {
  //         @apply border-gray-400;
  //       }
  //     }

  //     &::after {
  //       @apply absolute flex inset-1 bg-gray-300/70 rounded-full shadow-inner shadow-gray-400/70;
  //       content: '';
  //     }
  //   }
  // }
}

// .meals-header {
//   @apply w-full absolute top-0 z-10;

//   thead {
//     tr {
//       @apply border-b-4 border-stone-700/40 bg-zinc-200/20;

//       th {
//         @apply border-r-4 border-white/40 text-black;

//         p {
//           @apply text-center text-base;
//         }

//         &:last-child {
//           @apply border-0;
//         }

//         .kind-meal div {
//           @apply border-t-[3px] border-white/40 font-medium bg-white/20;

//           p:nth-child(2) {
//             @apply border-l-[3px] border-white/40;
//           }
//         }

//         &:nth-child(2n) {
//           @apply bg-black/5;
//           // @apply bg-stone-500/5;
//         }
//       }
//     }
//   }
// }

.planning-init {
  @apply absolute inset-0 flex justify-center items-center bg-white/20;

  .init-container {
    @apply flex flex-col items-center space-y-3 bg-white rounded-xl p-4 font-medium;
    @apply border-2 border-gray-200/30 shadow;

    h2 {
      @apply text-xl font-semibold;
    }

    .choice-container {
      @apply flex space-x-4;
    }
  }
}

// Loader 
.waiting-general-input {
  @apply flex flex-col space-y-3 justify-center items-center font-semibold;
}

.waiting-screen {
  @apply absolute inset-0 bg-zinc-200/60 flex flex-col justify-center items-center space-y-4;

  p {
    @apply text-xl font-semibold text-zinc-800;
  }
}

.waiting-box {
  @apply w-72 h-8 rounded-full shadow-md border-[3px] border-[#e1415d]/40 shadow-gray-400/20;
  background: linear-gradient(90deg,
      rgba(225, 65, 93, 0.2),
      rgba(225, 65, 93, 0.5),
      rgba(225, 65, 93, 0.2));
  background-size: 200% 100%;
  animation: shimmer 500ms linear infinite;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
