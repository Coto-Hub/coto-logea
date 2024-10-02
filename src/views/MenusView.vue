<template>
  <div class="general-container menu-container">
    <h1>Menus</h1>
    <section class="general-input">
      <button class="btn btn-import" @click="openImportModal">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        Importer
      </button>
      <div class="morning-input">
        <label for="morning-start" class="morning-start">
          Entrée
          <textarea id="morning-start" v-model="values.midday.starter" name="morning-start"></textarea>
        </label>
        <label for="morning-dish" class="morning-dish">
          Plat
          <textarea id="morning-dish" v-model="values.midday.dish" name="morning-dish"></textarea>
        </label>
        <label for="morning-dessert" class="morning-dessert">
          Dessert
          <textarea id="morning-dessert" v-model="values.midday.dessert" name="morning-dessert"></textarea>
        </label>
      </div>
      <div class="afternoon-input">
        <label for="afternoon-start" class="afternoon-start">
          Entrée
          <textarea id="afternoon-start" v-model="values.afternoon.starter" name="afternoon-start"></textarea>
        </label>
        <label for="afternoon-dish" class="afternoon-dish">
          Plat
          <textarea id="afternoon-dish" v-model="values.afternoon.dish" name="afternoon-dish"></textarea>
        </label>
        <label for="afternoon-dessert" class="afternoon-dessert">
          Dessert
          <textarea id="afternoon-dessert" v-model="values.afternoon.dessert" name="afternoon-dessert"></textarea>
        </label>
      </div>
    </section>
    <div class="menu-form">
      <div class="menu-form-btn">
        <button class="btn btn-cancel" :class="{ disabled: !formIsUpdate }" @click="cancelMenu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          Annuler
        </button>
        <button class="btn btn-confirm" :class="{ disabled: !formIsUpdate }" @click="confirmMenu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Valider
        </button>
      </div>
      <div class="menu-form-date">
        <button class="date-btn" @click="changeDate(-1)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <input type="date" name="form-date" class="form-date" v-model="stringDate" @change="updateDate">
        <button class="date-btn" @click="changeDate(+1)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import moment from 'moment';
import router from "../router";
import { read, utils } from 'xlsx';
import { socket, state } from "@/socket";

export default {
  name: "app-menu",
  props: {
  },
  data() {
    return {
      values: {
        midday: {
          starter: "",
          dish: "",
          dessert: ""
        },
        afternoon: {
          starter: "",
          dish: "",
          dessert: ""
        }
      },
      date: moment(),
      stringDate: '',
    }
  },
  emits: [],
  created() {
    this.stringDate = this.formatDate(this.date);
    this.resetFormData();

    socket.on("menus info", ({ allMenus }) => {
      console.log(allMenus);
      this.resetFormData();
    });
  },
  mounted() {
    this.resetFormData();
  },
  methods: {
    resetFormData() {
      const currentMenu = state.menus.find(e => this.date.isSame(e.date, 'day'));
      console.log(currentMenu);

      if (currentMenu) {
        this.values.midday.starter = currentMenu.midday.starter;
        this.values.midday.dish = currentMenu.midday.dish;
        this.values.midday.dessert = currentMenu.midday.dessert;

        this.values.afternoon.starter = currentMenu.afternoon.starter;
        this.values.afternoon.dish = currentMenu.afternoon.dish;
        this.values.afternoon.dessert = currentMenu.afternoon.dessert;
      }
      else {
        this.values.midday.starter = "";
        this.values.midday.dish = "";
        this.values.midday.dessert = "";

        this.values.afternoon.starter = "";
        this.values.afternoon.dish = "";
        this.values.afternoon.dessert = "";
      }
    },
    processXLSX(object, startDate) {
      const returnObj = [
        { midday: '', afternoon: '' },
        { midday: '', afternoon: '' },
        { midday: '', afternoon: '' },
        { midday: '', afternoon: '' },
        { midday: '', afternoon: '' },
        { midday: '', afternoon: '' },
        { midday: '', afternoon: '' }
      ];
      var date = startDate;
      for (let index = 0; index < 7; index++) {
        const letter = String.fromCharCode(66 + index * 2);
        returnObj[index].id = null;
        returnObj[index].date = date.format('YYYY-MM-DD');
        returnObj[index].midday = {
          starter: this.getRow(object, `${letter}4`),
          dish: (this.getRow(object, `${letter}5`) + ` \n \n ` + this.getRow(object, `${letter}6`)).trim(),
          dessert: (this.getRow(object, `${letter}7`) + ` \n \n ` + this.getRow(object, `${letter}8`)).trim()
        };
        returnObj[index].afternoon = {
          starter: this.getRow(object, `${letter}9`),
          dish: (this.getRow(object, `${letter}10`) + ` \n \n ` + this.getRow(object, `${letter}11`)).trim(),
          dessert: (this.getRow(object, `${letter}12`) + ` \n \n ` + this.getRow(object, `${letter}13`)).trim()
        };
        const menuExist = state.menus.find(e => date.isSame(e.date, 'day'));
        console.log(menuExist);
        if (menuExist) {
          returnObj[index].exist = true;
        }
        date.add(1, 'days');
      }
      return returnObj;
    },
    getRow(obj, row) {
      if (obj[row] && obj[row].h) {
        return `${obj[row].h.trim()}`;
      }
      else {
        return '';
      }
    },
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    updateDate(event) {
      this.date = moment(event.target.value, 'YYYY-MM-DD');
    },
    changeDate(int) {
      if (int < 0) {
        this.date.subtract(1, 'days')
      }
      else {
        this.date.add(1, 'days')
      }
      this.stringDate = this.formatDate(this.date);
      this.resetFormData();
    },
    openImportModal() {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Importer un fichier',
        html: `
            <div class="import-modal-container">
              <label for="import-file" id="label-import-file" class="btn btn-import">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Importer
              </label>
              <input type="file" id="import-file" style="display: none" ref="fileInput" accept=".xlsx"/>
              <label>
                Date de début:
                <input type="date" name="start-file-date" id="start-file-date" class="start-file-date">
              </label>
            </div>
            `,
        confirmButtonText: 'Enregister',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("import-file").addEventListener('change', (e) => {
            document.getElementById("label-import-file").classList.add("isActive");

            const files = document.getElementById("import-file").files;
            const fileReader = new FileReader();

            fileReader.onload = event => {
              var wb = read(event.target.result);
              if (Object.keys(wb.Sheets)) {
                const sheet = wb.Sheets[Object.keys(wb.Sheets)[0]];
                if (sheet && sheet.B3) {
                  document.getElementById("start-file-date").value = moment(sheet.B3.w).format('YYYY-MM-DD');
                }
              }
            };
            if (fileReader && files[0]) {
              fileReader.readAsArrayBuffer(files[0]);
            }
          });
        },
        preConfirm: () => {
          const values = {
            file: document.getElementById("import-file").value,
            startDate: document.getElementById("start-file-date").value
          };

          if (!values.startDate) {
            Swal.showValidationMessage(`Vous devez renseigner une date de début pour le fichier.`)
          }
          if (!values.file) {
            Swal.showValidationMessage(`Le fichier n'est pas du bon format.`)
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          const startDate = moment(data.value.startDate, 'YYYY-MM-DD');
          const files = document.getElementById("import-file").files;
          const fileReader = new FileReader();

          fileReader.onload = e => {
            var wb = read(e.target.result);
            socket.emit("add menus from file", { data: this.processXLSX(Object.keys(wb.Sheets)[0], startDate) });
          };
          if (fileReader && files[0] && startDate) {
            fileReader.readAsArrayBuffer(files[0]);
          }
        }
      });
    },
    cancelMenu() {
      if (this.formIsUpdate) {
        this.resetFormData();
      }
    },
    confirmMenu() {
      if (this.formIsUpdate) {
        const currentMenu = state.menus.find(e => this.date.isSame(e.date, 'day'));

        if (currentMenu) {
          socket.emit("update menu", {
            id: currentMenu.id,
            date: this.date.format('YYYY-MM-DD'),
            midday: this.values.midday,
            afternoon: this.values.afternoon,
          });
        }
        else {
          socket.emit("add menu", {
            id: null,
            date: this.date.format('YYYY-MM-DD'),
            midday: this.values.midday,
            afternoon: this.values.afternoon,
          });
        }
      }
    }
  },
  computed: {
    formIsUpdate() {
      const currentMenu = state.menus.find(e => this.date.isSame(e.date, 'day'));

      if (currentMenu) {
        return this.values.midday.starter != currentMenu.midday.starter || this.values.midday.dish != currentMenu.midday.dish || this.values.midday.dessert != currentMenu.midday.dessert || this.values.afternoon.starter != currentMenu.afternoon.starter || this.values.afternoon.dish != currentMenu.afternoon.dish || this.values.afternoon.dessert != currentMenu.afternoon.dessert;
      }
      else {
        return this.values.midday.starter != "" || this.values.midday.dish != "" || this.values.midday.dessert != "" || this.values.afternoon.starter != "" || this.values.afternoon.dish != "" || this.values.afternoon.dessert != "";
      }
    }
  }
};
</script>

<style>
.import-part {
  @apply hidden;
}

.menu-container .general-input {
  @apply flex w-full h-full pb-3;
}

.morning-input,
.afternoon-input {
  @apply relative flex flex-col w-1/2 h-full space-y-3;
}

.morning-input label,
.afternoon-input label {
  @apply flex flex-col items-center w-full font-medium text-xl;
}

.general-input label textarea {
  @apply flex h-24 rounded-xl border-4 border-white bg-white/40 overflow-hidden resize-none outline-none w-3/4 px-2 py-1 text-lg text-center mt-1;
}

.morning-input::after {
  @apply absolute top-10 bottom-3 w-2 bg-white/60 rounded-full right-0;
  content: '';
}

.menu-form {
  @apply flex flex-col mt-2 space-y-3;
}

.menu-form-date {
  @apply flex h-14 items-center w-full justify-around;
}

.menu-form-date input[type=date] {
  @apply border-[3px] border-white bg-white/30 rounded-2xl text-xl font-medium px-3 py-1 outline-none w-48 select-none;
}

.menu-form-date .date-btn {
  @apply border-4 border-white/70 rounded-full p-2;
}

.menu-form-date .date-btn:hover {
  @apply bg-white/60;
}

.menu-form-date .date-btn svg {
  @apply stroke-[3] stroke-black/80;
}

.general-input .btn-import {
  @apply absolute top-3 right-4;
}

.import-modal-container {
  @apply flex flex-col space-y-6 items-center;
}

.import-modal-container label:not(.btn) {
  @apply flex justify-around w-4/5 items-center font-medium;
}
</style>
