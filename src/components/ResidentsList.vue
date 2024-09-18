<template>
  <div class="general-container residents-container">
    <div class="header">
      <label class="research">
        <input type="text" name="research" id="research" v-model="searchInput" placeholder="Rechercher"
          autocomplete="false">
      </label>
      <div class="flex items-center md:space-x-4 h-full">
        <h1>Résidents</h1>
        <button class="btn btn-add" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
      <button class="btn btn-filter" @click="openFilterModal">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
        <span class="hidden md:flex">Trier</span>
      </button>
    </div>
    <section class="general-list">
      <ResidentCard v-for="resident in getFilteredResidents()" :resident="resident"
        @click="$emit('selectResident', resident.id)" />
    </section>
  </div>
</template>

<script>
import ResidentCard from "@/components/ResidentCard.vue";
import Swal from "sweetalert2";
import moment from 'moment';
import { socket, state } from "@/socket";

export default {
  name: "app-residents-list",
  components: {
    ResidentCard
  },
  props: {
  },
  data() {
    return {
      searchInput: '',
      date: moment(),
    }
  },
  emits: [],
  created() {
  },
  mounted() {
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    openFilterModal() {
      let Floors = [];
      state.residents.forEach(r => {
        if (r.floor != null) {
          if (!Floors.find(f => f.value == r.floor)) {
            Floors.push({
              value: r.floor,
              nb: 0
            });
          }
          const floor = Floors.find(f => f.value == r.floor);
          floor.nb++;
        }
      });
      Floors = Floors.sort((a, b) => a.value > b.value);
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm btn-custom",
          cancelButton: "btn btn-no btn-custom",
          denyButton: "btn btn-cancel btn-custom",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Filtrer',
        html: `
            <div class="filter-container">
              <div class="add-row">
                <div class="multi-select" id="floors-select" data-value="${state.filter.residents.floors.join()}">
                  <p class="multi-select-label">
                    <span>${state.filter.residents.floors.length ? 'Étages: ' + state.filter.residents.floors.join() : 'Tous les étages'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </p>
                  <div class="multi-select-options">
                    ${Floors.map(floor => `<label class="select-checkbox ${state.filter.residents.floors.includes(floor.value) ? 'checked' : ''}" data-value="${floor.value}"><div class="checkbox-display"></div><p>${floor.value == 0 ? 'UP' : floor.value}${(floor.value > 0) ? '° étage' : ''}</p></label>`).join('')}
                  </div>
                </div>
              </div>
              <div class="add-row">
                <label class="checkbox ${state.filter.residents.isBirthday ? 'checked' : ''}" id="filter-birthday">
                  <div class="checkbox-display"></div>
                  <p>Anniversaires du mois</p>
                </label>
              </div>
              <div class="add-row">
                <label class="checkbox ${state.filter.residents.isActive ? 'checked' : ''}" id="filter-is_active">
                  <div class="checkbox-display"></div>
                  <p>Résidents actifs uniquement</p>
                </label>
              </div>
              <div class="custom-row">
                <h2>Trier</h2>
                <div class="switch order-switch" id="order-switch" data-order="${state.filter.residents.order}">
                  <span class="order-item ${(state.filter.residents.order == 'default') ? 'active' : ''}" data-value="default">Appt.</span>
                  <span class="order-item ${(state.filter.residents.order == 'name') ? 'active' : ''}" data-value="name">Nom Prénom</span>
                  <span class="order-item ${(state.filter.residents.order == 'age') ? 'active' : ''}" data-value="age">Age</span>
                </div>
              </div>
            </div>
            `,
        confirmButtonText: 'Confirmer',
        denyButtonText: 'Réinitialiser',
        cancelButtonText: 'Annuler',
        showCancelButton: true,
        focusConfirm: false,
        reverseButtons: true,
        showDenyButton: true,
        willOpen: () => {
          const popups = document.querySelectorAll('.swal2-popup.swal2-modal');
          popups.forEach(node => {
            node.addEventListener("click", e => {
              const select = document.getElementById("floors-select");
              if (select.classList.contains('active')) {
                select.classList.toggle('active');
              }
            });
          });
          document.getElementById('floors-select').addEventListener('click', e => {
            document.getElementById("floors-select").classList.toggle('active');
            e.stopPropagation();
          });
          const selectItems = document.querySelectorAll("#floors-select .select-checkbox");
          selectItems.forEach(node => {
            node.addEventListener("click", e => {
              const element = e.target.closest(".select-checkbox");
              const floors = document.getElementById("floors-select").dataset.value.split(',').filter(value => value).map(value => +value);
              if (element.dataset) {
                var index = floors.indexOf(+element.dataset.value);

                if (index === -1) {
                  floors.push(element.dataset.value);
                } else {
                  floors.splice(index, 1);
                }

                element.classList.toggle('checked');
                document.getElementById('floors-select').querySelector('.multi-select-label span').textContent = floors.length ? 'Étages: ' + floors.sort().join() : 'Tous les étages';
                document.getElementById('floors-select').dataset.value = floors.join();
                e.stopPropagation();
              }
            });
          });
          document.getElementById('filter-birthday').addEventListener('click', e => {
            document.getElementById("filter-birthday").classList.toggle('checked');
          });
          document.getElementById('filter-is_active').addEventListener('click', e => {
            document.getElementById("filter-is_active").classList.toggle('checked');
          });
          const switchItems = document.querySelectorAll(".order-item");
          switchItems.forEach(node => {
            node.addEventListener("click", e => {

              var elems = document.querySelectorAll(".order-item");
              [].forEach.call(elems, function (el) {
                el.classList.remove("active");
              });


              e.target.classList.add("active");
              document.getElementById("order-switch").dataset.order = e.target.dataset.value;
            })
          });
        },
      }).then((data) => {
        if (data.isDenied) {
          state.filter.residents.isActive = true;
          state.filter.residents.floors = [];
          state.filter.residents.isBirthday = false;
          state.filter.residents.order = 'default';
        }
        else if (data.isConfirmed) {
          state.filter.residents.isActive = document.getElementById("filter-is_active").classList.contains('checked');
          state.filter.residents.floors = document.getElementById("floors-select").dataset.value.split(',').filter(value => value).map(value => +value);
          state.filter.residents.isBirthday = document.getElementById("filter-birthday").classList.contains('checked');
          state.filter.residents.order = document.getElementById("order-switch").dataset.order;
        }
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
        title: 'Ajouter un résident',
        html: `
            <div class="add-container">
              <div class="add-row">
                <div class="switch" id="civility-switch" data-civility="Mme">
                  <span class="civility-item active">Mme</span>
                  <span class="civility-item">M.</span>
                </div>
                <input type="text" name="lastname" id="lastname" placeholder="Nom" class="lastname">
                <input type="text" name="firstname" id="firstname" placeholder="Prénom" class="firstname">
              </div>
              <div class="add-row">
                <input type="number" name="floor" id="floor" placeholder="Étage" class="floor">
                <input type="number" name="room" id="room" placeholder="Appartement" class="room">
              </div>
              <div class="add-row">
                <label>
                  <span>Naissance:</span>
                  <input type="date" name="birthday" id="birthday" max="${new Date().toLocaleDateString('fr-ca')}" class="birthday">
                  <div class="display-age">
                    <p id="age">?</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" fill="none">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                    </svg>
                  </div>
                </label>
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
          const items = document.querySelectorAll(".civility-item");
          items.forEach(node => {
            node.addEventListener("click", e => {

              var elems = document.querySelectorAll(".civility-item");
              [].forEach.call(elems, function (el) {
                el.classList.remove("active");
              });


              e.target.classList.add("active");
              console.log(e.target.innerText);
              document.getElementById("civility-switch").dataset.civility = e.target.innerText;
            })
          });
          document.getElementById('birthday').addEventListener('change', e => {
            document.getElementById("age").innerHTML = e.target.value ? moment().diff(e.target.value, 'years') : '?';
          })
        },
        preConfirm: () => {
          const values = {
            civility: document.getElementById("civility-switch").dataset.civility,
            lastname: document.getElementById("lastname").value,
            firstname: document.getElementById("firstname").value,
            floor: document.getElementById("floor").value,
            room: document.getElementById("room").value,
            birthday: document.getElementById("birthday").value,
          };

          if (!values.lastname) {
            Swal.showValidationMessage(`Vous devez renseigner le nom du résident.`);
          }
          if (!values.firstname) {
            Swal.showValidationMessage(`Vous devez renseigner le prénom du résident.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.birthday = data.value.birthday ? moment(data.value.birthday).format('YYYY-MM-DD') : null;
          socket.emit("add resident", data.value);
        }
      });
    },
    getFilteredResidents() {
      if (state && state.residents) {
        let residents = [...state.residents];
        if (this.searchInput && this.searchInput.trim() != "") {
          if (isNaN(this.searchInput)) {
            residents = residents.filter(r => r.firstname.toLowerCase().includes(this.searchInput.toLowerCase()) || r.lastname.toLowerCase().includes(this.searchInput.toLowerCase()));
          }
          else {
            residents = residents.filter(r => r.room ? (r.room.toString()).includes(this.searchInput) : false);
          }
        }

        if (state.filter.residents.floors.length) {
          residents = residents.filter(r => state.filter.residents.floors.includes(r.floor));
        }
        if (state.filter.residents.isActive) {
          residents = residents.filter(r => r.isActive);
        }
        if (state.filter.residents.isBirthday) {
          residents = residents.filter(r => moment(r.birthday).format('M') == moment().format('M'));
        }

        switch (state.filter.residents.order) {
          case 'name':
            residents.sort((a, b) => {
              if (a.lastname == null || b.lastname == null) {
                return (a.lastname == null);
              }
              if (b.lastname > a.lastname) {
                return -1;
              }
              if (a.lastname > b.lastname) {
                return 1;
              }
              return (a.firstname > b.firstname) ? 1 : ((b.firstname > a.firstname) ? -1 : 0);
            });
            break;
          case 'age':
            residents.sort((a, b) => {
              if (a.birthday == null || b.birthday == null) {
                return (a.birthday == null);
              }
              return (a.birthday > b.birthday) ? 1 : ((b.birthday > a.birthday) ? -1 : 0);
            });
            break;

          default:
            residents.sort((a, b) => {
              if (a.room == null || b.room == null) {
                return (a.room == null);
              }
              if (b.floor > a.floor) {
                return -1;
              }
              if (a.floor > b.floor) {
                return 1;
              }
              return (a.room > b.room) ? 1 : ((b.room > a.room) ? -1 : 0);
            });
            break;
        }
        return residents;
      }
      return [];
    }
  },
  computed: {
  }
};
</script>

<style lang="scss"></style>
