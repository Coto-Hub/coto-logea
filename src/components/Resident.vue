<template>
  <div v-if="resident.id" class="general-container residents-container resident-view">
    <div class="header">
      <label class="return" @click="$emit('resetResident')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
        </svg>
      </label>
      <h1 :class="{ disabled: (getResident.isActive == 0) }">{{ getResident.civility }} {{ getResident.lastname }} {{
        getResident.firstname }}</h1>
      <label class="edit" @click="isEdit = true" v-if="!isEdit">
        <span>Modifier</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
      </label>
      <label class="cancel" @click="resetForm" v-else>
        <span>Annuler</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </label>
    </div>
    <section class="general-content">
      <div class="resident-container" :class="{ disabled: !isEdit }">
        <div class="resident-row">
          <div class="switch">
            <span class="civility-item" :class="{ active: (resident.civility == 'Mme') }"
              @click="updateCivility('Mme')">Mme</span>
            <span class="civility-item" :class="{ active: (resident.civility == 'M.') }"
              @click="updateCivility('M.')">M.</span>
          </div>
          <input type="text" name="lastname" id="lastname" v-model="resident.lastname" class="lastname"
            :disabled="!isEdit">
          <input type="text" name="firstname" id="firstname" v-model="resident.firstname" class="firstname"
            :disabled="!isEdit">
        </div>
        <div class="resident-row">
          <input type="number" name="floor" id="floor" v-model="resident.floor" class="floor" :disabled="!isEdit">
          <input type="number" name="room" id="room" v-model="resident.room" class="room" :disabled="!isEdit">
        </div>
        <div class="resident-row">
          <label>
            <span>Naissance:</span>
            <input type="date" name="birthday" id="birthday" :value="getStringDate" @change="updateDate"
              :max="new Date().toLocaleDateString('fr-ca')" class="birthday" :disabled="!isEdit">
            <div class="display-age">
              <p id="age">{{ getAge }}</p>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
              </svg>
            </div>
          </label>
        </div>
      </div>
      <div class="contact-container">
        <h1>Contacts</h1>
        <button class="contact-add" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <div class="contact-list">
          <ContactCard v-for="contact in getSortContact" :contact="contact" />
        </div>
      </div>
    </section>
    <div class="general-footer">
      <label class="btn btn-cancel" v-if="!isEdit" @click="deleteModal">
        <span>Supprimer</span>
      </label>
      <label class="btn btn-confirm" v-else @click="saveForm">
        <span>Confirmer</span>
      </label>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import moment from 'moment';
import { socket, state } from "@/socket";
import ContactCard from "@/components/ContactCard.vue";

export default {
  name: "app-resident",
  components: {
    ContactCard,
  },
  props: {
    residentId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      resident: {},
      isEdit: false,
    }
  },
  emits: [],
  created() {
  },
  mounted() {
    this.resetForm();
    socket.on("residents info", ({ allResidents }) => {
      const resident = allResidents.find(r => r.id == this.residentId);
      if (!resident) {
        this.$emit('resetResident');
      }
      if (resident && !this.isEdit) {
        this.resetForm();
      }
    });
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    deleteModal() {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-cancel btn-custom",
          cancelButton: "btn btn-no btn-custom",
          denyButton: "btn btn-confirm btn-custom",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Supprimer le résident ?',
        html: `
            <div class="filter-modal-container">
            </div>
            `,
        confirmButtonText: 'Définitif',
        denyButtonText: 'Temporaire',
        cancelButtonText: 'Annuler',
        showCancelButton: true,
        focusConfirm: false,
        reverseButtons: true,
        showDenyButton: true,
      }).then((data) => {
        if (data.isDenied) {
          socket.emit("update resident status", {
            residentId: this.residentId,
            is_active: 0,
          });
        }
        else if (data.isConfirmed) {
          socket.emit("delete resident", {
            residentId: this.residentId,
          });
          console.log('isConfirmed');
        }
        console.log(data);
      });
    },
    openAddModal() {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Ajouter un contact',
        html: `
            <div class="add-container">
              <div class="add-row">
                <div class="switch" id="contact-civility-switch" data-civility="Mme">
                  <span class="civility-item contact active">Mme</span>
                  <span class="civility-item contact ">M.</span>
                </div>
                <input type="text" name="lastname" id="contact-lastname" placeholder="Nom" class="lastname">
                <input type="text" name="firstname" id="contact-firstname" placeholder="Prénom" class="firstname">
              </div>
              <div class="add-row">
                <input type="text" name="email" id="contact-email" placeholder="Email" class="email">
                <input type="tel" name="phone" id="contact-phone" placeholder="xx-xx-xx-xx-xx" class="phone"/>
              </div>
            </div>
            `,
        confirmButtonText: 'Enregister',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          const items = document.querySelectorAll(".civility-item.contact");
          items.forEach(node => {
            node.addEventListener("click", e => {

              var elems = document.querySelectorAll(".civility-item.contact");
              [].forEach.call(elems, function (el) {
                el.classList.remove("active");
              });


              e.target.classList.add("active");
              document.getElementById("contact-civility-switch").dataset.civility = e.target.innerText;
            })
          });
          function nextDigit(input, cursorpos, isBackspace) {
            if (isBackspace) {
              for (let i = cursorpos - 1; i > 0; i--) {
                if (/\d/.test(input[i])) {
                  return i
                }
              }
            } else {
              for (let i = cursorpos - 1; i < input.length; i++) {
                if (/\d/.test(input[i])) {
                  return i
                }
              }
            }
            return cursorpos
          }
          function autoFormatPhoneNumber(ref) {
            try {
              let phoneNumberString = ref.value
              var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
              var match = cleaned.match(/^(\d{0,2})?(\d{0,2})?(\d{0,2})?(\d{0,2})?(\d{0,2})?/);
              return [match[1],
              match[2] ? "-" : "",
              match[2],
              match[3] ? "-" : "",
              match[3],
              match[4] ? "-" : "",
              match[4],
              match[5] ? "-" : "",
              match[5]].join("")
            } catch (err) {
              return "";
            }
          }
          document.getElementById('contact-phone').addEventListener('input', e => {
            let cursorPos = e.target.selectionStart;
            let formatInput = autoFormatPhoneNumber(e.target);
            e.target.value = String(formatInput)
            let isBackspace = (e?.data == null) ? true : false
            let nextCusPos = nextDigit(formatInput, cursorPos, isBackspace)

            document.getElementById("contact-phone").setSelectionRange(nextCusPos + 1, nextCusPos + 1);
          })
        },
        preConfirm: () => {
          const values = {
            civility: document.getElementById("contact-civility-switch").dataset.civility,
            lastname: document.getElementById("contact-lastname").value,
            firstname: document.getElementById("contact-firstname").value,
            email: document.getElementById("contact-email").value,
            phone: document.getElementById("contact-phone").value,
          };

          if (!values.lastname) {
            Swal.showValidationMessage(`Vous devez renseigner le nom du contact.`);
          }
          if (!values.firstname) {
            Swal.showValidationMessage(`Vous devez renseigner le prénom du contact.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.residentId = this.getResident.id;
          socket.emit("add contact", data.value);
        }
      });
    },
    updateDate(event) {
      this.resident.birthday = moment(event.target.value, 'YYYY-MM-DD');
    },
    resetForm() {
      this.resident = { ...this.getResident };
      this.isEdit = false;
    },
    saveForm() {
      if (this.resident) {
        this.resident.birthday = this.resident.birthday ? moment(this.resident.birthday).format('YYYY-MM-DD') : null;
        socket.emit("update resident", this.resident);
        this.isEdit = false;
      }
    }
  },
  computed: {
    getResident() {
      return state.residents.find(r => r.id == this.residentId);
    },
    getAge() {
      return moment().diff(this.resident.birthday, 'years');
    },
    getStringDate() {
      return moment(this.resident.birthday).format('YYYY-MM-DD');
    },
    getSortContact() {
      console.log(this.getResident.contacts);
      return this.getResident.contacts;
    }
  }
};
</script>

<style lang="scss">
.residents-container.resident-view {
  @apply h-auto pb-8;

  .general-footer {
    @apply pt-4;
  }

  .header {
    @apply relative;

    h1 {
      @apply max-w-[50%];

      &.disabled {
        @apply text-black/60;
      }
    }

    .edit,
    .cancel,
    .return {
      @apply absolute left-4 inset-y-0 flex w-20 border-4 h-12 justify-center items-center cursor-pointer;
      @apply rounded-xl text-black/80 font-semibold border-white bg-white/30 text-lg;

      svg {
        @apply h-full stroke-black;
      }

      &:hover {
        @apply bg-white/40 border-white/10;
      }

      &.edit,
      &.cancel {
        @apply absolute left-auto right-4 w-40;

        svg {
          @apply ml-2 py-2;
        }
      }

      &.cancel {
        @apply border-red-500/70 bg-red-500/30;
      }
    }
  }

  .contact-container {
    @apply flex flex-col border-4 border-white/80 bg-white/20 rounded-lg w-[35rem] max-w-[90%] h-60 mt-12 relative;

    &>h1 {
      @apply absolute text-xl font-medium px-4 py-1 left-1/2 -top-1 -translate-y-1/2 -translate-x-1/2 cursor-default;
      @apply border-4 border-white/80 bg-rose-200 rounded-3xl;
    }

    .contact-add {
      @apply absolute size-10 top-0 right-0 translate-x-1/2 -translate-y-1/2 flex border-4 border-white/80 bg-rose-200 rounded-full outline-none select-none;

      svg {
        @apply h-full p-1 m-0 stroke-black/30 transition-all duration-300;
      }

      &:hover {
        @apply scale-110;

        svg {
          @apply stroke-black/60 stroke-[3px];
        }
      }
    }

    .contact-list {
      @apply grid grid-cols-1 p-2 w-full h-full overflow-x-hidden overflow-y-auto;

      @screen md {
        @apply grid-cols-2 gap-2;
      }

      .card-container {
        @apply h-32;

        .card {
          h1 {
            @apply text-center;
          }

          .card-content {
            @apply flex-col justify-around items-center;
          }
        }
      }
    }
  }
}

.resident-container {
  @apply w-full flex flex-col space-y-6;

  .confirm {
    @apply absolute bottom-4 left-1/2 -translate-x-1/2 flex w-36 border-4 h-12 justify-center items-center cursor-pointer;
    @apply rounded-xl text-black/80 font-semibold border-green-500/70 bg-green-500/30 text-lg;
  }

  @screen md {
    @apply w-3/4;
  }

  &:not(.disabled) {
    .switch span:not(.active):hover {
      @apply cursor-pointer bg-white/30;
    }
  }

  .resident-row {
    @apply flex flex-col justify-center items-center w-full space-y-4;

    @screen md {
      @apply flex-row space-x-4 space-y-0;
    }

    label {
      @apply flex flex-col space-y-1 -mt-3 justify-center items-center w-full;

      @screen md {
        @apply flex-row space-x-4 mt-0 space-y-0;
      }

      span {
        @apply text-black/90 font-semibold text-xl;
      }
    }

    .switch {
      @apply flex w-auto border-[3px] border-white/80 bg-white/20 rounded-lg text-lg font-medium outline-none select-none;

      span {
        @apply w-16 text-center py-1;

        &.active {
          @apply bg-white/50;
        }

        &:last-child {
          @apply border-l-4 border-white/80;
        }
      }
    }

    input {
      @apply border-4 w-[60%] max-w-60 border-white bg-white/30 rounded-lg text-base font-medium outline-none select-none;
      @apply px-3 py-1.5;

      @screen md {
        @apply w-[42%];
      }
    }

    .display-age {
      @apply border-[3px] border-white bg-white/30 rounded-lg text-base font-medium outline-none select-none;
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
</style>
