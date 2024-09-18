<template>
  <main>
    <ResidentsList v-if="residentId == null" @selectResident="updateResidentId" />
    <Resident v-else :residentId="residentId" @resetResident="updateResidentId(null)" />
  </main>
</template>

<script>
import ResidentsList from "@/components/ResidentsList.vue";
import Resident from "@/components/Resident.vue";
import { socket, state } from "@/socket";

export default {
  name: "app-residents",
  components: {
    ResidentsList,
    Resident,
  },
  props: {
  },
  data() {
    return {
      residentId: null,
    }
  },
  emits: [],
  created() {
  },
  mounted() {
  },
  methods: {
    updateResidentId(id) {
      this.residentId = id;
    },
  },
  computed: {
  }
};
</script>

<style lang="scss">
.residents-container {
  @apply flex flex-col h-3/4 p-0 space-y-2;

  .header {
    @apply w-full flex justify-around items-center h-12 space-x-2 mt-4 px-4;

    @screen md {
      @apply space-x-0;
    }

    h1 {
      @apply hidden text-center;

      @screen md {
        @apply flex;
      }
    }

    .btn-filter {
      @apply flex h-full outline-none;

      svg {
        @apply h-full p-2 mr-1 stroke-black/40;
      }
    }

    .btn-add {
      @apply flex w-auto h-3/4 border-[3px] rounded-full outline-none select-none;

      svg {
        @apply h-full p-1 m-0 stroke-black/30 transition-all duration-300;
      }

      &:hover {
        @apply bg-transparent border-transparent;

        svg {
          @apply stroke-black/60 p-0;
        }
      }
    }
  }

  .general-list {
    @apply w-full h-full grid grid-cols-1 auto-rows-min gap-4 px-4 pt-2 overflow-x-hidden overflow-y-scroll;

    @screen md {
      @apply grid-cols-2;
    }

    @screen lg {
      @apply grid-cols-3;
    }

    @screen xl {
      @apply grid-cols-4;
    }
  }
}

.card-container {
  @apply w-full flex;

  .card {
    @apply flex flex-col bg-gray-50 w-full rounded-lg shadow-md cursor-pointer px-3 py-2 overflow-hidden;

    h1 {
      @apply text-lg font-medium max-w-full overflow-hidden text-ellipsis text-nowrap;
    }

    .card-content {
      @apply w-full h-full flex justify-between;

      .card-part {
        @apply w-1/2 h-20 flex flex-col justify-end;

        .icon-container {
          @apply flex items-center justify-start space-x-2 h-8 text-nowrap;

          svg {
            @apply h-full stroke-black size-5;

            &.isMonth {
              @apply stroke-red-500;

              &.isBirthday {
                @apply stroke-green-600 stroke-2;
              }
            }
          }
        }

        &.right {
          .icon-container {
            @apply justify-end;
          }
        }
      }
    }

    &:hover {
      @apply scale-[1.02] shadow-lg;
    }
  }
}

.add-container {
  @apply space-y-6;
}

.filter-container {
  @apply space-y-3;

  .custom-row {
    @apply flex flex-col items-center;

    h2 {
      @apply w-full pt-1 pb-3 text-xl font-semibold;
    }

    .switch {
      @apply w-full max-w-80;

      span {
        @apply w-1/3 px-2 flex items-center justify-center text-base;
      }
    }
  }
}

.add-container,
.filter-container {
  @apply flex flex-col w-full;


  .switch {
    @apply flex w-auto border-[3px] border-gray-300/70 bg-gray-300/20 rounded-lg text-base font-medium outline-none select-none;

    span {
      @apply w-12 text-center py-1 cursor-pointer;

      &:not(.active):hover {
        @apply bg-gray-300/35;
      }

      &.active {
        @apply bg-gray-300/50;
      }

      &:last-child {
        @apply border-l-4;
      }
    }
  }

  .add-row {
    @apply flex flex-col w-full justify-center items-center space-y-4;

    @screen md {
      @apply flex-row space-x-4 space-y-0;
    }

    label:not(.select-checkbox, .checkbox) {
      @apply flex flex-col space-y-1 -mt-3 justify-center items-center w-full;

      @screen md {
        @apply flex-row space-x-4 mt-0 space-y-0;
      }

      span {
        @apply text-black/60;
      }
    }

    input {
      @apply border-[3px] w-[60%] border-gray-300/70 bg-gray-300/20 rounded-lg text-base font-medium outline-none select-none;
      @apply px-3 py-1.5;

      @screen md {
        @apply w-[42%];
      }
    }

    .display-age {
      @apply border-[3px] border-gray-300/70 bg-gray-300/20 rounded-lg text-base font-medium outline-none select-none;
      @apply px-2 py-0 flex items-center h-10 font-semibold;

      svg {
        @apply ml-2 size-6 stroke-black;
      }

      p {
        @apply min-w-7;
      }
    }
  }
}

.swal2-container .swal2-actions .btn.btn-custom {
  @apply w-32;
}

.swal2-container .swal2-actions .btn-no {
  @apply border-gray-400/50 bg-gray-400/20;
}
</style>
