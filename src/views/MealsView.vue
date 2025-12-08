<script>
import Swal from "sweetalert2";
import moment from 'moment';
import { socket, state } from "@/socket";
import IconSetting from "@/components/icons/IconSetting.vue";
import Meals from "@/components/Meals.vue";
import util from '@/util';

document.addEventListener('click', (e) => {
  const target = e ? e.target : null;
  if (target && target.tagName == 'INPUT' && target.type == "date") {
    e.stopPropagation();
    e.preventDefault();
    target.showPicker();
  }
});
export default {
  name: "app-meal",
  components: {
    IconSetting,
    Meals,
  },
  props: {
  },
  data() {
    return {
      editIcon: `
        <svg viewBox="0 0 24 24" class="edit-icon" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40974 4.40973 4.7157 4.21799 5.09202C4 5.51985 4 6.0799 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V12.5M15.5 5.5L18.3284 8.32843M10.7627 10.2373L17.411 3.58902C18.192 2.80797 19.4584 2.80797 20.2394 3.58902C21.0205 4.37007 21.0205 5.6364 20.2394 6.41745L13.3774 13.2794C12.6158 14.0411 12.235 14.4219 11.8012 14.7247C11.4162 14.9936 11.0009 15.2162 10.564 15.3882C10.0717 15.582 9.54378 15.6885 8.48793 15.9016L8 16L8.04745 15.6678C8.21536 14.4925 8.29932 13.9048 8.49029 13.3561C8.65975 12.8692 8.89125 12.4063 9.17906 11.9786C9.50341 11.4966 9.92319 11.0768 10.7627 10.2373Z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
      trashIcon: `
        <svg viewBox="0 0 24 24" class="trash-icon" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      `,
      date: moment().set('hour', 0).set('minute', 0).set('second', 0),
      stringDate: '',
      usersFilterData: {
        check: false,
        input: '',
      },
      historyFilterData: {
        search: '',
        filter: 'all',
        dateStart: null,
        dateEnd: null
      },
      isStaffMealView: false,
    }
  },
  emits: [],
  created() {
  },
  mounted() {
    this.stringDate = this.formatDate(this.date);
    this.getAllUserWithData;
  },
  methods: {
    configModal() {
      Swal.mixin({
        width: '40rem',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Configuration',
        html: `
            <div class="setting-modal-container modal-container">
              <div class="setting-part">
                <h2>> Listes des usagers <</h2>
                <button type="button" id="residents-list-btn" class="btn btn-default">Résidents</button>
                <button type="button" id="staffs-list-btn" class="btn btn-default">Personnels</button>
              </div>
              <div class="setting-part">
                <h2>> Types de repas <</h2>
                <button type="button" id="meal-list-btn" class="btn btn-default">Éditer</button>
              </div>
            </div>
            `,
        confirmButtonText: 'Fermer',
        focusConfirm: false,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("residents-list-btn").addEventListener("click", () => {
            this.usersModal(false);
          });
          document.getElementById("staffs-list-btn").addEventListener("click", () => {
            this.usersModal(true);
          });
          document.getElementById("meal-list-btn").addEventListener("click", () => {
            this.mealsModal();
          });
        },
      });
    },
    usersModal(isStaff) {
      const userlist = util.getFilteredUsers(isStaff).map((user) => {
        const nbConfig = state.userMealConfigs.filter(c => c.userId == user.id).length;
        return `
          <li class="list-item${isStaff ? ' staff-item' : ''}" data-configs="${nbConfig}" data-id="${user.id}">
            <p>${user.civility} <span class="filter">${user.lastname}</span> ${user.firstname}</p>
            <div class="config-nb"><span>${nbConfig}</span> Config${nbConfig > 1 ? 's' : ''}</div>
          </li>
        `;
      }).join('');
      Swal.mixin({
        width: '40rem',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Liste ${isStaff ? 'du personnels' : 'des résidents'} `,
        html: `
            <div class="meal-modal-container modal-container">
              ${isStaff ? '' : `
              <label for="filter-users-nb-config" class="btn-checkbox${this.usersFilterData.check ? ' active' : ''}">
                <input type="checkbox" ${this.usersFilterData.check ? 'checked' : ''} id="filter-users-nb-config" class="hidden" />
                <span class="checkmark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </span>
                <span class="label">Uniquement les configuration manquante</span>
              </label>
              `}
              <div class="default-list-container">
                <input type="text" id="input-search-list-user" class="btn-input btn-search" value="${this.usersFilterData.input}" placeholder="Rechercher par nom" />
                <ul class="signle-list default-list user-list" id="update-user-list">
                  ${userlist}
                </ul>
              </div>
              <button type="button" id="add-user" class="btn btn-confirm">Ajouter</button>
              <button type="button" id="old-users" class="btn btn-default">Acien ${isStaff ? 'personnels' : 'résidents'}</button>
            </div>
        `,
        confirmButtonText: 'Fermer',
        focusConfirm: false,
        showDenyButton: false,
        willOpen: () => {
          function updateList() {
            const checkbox = document.getElementById('filter-users-nb-config');
            const list = document.getElementById('update-user-list');
            const search = document.getElementById('input-search-list-user').value.toLowerCase();
            list.querySelectorAll('li').forEach((li) => {
              const label = li.querySelector('.filter').textContent.toLowerCase();
              if (checkbox && checkbox.checked && li.dataset.configs != 0) {
                li.style.display = 'none';
              }
              else if (label.indexOf(search) == -1) {
                li.style.display = 'none';
              }
              else {
                li.style.display = 'flex';
              }
            });
          }
          function getCurrentConfig() {
            return {
              check: document.getElementById('filter-users-nb-config') ? document.getElementById('filter-users-nb-config').checked : false,
              input: document.getElementById('input-search-list-user').value,
            };
          }
          updateList();
          document.getElementById("add-user").addEventListener('click', (e) => {
            this.usersFilterData = getCurrentConfig();
            this.addUserModal(isStaff);
          });
          document.getElementById('update-user-list').addEventListener('update', () => {
            if (document.getElementById('update-user-list').dataset.id) {
              const id = document.getElementById('update-user-list').dataset.id;
              Swal.close();
              this.showUserModal(isStaff, id);
            }
            else {
              const list = document.getElementById('update-user-list');
              list.innerHTML = state.users.filter(u => {
                if (u.isStaff != isStaff) return false;
                if (!u.isActive) {
                  return state.userMealConfigs.find(c => {
                    if (c.userId != u.id) return false;
                    if (c.dateEnd == null || moment().isBetween(moment.utc(c.dateStart), moment.utc(c.dateEnd), 'day', '[]')) return true;
                    return false;
                  });
                }
                return true;
              }).sort((a, b) => {
                if (a.lastname < b.lastname) return -1;
                if (a.lastname > b.lastname) return 1;
                return a.civility - b.civility;
              }).map((user) => {
                const nbConfig = state.userMealConfigs.filter(c => c.userId == user.id).length;
                return `
          <li class="list-item${isStaff ? ' staff-item' : ''}" data-configs="${nbConfig}" data-id="${user.id}">
            <p>${user.civility} <span class="filter">${user.lastname}</span> ${user.firstname}</p>
            <div class="config-nb"><span>${nbConfig}</span> Config${nbConfig > 1 ? 's' : ''}</div>
          </li>
        `;
              }).join('');
            }
          });
          document.getElementById('update-user-list').addEventListener('click', (e) => {
            if (e.target && e.target.closest('li')) {
              const id = e.target.closest('li').dataset.id;
              if (id) {
                this.usersFilterData = getCurrentConfig();
                Swal.close();
                this.showUserModal(isStaff, id);
              }
            }
            return;
          });
          document.getElementById("old-users").addEventListener('click', (e) => {
            this.usersFilterData = getCurrentConfig();
            this.oldUsersModal(isStaff);
          });
          document.getElementById('input-search-list-user').addEventListener('input', (e) => {
            updateList();
          });
          if (document.getElementById('filter-users-nb-config')) {
            document.getElementById('filter-users-nb-config').addEventListener('click', (e) => {
              e.target.closest('label').classList.toggle('active');
              updateList();
            });
          }
        },
      }).then((data) => {
        if (data.isConfirmed) {
          this.usersFilterData = {
            check: false,
            input: '',
          };
        }
      });
    },
    oldUsersModal(isStaff) {
      const userlist = state.users.filter(u => {
        if (u.isStaff != isStaff) return false;
        if (!u.isActive) {
          return !state.userMealConfigs.find(c => {
            if (c.userId != u.id) return false;
            if (c.dateEnd == null || moment().isBetween(moment.utc(c.dateStart), moment.utc(c.dateEnd), 'day', '[]')) return true;
            return false;
          });
        }
        return false;
      }).sort((a, b) => {
        if (a.lastname < b.lastname) return -1;
        if (a.lastname > b.lastname) return 1;
        return a.civility - b.civility;
      }).map((user) => {
        const nbConfig = state.userMealConfigs.filter(c => c.userId == user.id).length;
        return `
          <li class="list-item${isStaff ? ' staff-item' : ''}" data-configs="${nbConfig}" data-id="${user.id}">
            <p>${user.civility} <span class="filter">${user.lastname}</span> ${user.firstname}</p>
            <div class="config-nb"><span>${nbConfig}</span> Config${nbConfig > 1 ? 's' : ''}</div>
          </li>
        `;
      }).join('');
      Swal.mixin({
        width: '40rem',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Liste ${isStaff ? 'de l\'ancien personnel' : 'des anciens résidents'} `,
        html: `
            <div class="meal-modal-container modal-container">
              <div class="default-list-container">
                <input type="text" id="input-search-list-user" class="btn-input btn-search" value="${this.usersFilterData.input}" placeholder="Rechercher par nom" />
                <ul class="signle-list default-list user-list" id="update-user-list">
                  ${userlist}
                </ul>
              </div>
            </div>
        `,
        confirmButtonText: 'Fermer',
        focusConfirm: false,
        showDenyButton: false,
        willOpen: () => {
          function updateList() {
            const list = document.getElementById('update-user-list');
            const search = document.getElementById('input-search-list-user').value.toLowerCase();
            list.querySelectorAll('li').forEach((li) => {
              const label = li.querySelector('.filter').textContent.toLowerCase();
              if (label.indexOf(search) == -1) {
                li.style.display = 'none';
              }
              else {
                li.style.display = 'flex';
              }
            });
          }
          updateList();
          document.getElementById('update-user-list').addEventListener('update', () => {
            if (document.getElementById('update-user-list').dataset.id) {
              const id = document.getElementById('update-user-list').dataset.id;
              Swal.clickDeny();
              this.showUserModal(isStaff, id);
            }
            else {
              const list = document.getElementById('update-user-list');
              list.innerHTML = state.users.filter(u => u.isStaff == isStaff && (!u.isActive || !state.userMealConfigs.find(c => c.userId == u.id && moment().isBetween(moment(c.dateStart), moment(c.dateEnd), 'day', '[]')))).sort((a, b) => {
                if (a.lastname < b.lastname) return -1;
                if (a.lastname > b.lastname) return 1;
                return a.civility - b.civility;
              }).map((user) => {
                const nbConfig = state.userMealConfigs.filter(c => c.userId == user.id).length;
                return `
          <li class="list-item${isStaff ? ' staff-item' : ''}" data-configs="${nbConfig}" data-id="${user.id}">
            <p>${user.civility} <span class="filter">${user.lastname}</span> ${user.firstname}</p>
            <div class="config-nb"><span>${nbConfig}</span> Config${nbConfig > 1 ? 's' : ''}</div>
          </li>
        `;
              }).join('');
            }
          });
          document.getElementById('update-user-list').addEventListener('click', (e) => {
            if (e.target && e.target.closest('li')) {
              const id = e.target.closest('li').dataset.id;
              if (id) {
                Swal.clickDeny();
                this.showUserModal(isStaff, id);
              }
            }
            return;
          });
          document.getElementById('input-search-list-user').addEventListener('input', (e) => {
            updateList();
          });
        },
      }).then((data) => {
        if (data.isConfirmed || !data.isDenied) {
          this.usersModal(isStaff);
        }
      });
    },
    mealsModal() {
      const today = moment().set('hour', 0).set('minute', 0).set('second', 0);
      const meallist = state.kindMeals.filter(a => !a.dateEnd || moment(a.dateEnd).isAfter(today)).map((a) => `
        <li data-id="${a.id}">
          <p>${a.label}</p>
          <div class="inputs">
            <div class="icon edit">${this.editIcon}</div>
            <div class="icon trash">${this.trashIcon}</div>
            <div class="order-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="order-icon up">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="order-icon down">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </li>
        `).join('');
      Swal.mixin({
        width: '40rem',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Types de repas',
        html: `
            <div class="meal-modal-container modal-container">
              <div class="meal-list-container default-list-container">
                <input type="text" id="input-search-list-meal" class="btn-input btn-search" placeholder="Rechercher" />
                <ul class="signle-list default-list" id="update-meal-list">
                  ${meallist ? meallist : '<p class="empty-list">Aucun repas trouvé</p>'}
                </ul>
              </div>
              <button type="button" id="add-meal" class="btn btn-confirm">Ajouter</button>
            </div>
        `,
        confirmButtonText: 'Fermer',
        focusConfirm: false,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("add-meal").addEventListener('click', (e) => {
            this.addMealModal();
          });
          document.getElementById('update-meal-list').addEventListener('update', () => {
            document.getElementById('update-meal-list').innerHTML = state.kindMeals.filter(a => !a.dateEnd || moment(a.dateEnd).isAfter(today)).map((a) => `
        <li data-id="${a.id}">
          <p>${a.label}</p>
          <div class="inputs">
            <div class="icon edit">${this.editIcon}</div>
            <div class="icon trash">${this.trashIcon}</div>
            <div class="order-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="order-icon up">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="order-icon down">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </li>
        `).join('');
          });
          document.getElementById('update-meal-list').addEventListener('click', (e) => {
            if (e.target.closest('div').classList.contains('icon')) {
              const id = e.target.closest('li').dataset.id;
              if (e.target.closest('div').classList.contains('edit')) {
                Swal.close();
                this.editMealModal(id);
              }
              if (e.target.closest('div').classList.contains('trash')) {
                Swal.close();
                this.deleteMealModal(id);
              }
            }
            if (e.target.closest('div').classList.contains('order-container')) {
              if (e.target.closest('svg').classList.contains('up')) {
                const id = e.target.closest('li').dataset.id;
                const mealA = state.kindMeals.find(m => m.id == id);
                if (mealA && mealA.order > 0) {
                  socket.emit('switch kind meal order', { a: mealA, b: state.kindMeals.find(m => m.order == mealA.order - 1) });
                }
              }
              else if (e.target.closest('svg').classList.contains('down')) {
                const id = e.target.closest('li').dataset.id;
                const mealA = state.kindMeals.find(m => m.id == id);
                if (mealA && mealA.order < state.kindMeals.length - 1) {
                  socket.emit('switch kind meal order', { a: mealA, b: state.kindMeals.find(m => m.order == mealA.order + 1) });
                }
              }
            }
            return;
          });
          document.getElementById('input-search-list-meal').addEventListener('input', (e) => {
            const list = document.getElementById('update-meal-list');
            const search = e.target.value.toLowerCase();
            list.querySelectorAll('li').forEach((li) => {
              const label = li.querySelector('p').textContent.toLowerCase();
              if (label.indexOf(search) == -1) {
                li.style.display = 'none';
              }
              else {
                li.style.display = 'flex';
              }
            });
          });
        },
      });
    },
    showUserModal(isStaff, id) {
      const user = state.users.find(u => u.id == id && u.isStaff == isStaff);
      if (!user) return;
      const configList = state.userMealConfigs.filter(c => c.userId == user.id).sort((a, b) => moment(b.dateStart).diff(a.dateStart)).map((c) => {
        return `
        <li class="list-item" data-id="${c.id}">
          <p>${c.dateEnd ? 'Du ' + moment(c.dateStart).format('DD/MM/YYYY') + ' au ' + moment(c.dateEnd).format('DD/MM/YYYY') : 'Depuis le ' + moment(c.dateStart).format('DD/MM/YYYY')}
          </p>
          </li>
        `;
      }).join('');
      const configWithoutEndDate = state.userMealConfigs.find(c => c.userId == user.id && c.dateEnd == null);
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `${isStaff ? 'Personnel : ' : 'Résident : '} ${user.civility} ${user.lastname} `,
        html: `
        <div class="show-user-modal-container modal-container">
              <div class="trash-user-btn ${configWithoutEndDate || configList.length == 0 ? '' : 'hidden'}" id="trash-user-btn">${this.trashIcon}</div>
              <div class="edit-user-btn" id="edit-user-btn">${this.editIcon}</div>
              <h2>Configuration des repas</h2>
              <div class="user-config-list-container">
                <ul id="update-user-meal-configs" class="list-config default-list">
                  ${configList ? configList : '<p class="empty-list">Aucune configuration trouvée</p>'}
                </ul>
                <button type="button" id="add-user-config" class="btn btn-add">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
        `,
        confirmButtonText: 'Fermer',
        focusConfirm: false,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("edit-user-btn").addEventListener('click', (e) => {
            Swal.clickDeny();
            this.editUserModal(isStaff, user);
          });
          if (configWithoutEndDate || configList.length == 0) {
            document.getElementById("trash-user-btn").addEventListener('click', (e) => {
              Swal.clickDeny();
              this.deleteUserModal(isStaff, user);
            });
          }
          document.getElementById("add-user-config").addEventListener('click', (e) => {
            Swal.clickDeny();
            this.addUserConfigModal(isStaff, user.id);
          });
          document.getElementById("update-user-meal-configs").addEventListener('click', (e) => {
            if (e.target.closest('li')) {
              const id = e.target.closest('li').dataset.id;
              if (id) {
                Swal.clickDeny();
                this.editUserConfigModal(isStaff, user.id, id);
              }
            }
          });
          document.getElementById("update-user-meal-configs").addEventListener('update', () => {
            const configList = state.userMealConfigs.filter(c => c.userId == user.id).sort((a, b) => moment(b.dateStart).diff(a.dateStart)).map((c) => {
              return `
        <li class="list-item" data-id="${c.id}">
          <p>${c.dateEnd ? 'Du ' + moment(c.dateStart).format('DD/MM/YYYY') + ' au ' + moment(c.dateEnd).format('DD/MM/YYYY') : 'Depuis le ' + moment(c.dateStart).format('DD/MM/YYYY')}
          </p>
          </li>
        `;
            }).join('');
            const configWithoutEndDate = state.userMealConfigs.find(c => c.userId == user.id && c.dateEnd == null);
            if (document.getElementById("trash-user-btn")) {
              if (configWithoutEndDate || configList.length == 0) {
                document.getElementById("trash-user-btn").classList.remove('hidden');
              }
              else {
                document.getElementById("trash-user-btn").classList.add('hidden');
              }
            }
            document.getElementById("update-user-meal-configs").innerHTML = configList ? configList : '<p class="empty-list">Aucune configuration trouvée</p>';
          });
        },
      }).then((data) => {
        if ((data.isDismissed && configList.length != 0) || data.isConfirmed) {
          this.usersModal(isStaff);
        }
      });
    },
    addUserModal(isStaff) {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Créer le ${isStaff ? 'personnel' : 'résident'} `,
        html: `
        <div class="add-user-modal-container modal-container">
              <div class="input-row">
                <div class="btn-switch-select" id="btn-switch-civility" data-value="Mme">
                  <div class="switch-label">
                    <p class="current-choice">Mme</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <ul class="switch-list">
                    <li class="choice" data-choice="Mme">Mme</li>
                    <li class="choice" data-choice="M.">M.</li>
                  </ul>
                </div>
                <input type="text" id="input-user-lastname" class="btn-input" placeholder="Nom" />
              </div>
              <div class="input-row">
                <input type="text" id="input-user-firstname" class="btn-input" placeholder="Prénom" />
              </div>
              <div class="input-row">
                <p>Lieu de repas :</p>
                <input type="text" id="input-user-eating-area" class="btn-input" placeholder="Salle / Cosy" />
              </div>
            </div>
        `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("btn-switch-civility").addEventListener('click', (e) => {
            const btn = e.target.closest("#btn-switch-civility");
            if (!btn.classList.contains('active')) {
              btn.querySelectorAll('.choice').forEach((li) => {
                li.style.display = li.dataset && li.dataset.choice == btn.dataset.value ? 'none' : 'flex';
              });
            }
            else {
              const choice = e.target.closest(".choice");
              if (choice) {
                btn.dataset.value = choice.dataset.choice;
                btn.querySelector('.current-choice').textContent = choice.dataset.choice;
              }
            }
            btn.classList.toggle('active');
          });
          document.getElementById("input-user-lastname").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value.toUpperCase().replaceAll('  ', ' ');
            }
          });
          document.getElementById("input-user-firstname").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById("input-user-eating-area").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
        },
        preConfirm: () => {
          const values = {
            civility: document.getElementById("btn-switch-civility").dataset.value,
            lastname: document.getElementById("input-user-lastname").value,
            firstname: document.getElementById("input-user-firstname").value,
            eatingArea: document.getElementById("input-user-eating-area").value,
          };

          if (!values.lastname) {
            Swal.showValidationMessage(`Le ${isStaff ? 'personnel' : 'résident'} doit avoir un nom.`);
          }
          if (!values.firstname) {
            Swal.showValidationMessage(`Le ${isStaff ? 'personnel' : 'résident'} doit avoir un prénom.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.isStaff = isStaff;
          socket.emit('add user', data.value);
        }
        this.usersModal(isStaff);
      });
    },
    editUserModal(isStaff, user) {
      const userData = state.users.find(u => u.id == user.id && u.isStaff == isStaff);
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Modifier ${isStaff ? 'le membre du personnel' : 'le résident'} `,
        html: `
        <div class="add-user-modal-container modal-container">
              <div class="input-row">
                <div class="btn-switch-select" id="btn-switch-civility" data-value="${userData.civility}">
                  <div class="switch-label">
                    <p class="current-choice">${userData.civility}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <ul class="switch-list">
                    <li class="choice" data-choice="Mme">Mme</li>
                    <li class="choice" data-choice="M.">M.</li>
                  </ul>
                </div>
                <input type="text" id="input-user-lastname" class="btn-input" value="${userData.lastname}" placeholder="Nom" />
              </div>
              <div class="input-row">
                <input type="text" id="input-user-firstname" class="btn-input" value="${userData.firstname}" placeholder="Prénom" />
              </div>
              <div class="input-row">
                <p>Lieu de repas :</p>
                <input type="text" id="input-user-eating-area" class="btn-input" value="${userData.eatingArea}" placeholder="Salle / Cosy" />
              </div>
            </div>
        `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("btn-switch-civility").addEventListener('click', (e) => {
            const btn = e.target.closest("#btn-switch-civility");
            if (!btn.classList.contains('active')) {
              btn.querySelectorAll('.choice').forEach((li) => {
                li.style.display = li.dataset && li.dataset.choice == btn.dataset.value ? 'none' : 'flex';
              });
            }
            else {
              const choice = e.target.closest(".choice");
              if (choice) {
                btn.dataset.value = choice.dataset.choice;
                btn.querySelector('.current-choice').textContent = choice.dataset.choice;
              }
            }
            btn.classList.toggle('active');
          });
          document.getElementById("input-user-lastname").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value.toUpperCase().replaceAll('  ', ' ');
            }
          });
          document.getElementById("input-user-firstname").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById("input-user-eating-area").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
        },
        preConfirm: () => {
          const values = {
            civility: document.getElementById("btn-switch-civility").dataset.value,
            lastname: document.getElementById("input-user-lastname").value,
            firstname: document.getElementById("input-user-firstname").value,
            eatingArea: document.getElementById("input-user-eating-area").value,

          };

          if (!values.lastname) {
            Swal.showValidationMessage(`Le ${isStaff ? 'personnel' : 'résident'} doit avoir un nom.`);
          }
          if (!values.firstname) {
            Swal.showValidationMessage(`Le ${isStaff ? 'personnel' : 'résident'} doit avoir un prénom.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.id = user.id;
          socket.emit('edit user', data.value);
        }
        this.showUserModal(isStaff, user.id);
      });
    },
    deleteUserModal(isStaff, user) {
      if (!user) return;
      const data = {};
      let lastConfig = false;
      const configList = state.userMealConfigs.filter(c => c.userId == user.id);
      if (configList && configList.length > 0) {
        lastConfig = configList.find(c => c.dateEnd == null) || configList.sort((a, b) => moment(b.dateStart).diff(a.dateStart))[0];
      }
      const eventsList = state.userEvents.filter(e => e.userId == user.id);
      if (!lastConfig && !eventsList.length) {
        data.html = `
            <div class="delete-user-modal-container modal-container">
              <h2>Vous allez supprimer <strong>${user.civility} ${user.lastname} ${user.firstname}</strong>.</h2>
              <p class="warning-label">Cette action est irréversible.</p>
            </div>
        `;
        data.preConfirm = () => {
          return {};
        };
      }
      else {
        data.html = `
            <div class="delete-user-modal-container modal-container">
              <h2>Pour supprimer <strong>${user.civility} ${user.lastname} ${user.firstname}</strong> vous devez renseigner une date de sortie.</h2>
              <div class="date-container">
                <input type="date" id="input-user-date-end" ${lastConfig ? `min="${moment(lastConfig.dateStart).add(1, 'days').format('YYYY-MM-DD')}"` : ''} value="" class="btn-input" />
              </div>
              <p>Tous les événements de cet utilisateur seront désactivés après cette date.</p>
              <p class="warning-label">Cette action est irréversible.</p>
            </div>
        `;
        data.preConfirm = () => {
          const values = {
            date: document.getElementById("input-user-date-end").value,
          };
          if (!values.date) {
            Swal.showValidationMessage(`Vous devez renseigner une date de fin.`);
          }
          else if (lastConfig && moment(values.date).isSameOrBefore(moment(lastConfig.dateStart))) {
            Swal.showValidationMessage(`La date de fin doit être postérieure à la date de début de la dernière configuration (${moment(lastConfig.dateStart).format('DD/MM/YYYY')}).`);
          }

          return values;
        };
      }
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Supprimer un ${isStaff ? 'membre du personnel' : 'résident'}`,
        html: data.html,
        confirmButtonText: 'Supprimer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        preConfirm: data.preConfirm,
      }).then((data) => {
        if (data.isConfirmed) {
          if (lastConfig) {
            data.value.configId = configList.sort((a, b) => moment(b.dateStart).diff(a.dateStart))[0].id;
            socket.emit('edit user meal config end', data.value);
          }
          const date = moment.utc(data.value.date);
          const eventsEntries = {
            edited: [],
            deleted: [],
            date: date.format('YYYY-MM-DD'),
          };
          state.userEvents.filter(e => e.userId == user.id).filter(ev => ev.elements.find(e => date.isBefore(moment.utc(e.dateEnd), 'day'))).forEach(ev => {
            ev.elements.forEach(el => {
              if (date.isBefore(moment.utc(el.dateStart), 'day')) {
                eventsEntries.deleted.push({
                  eventId: ev.id,
                  elementId: el.id,
                });
              }
              else if (date.isSameOrAfter(moment.utc(el.dateStart), 'day') && date.isBefore(moment.utc(el.dateEnd), 'day')) {
                eventsEntries.edited.push({
                  eventId: ev.id,
                  elementId: el.id,
                });
              }
            });
            if (ev.elements.filter(el => eventsEntries.deleted.find(de => de.elementId == el.id)).length == ev.elements.length) {
              eventsEntries.deleted.push({
                eventId: ev.id,
                elementId: null,
              });
            }
          });
          const guestEntries = {
            edited: [],
            deleted: [],
            date: date.format('YYYY-MM-DD'),
          };
          state.guests.filter(e => e.userId == user.id).filter(ev => ev.elements.find(e => date.isBefore(moment.utc(e.dateEnd), 'day'))).forEach(ev => {
            ev.elements.forEach(el => {
              if (date.isBefore(moment.utc(el.dateStart), 'day')) {
                guestEntries.deleted.push({
                  guestId: ev.id,
                  elementId: el.id,
                });
              }
              else if (date.isSameOrAfter(moment.utc(el.dateStart), 'day') && date.isBefore(moment.utc(el.dateEnd), 'day')) {
                guestEntries.edited.push({
                  guestId: ev.id,
                  elementId: el.id,
                });
              }
            });
            if (ev.elements.filter(el => guestEntries.deleted.find(de => de.elementId == el.id)).length == ev.elements.length) {
              guestEntries.deleted.push({
                guestId: ev.id,
                elementId: null,
              });
            }
          });

          socket.emit('delete user', {
            id: user.id,
            date: data.value.date,
            eventsEntries,
            guestEntries,
          });
          this.showUserModal(isStaff, user.id);
        }
        else {
          this.showUserModal(isStaff, user.id);
        }
      });
    },
    addMealModal() {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Ajouter un type de repas`,
        html: `
        <div class="add-meal-modal-container modal-container">
              <input type="text" id="meal-label" class="btn-input btn-search" placeholder="Nom du repas" />
              <input type="text" id="meal-abbreviation" class="btn-input btn-search" value="" placeholder="Abréviation" />
              <div class="triple-select-input">
                <input type="text" class="btn-input" id="select-deliveries" data-id="0" value="Aucun plateau" readonly />
                <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                <ul class="triple-select-list" id="list-deliveries">
                  <li class="choice" data-id="0">Aucun plateau</li>
                  <li class="choice" data-id="1">Plateau du Midi</li>
                  <li class="choice" data-id="2">Plateau du Soir</li>
                </ul>
              </div>
              <label for="guest-active" class="btn-checkbox">
                <input type="checkbox" id="guest-active" class="hidden" />
                <span class="checkmark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </span>
                <span class="label">Repas d'invité</span>
              </label>
              <label for="staff-active" class="btn-checkbox">
                <input type="checkbox" id="staff-active" class="hidden" />
                <span class="checkmark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </span>
                <span class="label">Repas du personnel</span>
              </label>
            </div>
        `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("guest-active").addEventListener('click', (e) => {
            e.target.closest('label').classList.toggle('active');
          });
          document.getElementById("staff-active").addEventListener('click', (e) => {
            e.target.closest('label').classList.toggle('active');
          });
          document.getElementById("meal-label").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById("meal-abbreviation").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value.toUpperCase().replaceAll('  ', ' ');
            }
          });
          document.getElementById("list-deliveries").addEventListener('click', (e) => {
            const choice = e.target.closest(".choice");
            if (choice) {
              const select = document.getElementById("select-deliveries");
              select.dataset.id = choice.dataset.id;
              select.value = choice.textContent;
            }
            document.getElementById("list-deliveries").querySelectorAll('.choice').forEach((li) => {
              li.style.display = 'flex';
            });
          });
          document.getElementById("select-deliveries").addEventListener('focus', (e) => {
            const dataId = e.target.dataset.id;
            document.getElementById("list-deliveries").querySelectorAll('.choice').forEach((li) => {
              li.style.display = li.dataset && li.dataset.id == dataId ? 'none' : 'flex';
            });
          });
          document.getElementById("select-deliveries").addEventListener('click', (e) => {
            if (e.target.classList.contains('active')) {
              e.target.blur();
            }
            else {
              e.target.classList.add('active');
            }
          });
          document.getElementById("select-deliveries").addEventListener('blur', (e) => {
            e.target.classList.remove('active');
          });
        },
        preConfirm: () => {
          const values = {
            label: document.getElementById("meal-label").value,
            abbreviation: document.getElementById("meal-abbreviation").value,
            canGuest: document.getElementById("guest-active").checked,
            deliveryId: document.getElementById("select-deliveries").dataset.id,
            isStaff: document.getElementById("staff-active").checked,
          };

          if (!values.label) {
            Swal.showValidationMessage(`Le type de repas doit avoir un nom.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.order = state.kindMeals.length;
          socket.emit('add kind meal', data.value);
        }
        this.mealsModal();
      });
    },
    editMealModal(id) {
      const kindMeal = state.kindMeals.find(k => k.id == id);
      if (!kindMeal) return;
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Modifier un type de repas`,
        html: `
            <div class="add-meal-modal-container modal-container">
              <input type="text" id="meal-label" class="btn-input btn-search" value="${kindMeal.label}" placeholder="Nom du repas" />
              <input type="text" id="meal-abbreviation" class="btn-input btn-search" value="${kindMeal.abbreviation ? kindMeal.abbreviation : ''}" placeholder="Abréviation" />
              <div class="triple-select-input">
                <input type="text" class="btn-input" id="select-deliveries" data-id="${kindMeal.deliveryId}" value="Aucun plateau" readonly />
                <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                <ul class="triple-select-list" id="list-deliveries">
                  <li class="choice" data-id="0">Aucun plateau</li>
                  <li class="choice" data-id="1">Plateau du Midi</li>
                  <li class="choice" data-id="2">Plateau du Soir</li>
                </ul>
              </div>
              <label for="guest-active" class="btn-checkbox ${kindMeal.canGuest ? 'active' : ''}">
                <input type="checkbox"  ${kindMeal.canGuest ? 'checked' : ''} id="guest-active" class="hidden" />
                <span class="checkmark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </span>
                <span class="label">Repas d'invité</span>
              </label>
              <label for="staff-active" class="btn-checkbox ${kindMeal.isStaff ? 'active' : ''}">
                <input type="checkbox"  ${kindMeal.isStaff ? 'checked' : ''} id="staff-active" class="hidden" />
                <span class="checkmark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </span>
                <span class="label">Repas du personnel</span>
              </label>
            </div>
        `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('list-deliveries').querySelectorAll('.choice').forEach((li) => {
            if (li.dataset.id == kindMeal.deliveryId) {
              document.getElementById("select-deliveries").value = li.textContent;
            }
          });
          document.getElementById("guest-active").addEventListener('click', (e) => {
            e.target.closest('label').classList.toggle('active');
          });
          document.getElementById("staff-active").addEventListener('click', (e) => {
            e.target.closest('label').classList.toggle('active');
          });
          document.getElementById("meal-label").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById("list-deliveries").addEventListener('click', (e) => {
            const choice = e.target.closest(".choice");
            if (choice) {
              const select = document.getElementById("select-deliveries");
              select.dataset.id = choice.dataset.id;
              select.value = choice.textContent;
            }
            document.getElementById("list-deliveries").querySelectorAll('.choice').forEach((li) => {
              li.style.display = 'flex';
            });
          });
          document.getElementById("select-deliveries").addEventListener('focus', (e) => {
            const dataId = e.target.dataset.id;
            document.getElementById("list-deliveries").querySelectorAll('.choice').forEach((li) => {
              li.style.display = li.dataset && li.dataset.id == dataId ? 'none' : 'flex';
            });
          });
          document.getElementById("select-deliveries").addEventListener('click', (e) => {
            if (e.target.classList.contains('active')) {
              e.target.blur();
            }
            else {
              e.target.classList.add('active');
            }
          });
          document.getElementById("select-deliveries").addEventListener('blur', (e) => {
            e.target.classList.remove('active');
          });
          document.getElementById("meal-abbreviation").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value.toUpperCase().replaceAll('  ', ' ');
            }
          });
        },
        preConfirm: () => {
          const values = {
            label: document.getElementById("meal-label").value,
            abbreviation: document.getElementById("meal-abbreviation").value,
            canGuest: document.getElementById("guest-active").checked,
            deliveryId: document.getElementById("select-deliveries").dataset.id,
            isStaff: document.getElementById("staff-active").checked
          };

          if (!values.label) {
            Swal.showValidationMessage(`Le type de repas doit avoir un nom.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.id = kindMeal.id;
          socket.emit('edit kind meal', data.value);
        }
        this.mealsModal();
      });
    },
    deleteMealModal(id) {
      const kindMeal = state.kindMeals.find(k => k.id == id);
      if (!kindMeal) return;
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Supprimer un type de repas`,
        html: `
            <div class="delete-meal-modal-container modal-container">
              <h2>Pour supprimer le type de repas <strong>${kindMeal.label}</strong> vous devez renseigner une date de fin.</h2>
              <div class="date-container">
                <input type="date" id="input-meal-date-end" value="" class="btn-input" />
              </div>
              <p class="warning-label">Cette action est irréversible.</p>
            </div>
        `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        preConfirm: () => {
          const values = {
            date: document.getElementById("input-meal-date-end").value,
          };
          if (!values.date) {
            Swal.showValidationMessage(`Vous devez renseigner une date de fin pour supprimer ce type de repas.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.id = kindMeal.id;
          socket.emit('delete kind meal', data.value);
        }
        this.mealsModal();
      });
    },
    addUserConfigModal(isStaff, userId) {
      const user = state.users.find(u => u.id == userId && u.isStaff == isStaff);
      const configList = state.userMealConfigs.filter(c => c.userId == userId).sort((a, b) => moment(b.dateStart).diff(a.dateStart));
      const config = configList.length > 0 ? configList[0] : null;
      let minDate = null;

      if (!user.isActive) {
        minDate = config ? moment(config.dateEnd).add(2, 'days').format('YYYY-MM-DD') : null;
      }
      else {
        minDate = config ? moment(config.dateStart).add(1, 'days').format('YYYY-MM-DD') : null;
      }

      const mealList = state.kindMeals.filter(kd => kd.isStaff == isStaff || !isStaff).filter(kd => (!kd.dateEnd || moment(kd.dateEnd).isAfter(moment(this.date))) && (isStaff ? kd.isStaff : true)).map((kd) => {
        const current = config ? config.elements.find(e => e.idKindMeal == kd.id) : null;

        return `<tr data-id="${kd.id}" data-meal="${current ? true : false}" data-delivery="${current && current.delivery ? true : false}" data-config="{'monday':${!current || current.monday},'tuesday':${!current || current.tuesday},'wednesday':${!current || current.wednesday},'thursday':${!current || current.thursday},'friday':${!current || current.friday},'saturday':${!current || current.saturday},'sunday':${!current || current.sunday}}" data-holiday="${current && current.publicHoliday ? true : false}">
            <td>
              ${kd.label}
            </td>
            <td>
              <div class="custom-checkbox ${current ? 'active' : ''}" data-type="meal"></div>
            </td>
            <td>
              <div class="custom-checkbox ${!kd.deliveryId ? 'disabled' : ''}" data-type="delivery"></div>
            </td>
            <td>
              <div class="custom-checkbox ${(current && current.publicHoliday) ? 'active' : ''}" data-type="holiday"></div>
            </td>
            <td>
              <div class="btn-select" data-type="days" data-value="{'monday':${!current || current.monday},'tuesday':${!current || current.tuesday},'wednesday':${!current || current.wednesday},'thursday':${!current || current.thursday},'friday':${!current || current.friday},'saturday':${!current || current.saturday},'sunday':${!current || current.sunday}}">
                  <div class="select-label">
                    <p class="current-choice"></p>
                  </div>
                  <ul class="select-list">
                    <li class="label"><p>${kd.label}</p></li>
                    <li class="choice ${(!current || (current && current.monday)) ? 'active' : ''}" data-choice="monday"><div class="custom-checkbox"></div>Lundi</li>
                    <li class="choice ${(!current || (current && current.tuesday)) ? 'active' : ''}" data-choice="tuesday"><div class="custom-checkbox"></div>Mardi</li>
                    <li class="choice ${(!current || (current && current.wednesday)) ? 'active' : ''}" data-choice="wednesday"><div class="custom-checkbox"></div>Mercredi</li>
                    <li class="choice ${(!current || (current && current.thursday)) ? 'active' : ''}" data-choice="thursday"><div class="custom-checkbox"></div>Jeudi</li>
                    <li class="choice ${(!current || (current && current.friday)) ? 'active' : ''}" data-choice="friday"><div class="custom-checkbox"></div>Vendredi</li>
                    <li class="choice ${(!current || (current && current.saturday)) ? 'active' : ''}" data-choice="saturday"><div class="custom-checkbox"></div>Samedi</li>
                    <li class="choice ${(!current || (current && current.sunday)) ? 'active' : ''}" data-choice="sunday"><div class="custom-checkbox"></div>Dimanche</li>
                  </ul>
                </div>
            </td>
          </tr> `
      }).join('');
      Swal.mixin({
        width: '50vw',
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Créer une configuration de repas`,
        html: `
            <div id="click-container" class="add-user-config-modal-container modal-container">
              <h2>${user.civility} ${user.lastname} ${user.firstname}</h2>
              <table class="table meal-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Repas</th>
                    <th>Plateau</th>
                    <th>Jour férié</th>
                    <th>Jours actifs</th>
                  </tr>
                </thead>
                <tbody id="user-config-meal-list">
                  ${mealList}
                </tbody>
              </table>
              <div class="date-container">
                <label for="input-date-start">Date de début</label>
                <input type="date" id="input-date-start" class="btn-input" min="${minDate}" placeholder="Date de début" />
              </div>
            </div> `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('user-config-meal-list').addEventListener('click', (e) => {
            if (!(e.target.closest('tr').dataset.meal == "true") && !(e.target.closest('div').dataset.type && e.target.closest('div').dataset.type == "meal")) return;
            if (e.target.closest('div').classList.contains('custom-checkbox') && e.target.closest('div').dataset.type) {
              const checkbox = e.target.closest('div');

              const type = checkbox.dataset.type;
              const tr = e.target.closest('tr');
              if (checkbox.classList.contains('active')) {
                checkbox.classList.remove('active');
                tr.dataset[type] = false;
                if (type == "meal") {
                  tr.dataset.holiday = false;
                  tr.dataset.delivery = false;
                  tr.querySelector('div[data-type="delivery"]').classList.remove('active');
                  tr.querySelector('div[data-type="holiday"]').classList.remove('active');
                }
              }
              else {
                checkbox.classList.add('active');
                tr.dataset[type] = true;
                if (type == "meal") {
                  tr.dataset.holiday = true;
                  tr.querySelector('div[data-type="holiday"]').classList.add('active');
                }
              }
            }
            else if (e.target.closest('li') && e.target.closest('li').classList.contains('choice')) {
              const tr = e.target.closest('tr');
              const li = e.target.closest('.choice');
              const select = li.closest('.btn-select');
              const current = JSON.parse(select.dataset.value.replaceAll("'", '"') ?? '{}');
              if (li.classList.contains('active')) {
                li.classList.remove('active');
                current[li.dataset.choice] = false;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              else {
                li.classList.add('active');
                current[li.dataset.choice] = true;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              const nbElement = Object.values(current).filter(v => v).length;
              switch (nbElement) {
                case 0:
                  tr.querySelector('.current-choice').textContent = 'Aucun jour';
                  break;
                case 7:
                  tr.querySelector('.current-choice').textContent = 'Tous les jours';
                  break;

                default:
                  tr.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                  break;
              }
            }
            else if (e.target.closest('div.btn-select') && e.target.closest('div.btn-select').classList.contains('btn-select')) {
              if (!e.target.closest('ul.select-list')) {
                e.target.closest('div.btn-select').classList.toggle('active');
              }
            }
          });
          document.getElementById('user-config-meal-list').querySelectorAll('.btn-select').forEach((li) => {
            const current = JSON.parse(li.dataset.value.replaceAll("'", '"') ?? '{}');
            const nbElement = Object.values(current).filter(v => v).length;
            switch (nbElement) {
              case 0:
                li.querySelector('.current-choice').textContent = 'Aucun jour';
                break;
              case 7:
                li.querySelector('.current-choice').textContent = 'Tous les jours';
                break;

              default:
                li.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                break;
            }
          });
          document.getElementById('click-container').addEventListener('click', (e) => {
            if ((e.target.closest('div.btn-select') && !e.target.closest('tr[data-meal="false"]')) || e.target.closest('ul.select-list')) return;
            document.querySelectorAll('div.btn-select').forEach((li) => {
              if (li.classList.contains('active')) {
                li.classList.remove('active');
              }
            });
          });
        },
        preConfirm: () => {
          const values = {
            dateStart: document.getElementById("input-date-start").value,
            configList: [],
          };

          document.getElementById('user-config-meal-list').querySelectorAll('tr').forEach(
            (tr) => {
              if (tr.dataset.id && tr.dataset.meal == "true") {
                const config = JSON.parse(tr.dataset.config.replaceAll("'", '"') ?? '{}');
                values.configList.push({
                  idKindMeal: tr.dataset.id,
                  delivery: (tr.dataset.delivery == "true" || tr.dataset.delivery == 1),
                  monday: config.monday,
                  tuesday: config.tuesday,
                  wednesday: config.wednesday,
                  thursday: config.thursday,
                  friday: config.friday,
                  saturday: config.saturday,
                  sunday: config.sunday,
                  publicHoliday: (tr.dataset.holiday == "true" || tr.dataset.holiday == 1),
                });
              }
            }
          );

          if (!values.dateStart) {
            Swal.showValidationMessage(`La date de début est obligatoire.`);
          }
          else if (configList.find(c => moment(c.dateStart).isSame(moment(values.dateStart)))) {
            Swal.showValidationMessage(`Il existe déjà une configuration qui débute à cette date.`);
          }

          if (!values.configList.length) {
            values.configList = [];
          }
          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.userId = userId;
          data.value.dateEnd = null;
          data.value.previousConfig = null;
          if (!user.isActive) {
            socket.emit('edit user status', { id: user.id, isActive: 1 });
          }
          if (configList.length > 0) {
            const previousConfig = configList.find(c => moment(c.dateStart).isBefore(moment(data.value.dateStart)));

            if (previousConfig && !previousConfig.dateEnd) {
              data.value.previousConfig = {
                id: previousConfig.id,
                dateEnd: moment(data.value.dateStart).subtract(1, 'days').format('YYYY-MM-DD')
              }
            }

            const nextConfig = configList.reverse().find(c => moment(c.dateStart).isAfter(moment(data.value.dateStart)));
            if (nextConfig) {
              data.value.dateEnd = moment(nextConfig.dateStart).add(-1, 'days').format('YYYY-MM-DD');
            }
          }

          socket.emit('add user meal config', data.value);
        }
        this.showUserModal(isStaff, userId);
      });
    },
    editUserConfigModal(isStaff, userId, configId) {
      const config = state.userMealConfigs.find(c => c.id == configId);
      if (!config) return;
      const user = state.users.find(u => u.id == userId);

      const configList = state.userMealConfigs
        .filter(c => c.userId == userId && c.id != config.id)
        .sort((a, b) => moment(b.dateStart).diff(a.dateStart));

      const previousConfig = configList.length > 0 ? configList.find(c => moment(config.dateStart).add(-1, 'days').isSame(moment(c.dateEnd))) : null;
      const beforeConfig = configList.length > 0 ? configList.find(c => moment(c.dateStart).isBefore(moment(config.dateStart))) : null;
      const nextConfig = configList.length > 0 ? configList.find(c => moment(config.dateEnd).add(1, 'days').isSame(moment(c.dateStart))) : null;

      const mealList = state.kindMeals.filter(kd => !isStaff || kd.isStaff == isStaff).map((kd) => {
        const current = config.elements.find(e => e.idKindMeal == kd.id);

        return `<tr data-id="${kd.id}" data-meal="${current ? true : false}" data-delivery="${current ? (current.delivery ? true : false) : false}" data-config="{'monday':${!current || current.monday},'tuesday':${!current || current.tuesday},'wednesday':${!current || current.wednesday},'thursday':${!current || current.thursday},'friday':${!current || current.friday},'saturday':${!current || current.saturday},'sunday':${!current || current.sunday}}"data-holiday="${current ? current.publicHoliday : false}">
            <td>
              ${kd.label}
            </td>
            <td>
              <div class="custom-checkbox ${current ? 'active' : ''}" data-type="meal"></div>
            </td>
            <td>
              <div class="custom-checkbox ${!kd.deliveryId ? 'disabled' : ''}" data-type="delivery"></div>
            </td>
            <td>
              <div class="custom-checkbox ${(current && current.publicHoliday) ? 'active' : ''}" data-type="holiday"></div>
            </td>
            <td>
              <div class="btn-select" data-type="days" data-value="{'monday':${!current || current.monday},'tuesday':${!current || current.tuesday},'wednesday':${!current || current.wednesday},'thursday':${!current || current.thursday},'friday':${!current || current.friday},'saturday':${!current || current.saturday},'sunday':${!current || current.sunday}}">
                  <div class="select-label">
                    <p class="current-choice">Tous les jours</p>
                  </div>
                  <ul class="select-list">
                    <li class="label"><p>${kd.label}</p></li>
                    <li class="choice ${(!current || current.monday) ? 'active' : ''}" data-choice="monday"><div class="custom-checkbox"></div>Lundi</li>
                    <li class="choice ${(!current || current.tuesday) ? 'active' : ''}" data-choice="tuesday"><div class="custom-checkbox"></div>Mardi</li>
                    <li class="choice ${(!current || current.wednesday) ? 'active' : ''}" data-choice="wednesday"><div class="custom-checkbox"></div>Mercredi</li>
                    <li class="choice ${(!current || current.thursday) ? 'active' : ''}" data-choice="thursday"><div class="custom-checkbox"></div>Jeudi</li>
                    <li class="choice ${(!current || current.friday) ? 'active' : ''}" data-choice="friday"><div class="custom-checkbox"></div>Vendredi</li>
                    <li class="choice ${(!current || current.saturday) ? 'active' : ''}" data-choice="saturday"><div class="custom-checkbox"></div>Samedi</li>
                    <li class="choice ${(!current || current.sunday) ? 'active' : ''}" data-choice="sunday"><div class="custom-checkbox"></div>Dimanche</li>
                  </ul>
                </div>
            </td>
          </tr> `
      });
      Swal.mixin({
        width: '50vw',
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Modifier la configuration de repas`,
        html: `
        <div id="click-container" class="add-user-config-modal-container modal-container">
          <div class="trash-user-btn" id="trash-user-btn">${this.trashIcon}</div>
          <h2 class="font-medium">${user.civility} ${user.lastname} ${user.firstname}</h2>
          <table class="table meal-table">
            <thead>
              <tr>
                <th></th>
                <th>Repas</th>
                <th>Plateau</th>
                <th>Jour férié</th>
                <th>Jours actifs</th>
              </tr>
            </thead>
            <tbody id="user-config-meal-list">
              ${mealList.join('')}
            </tbody>
          </table>
          <div class="content-input">
            <div class="date-container">
              <h2>Date de début</h2>
              <input type="date" id="input-date-start" 
              ${previousConfig ? `min="${moment(previousConfig.dateStart).add(1, 'day').format('YYYY-MM-DD') ?? ''}"` : beforeConfig ? `min="${moment(beforeConfig.dateEnd).add(2, 'day').format('YYYY-MM-DD') ?? ''}"` : ""}
              ${config.dateEnd ? `max="${moment(config.dateEnd).format('YYYY-MM-DD') ?? ''}"` : ""} 
              value="${moment(config.dateStart).format('YYYY-MM-DD') ?? ''}" class="btn-input" />
            </div>
            ${config.dateEnd ? (nextConfig ? `
            <div class="date-container">
              <h2>Date de fin</h2>
              <p>${moment(config.dateEnd).format('DD/MM/YYYY')}</p>
            </div>
            ` : `
            <div class="date-container">
              <h2>Date de fin</h2>
              <input type="date" id="input-date-end" min="${moment(config.dateStart).format('YYYY-MM-DD')}" value="${moment(config.dateEnd).format('YYYY-MM-DD')}" class="btn-input" />
            </div>
            `) : ``}
          </div>
        </div>
        `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('user-config-meal-list').querySelectorAll('.btn-select').forEach((li) => {
            const current = JSON.parse(li.dataset.value.replaceAll("'", '"') ?? '{}');
            const nbElement = Object.values(current).filter(v => v).length;
            switch (nbElement) {
              case 0:
                li.querySelector('.current-choice').textContent = 'Aucun jour';
                break;
              case 7:
                li.querySelector('.current-choice').textContent = 'Tous les jours';
                break;

              default:
                li.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                break;
            }
          });
          document.getElementById('user-config-meal-list').addEventListener('click', (e) => {
            if (!(e.target.closest('tr').dataset.meal == "true") && !(e.target.closest('div').dataset.type && e.target.closest('div').dataset.type == "meal")) return;
            if (e.target.closest('div').classList.contains('custom-checkbox') && e.target.closest('div').dataset.type) {
              const checkbox = e.target.closest('div');

              const type = checkbox.dataset.type;
              const tr = e.target.closest('tr');
              if (checkbox.classList.contains('active')) {
                checkbox.classList.remove('active');
                tr.dataset[type] = false;
                if (type == "meal") {
                  tr.dataset.holiday = false;
                  tr.dataset.delivery = false;
                  tr.querySelector('div[data-type="delivery"]').classList.remove('active');
                  tr.querySelector('div[data-type="holiday"]').classList.remove('active');
                }
              }
              else {
                checkbox.classList.add('active');
                tr.dataset[type] = true;
                if (type == "meal") {
                  tr.dataset.holiday = true;
                  tr.querySelector('div[data-type="holiday"]').classList.add('active');
                }
              }
            }
            else if (e.target.closest('li') && e.target.closest('li').classList.contains('choice')) {
              const tr = e.target.closest('tr');
              const li = e.target.closest('li');
              const select = li.closest('.btn-select');
              const current = JSON.parse(select.dataset.value.replaceAll("'", '"') ?? '{}');
              if (li.classList.contains('active')) {
                li.classList.remove('active');
                current[li.dataset.choice] = false;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              else {
                li.classList.add('active');
                current[li.dataset.choice] = true;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              const nbElement = Object.values(current).filter(v => v).length;
              switch (nbElement) {
                case 0:
                  tr.querySelector('.current-choice').textContent = 'Aucun jour';
                  break;
                case 7:
                  tr.querySelector('.current-choice').textContent = 'Tous les jours';
                  break;

                default:
                  tr.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                  break;
              }
            }
            else if (e.target.closest('div.btn-select') && e.target.closest('div.btn-select').classList.contains('btn-select')) {
              if (!e.target.closest('ul.select-list')) {
                e.target.closest('div.btn-select').classList.toggle('active');
              }
            }
          });
          document.getElementById('click-container').addEventListener('click', (e) => {
            if (e.target.id == 'trash-user-btn' || e.target.closest('#trash-user-btn')) return;
            document.querySelectorAll('div.btn-select').forEach((li) => {
              if (li.classList.contains('active') && e.target.closest('div.btn-select') != li) {
                li.classList.remove('active');
              }
            });
          });
          document.getElementById('trash-user-btn').addEventListener('click', () => {
            Swal.clickDeny();
          });
        },
        preConfirm: () => {
          const values = {
            configList: [],
            dateStart: document.getElementById("input-date-start").value,
            dateEnd: document.getElementById("input-date-end") ? document.getElementById("input-date-end").value : config.dateEnd,
          };

          document.getElementById('user-config-meal-list').querySelectorAll('tr').forEach(
            (tr) => {
              if (tr.dataset.id && tr.dataset.meal == "true") {
                const config = JSON.parse(tr.dataset.config.replaceAll("'", '"') ?? '{}');

                values.configList.push({
                  idKindMeal: tr.dataset.id,
                  delivery: (tr.dataset.delivery == "true" || tr.dataset.delivery == 1),
                  monday: config.monday,
                  tuesday: config.tuesday,
                  wednesday: config.wednesday,
                  thursday: config.thursday,
                  friday: config.friday,
                  saturday: config.saturday,
                  sunday: config.sunday,
                  publicHoliday: (tr.dataset.holiday == "true" || tr.dataset.holiday == 1),
                });
              }
            }
          );
          if (!values.configList.length) {
            values.configList = [];
          }
          if (previousConfig && moment(values.dateStart).isSameOrBefore(moment(previousConfig.dateStart))) {
            Swal.showValidationMessage(`La date de début doit être postérieure au ${moment(previousConfig.dateStart).format('DD/MM/YYYY')} (date de début de la dernière configuration).`);
          }
          else if (values.dateEnd && moment(values.dateStart).isAfter(moment(values.dateEnd))) {
            Swal.showValidationMessage(`La date de début doit être antérieure au ${moment(config.dateEnd).format('DD/MM/YYYY')} (date de fin de la configuration).`);
          }
          else if (values.dateEnd && moment(values.dateEnd).isBefore(moment(values.dateStart))) {
            Swal.showValidationMessage(`La date de fin doit être postérieure ou égale à la date de début.`);
          }
          else if (!values.dateStart) {
            Swal.showValidationMessage(`La date de début est obligatoire.`);
          }
          return values;
        },
      }).then((data) => {
        if (data.isDenied) {
          this.deleteUserConfigModal(configId);
          return;
        }
        if (data.isConfirmed) {
          data.value.userId = userId;
          data.value.configId = configId;
          data.value.adedEntries = data.value.configList.filter(c => !config.elements.find(e => e.idKindMeal == c.idKindMeal));
          data.value.deletedEntries = config.elements.filter(e => !data.value.configList.find(c => c.idKindMeal == e.idKindMeal)).map(e => e.idKindMeal);
          data.value.editedEntries = data.value.configList.filter(c => {
            const existing = config.elements.find(e => e.idKindMeal == c.idKindMeal);
            if (!existing) return false;
            return (
              existing.delivery != c.delivery ||
              existing.monday != c.monday ||
              existing.tuesday != c.tuesday ||
              existing.wednesday != c.wednesday ||
              existing.thursday != c.thursday ||
              existing.friday != c.friday ||
              existing.saturday != c.saturday ||
              existing.sunday != c.sunday ||
              existing.publicHoliday != c.publicHoliday
            );
          });
          data.value.previousConfig = {
            id: previousConfig ? previousConfig.id : null,
            dateEnd: previousConfig ? moment(data.value.dateStart).add(-1, 'days').format('YYYY-MM-DD') : null,
          };
          socket.emit('edit user meal config', data.value);
          if (data.value.dateEnd !== config.dateEnd) {
            const configUpdate = {
              configId: configId,
              date: moment(data.value.dateEnd).format('YYYY-MM-DD'),
            };
            socket.emit('edit user meal config end', configUpdate);
          }
        }
        this.showUserModal(isStaff, userId);
      });
    },
    deleteUserConfigModal(configId) {
      const config = state.userMealConfigs.find(c => c.id == configId);
      const user = state.users.find(u => u.id == config.userId);
      if (!user || !config) return;

      const listConfigs = state.userMealConfigs
        .filter(c => c.userId == user.id && c.id != config.id)
        .sort((a, b) => moment(b.dateStart).diff(a.dateStart));

      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Supprimer la configuration`,
        html: `
            <div class="delete-event-modal-container modal-container">
              <h2 class="font-medium">${user.civility} ${user.lastname} ${user.firstname}</h2>
              ${config.dateEnd ? `
              <h2>Configuration des repas du <strong>${moment(config.dateStart).format("dddd D MMMM YYYY").toLowerCase()}</strong> au <strong>${moment(config.dateEnd).format("dddd D MMMM YYYY").toLowerCase()}</strong>.</h2>` : `
              <h2>Configuration des repas à compter du <strong>${moment(config.dateStart).format("dddd D MMMM YYYY").toLowerCase()}</strong>.</h2>              `}
              <p class="warning-label">Cette action est irréversible.</p>
            </div>
        `,
        confirmButtonText: 'Confirmer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
      }).then((data) => {
        if (data.isConfirmed) {
          const values = {
            configId: config.id,
            previousConfig: null,
            nextConfig: null,
          }
          if (listConfigs && listConfigs.length > 0) {
            const previousConfig = listConfigs.find(c => moment(c.dateEnd).isSame(moment(config.dateStart).subtract(1, 'days')));
            if (previousConfig) {
              values.previousConfig = {
                id: previousConfig.id,
                dateEnd: config.dateEnd ? moment(config.dateEnd).format('YYYY-MM-DD') : null,
              };
            }
            else {
              socket.emit('edit user status', { id: user.id, isActive: 0 });
            }
          }
          socket.emit('delete user meal config', values);
          this.showUserModal(user.isStaff, user.id);
        }
        else {
          this.editUserConfigModal(user.isStaff, user.id, config.id);
        }
      });
    },
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    updateDate(event) {
      this.date = moment(event.target.value, 'YYYY-MM-DD').set('hour', 0).set('minute', 0).set('second', 0);
    },
    changeDate(int) {
      if (int < 0) {
        this.date = moment(this.date).subtract(1, 'days').set('hour', 0).set('minute', 0).set('second', 0);
      }
      else {
        this.date = moment(this.date).add(1, 'days').set('hour', 0).set('minute', 0).set('second', 0);
      }
      this.stringDate = this.formatDate(this.date);
    },
    addGuestModal(userId, label, dateStart, dateEnd, nbGuests, isStaff = false) {
      const userlist = util.getFilteredUsers(false).filter(u => {
        const usr = state.users.filter(u2 => `${u2.lastname} ${u2.firstname}` == `${u.lastname} ${u.firstname}`);
        return usr.length == 1 || (usr.length > 1 && usr[usr.length - 1].id == u.id);
      }).map((user) => {
        return `
          <li class="select-item" data-id="${user.id}">
            <p>${user.civility} <span class="filter">${user.lastname}</span></p>
          </li>
        `;
      }).join('');
      const currentUser = userId ? state.users.find(u => u.id == userId) : null;
      const nbDays = dateStart && dateEnd ? moment(dateEnd).diff(moment(dateStart)) / (1000 * 60 * 60 * 24) + 1 : null;
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Ajouter un invité`,
        html: `
          <div class="add-guest-modal-container modal-container">
            <label for="is-staff" class="btn-checkbox ${isStaff ? 'active' : ''}">
              <input type="checkbox"  ${isStaff ? 'checked' : ''} id="is-staff" class="hidden" />
              <span class="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </span>
              <span class="label">Membre du personnel</span>
            </label>
            <div class="users-search-input ${isStaff ? 'hidden' : ''}">
              <input type="text" class="btn-input" id="search-users-label" data-id="${userId ?? 'null'}" value="${currentUser ? currentUser.civility + ' ' + currentUser.lastname : ''}" placeholder="Sélection du résident" />
              <div class="search-result">
                <ul id="update-users-list">
                  ${userlist}
                </ul>
              </div>
            </div>
            <div class="guest-label-input ${!isStaff ? 'hidden' : ''}">
              <input type="text" class="btn-input" id="input-guest-label" value="${label ?? ''}" placeholder="Logéa" />
            </div>
            <div class="content-input">
              <div class="date-container">
                <h2>Date de début</h2>
                <input type="date" id="input-guest-date-start" value="${dateStart ?? ''}" class="btn-input" />
              </div>
              <div class="date-container">
                <h2>Date de fin</h2>
                <input type="date" id="input-guest-date-end" min="${dateStart ?? ''}" value="${dateEnd ?? ''}" class="btn-input" />
              </div>
              <p id="nb-selected-days" data-value="${nbDays ?? null}">${nbDays ? (nbDays + ' jour' + (nbDays > 1 ? 's' : '') + ' sélectionné' + (nbDays > 1 ? 's' : '')) : 'Aucun jour sélectionné'}</p>
            </div>
            <div class="content-input">
              <h2>Nombre d'invité(s)</h2>
              <div class="btn-input btn-number" id="nb-guest-input">
                <svg xmlns="http://www.w3.org/2000/svg" data-value="-1" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                </svg>
                <input type="number" id="nb-guest-input-value" placeholder="" value="${nbGuests ? nbGuests : 1}"/>
                <svg xmlns="http://www.w3.org/2000/svg" data-value="1" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            </div>
          </div>
        `,
        confirmButtonText: 'Confirmer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('update-users-list').addEventListener('update', () => {
            const list = document.getElementById('update-users-list');
            list.innerHTML = util.getFilteredUsers(false).filter(u => {
              const usr = state.users.filter(u2 => `${u2.lastname} ${u2.firstname}` == `${u.lastname} ${u.firstname}`);
              return usr.length == 1 || (usr.length > 1 && usr[usr.length - 1].id == u.id);
            }).map((user) => {
              return `
                <li class="select-item" data-id="${user.id}">
                  <p>${user.civility} <span class="filter">${user.lastname}</span></p>
                </li>`;
            }).join('');
          });
          document.getElementById('update-users-list').addEventListener('click', (e) => {
            if (e.target.closest('li')) {
              document.getElementById('search-users-label').value = e.target.closest('li').querySelector('p').textContent;
              document.getElementById('search-users-label').dataset.id = e.target.closest('li').dataset.id;
            }
          });
          document.getElementById('search-users-label').addEventListener('keydown', (e) => {
            if (e.target.dataset.id != "null") {
              e.target.value = "";
              e.target.dataset.id = null;
            }
          });
          document.getElementById('search-users-label').addEventListener('keyup', (e) => {
            const list = document.getElementById('update-users-list');
            const search = e.target.value.toLowerCase();
            list.querySelectorAll('li').forEach((li) => {
              const label = li.querySelector('p').textContent.toLowerCase();
              if (label.indexOf(search) == -1 && search.length != 0) {
                li.style.display = 'none';
              }
              else {
                li.style.display = 'flex';
              }
            });
          });
          document.getElementById('nb-guest-input').addEventListener('click', (e) => {
            if (e.target.closest('svg')) {
              const input = document.getElementById('nb-guest-input-value');
              if (e.target.closest('svg').dataset.value == "-1") {
                input.value = Math.max(1, parseInt(input.value) - 1);
              }
              else if (e.target.closest('svg').dataset.value == "1") {
                input.value = Math.min(100, parseInt(input.value) + 1);
              }
            }
          });
          document.getElementById('input-guest-date-start').addEventListener('change', (e) => {
            const dateEnd = document.getElementById('input-guest-date-end');
            if (e.target.value) {
              dateEnd.setAttribute('min', e.target.value);

              if (!dateEnd.value || moment(dateEnd.value).isBefore(e.target.value)) {
                dateEnd.value = e.target.value;
              }

              const nbDays = moment(document.getElementById('input-guest-date-end').value).diff(moment(e.target.value)) / (1000 * 60 * 60 * 24) + 1;
              const showNb = document.getElementById('nb-selected-days');
              showNb.textContent = `${nbDays} jour${nbDays > 1 ? 's' : ''} sélectionné${nbDays > 1 ? 's' : ''}`;
              showNb.dataset.value = nbDays;
            }
          });
          document.getElementById('input-guest-date-end').addEventListener('change', (e) => {
            const nbDays = moment(e.target.value).diff(moment(document.getElementById('input-guest-date-start').value)) / (1000 * 60 * 60 * 24) + 1;
            const showNb = document.getElementById('nb-selected-days');
            showNb.textContent = `${nbDays} jour${nbDays > 1 ? 's' : ''} sélectionné${nbDays > 1 ? 's' : ''}`;
            showNb.dataset.value = nbDays;
          });
          document.getElementById("input-guest-label").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById("is-staff").addEventListener('click', (e) => {
            e.target.closest('label').classList.toggle('active');
            if (e.target.checked) {
              document.querySelector('.users-search-input').classList.add('hidden');
              document.querySelector('.guest-label-input').classList.remove('hidden');
              document.getElementById('search-users-label').value = '';
              document.getElementById('search-users-label').dataset.id = 'null';
            }
            else {
              document.querySelector('.users-search-input').classList.remove('hidden');
              document.querySelector('.guest-label-input').classList.add('hidden');
              document.getElementById('input-guest-label').value = '';
            }
          });
        },
        preConfirm: () => {
          const values = {
            userId: document.getElementById("search-users-label").dataset.id,
            dateStart: document.getElementById("input-guest-date-start").value,
            dateEnd: document.getElementById("input-guest-date-end").value,
            nbGuests: parseInt(document.getElementById("nb-guest-input-value").value) || 1,
            guestLabel: document.getElementById("input-guest-label").value,
            isStaff: document.getElementById("is-staff").checked,
          };

          if (values.userId == "null") {
            values.userId = null;
          }

          if (!values.dateStart) {
            Swal.showValidationMessage(`La date de début est obligatoire.`);
          }
          if (!values.dateEnd) {
            Swal.showValidationMessage(`La date de fin est obligatoire.`);
          }
          if (values.dateStart && values.dateEnd && moment(values.dateStart).isAfter(values.dateEnd)) {
            Swal.showValidationMessage(`La date de début doit être avant la date de fin.`);
          }
          if (values.nbGuests < 1 || values.nbGuests > 100) {
            Swal.showValidationMessage(`Le nombre d'invités doit être compris entre 1 et 100.`);
          }
          if (values.isStaff && !values.guestLabel) {
            Swal.showValidationMessage(`Le membre du personnel doit avoir un nom.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          if ((!data.value.userId || data.value.userId == "null") && data.value.isStaff == false) {
            this.addUnknownGuestModal(data.value.dateStart, data.value.dateEnd, data.value.nbGuests);
          }
          else {
            this.addGuestConfigModal(data.value.userId, data.value.guestLabel, data.value.dateStart, data.value.dateEnd, data.value.nbGuests, data.value.isStaff);
          }
        }
      });
    },
    addUnknownGuestModal(dateStart, dateEnd, nbGuests) {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Ajouter ${nbGuests} invité${nbGuests > 1 ? 's' : ''}`,
        html: `
          <div class="guest-user-modal-container modal-container">
              <div class="input-row">
                <p>Pour ajouter ${nbGuests > 1 ? 'des invités' : 'un invité'} non reliés a un résident, veuillez renseigner un nom.</p>
              </div>
              <div class="input-row">
                <div class="btn-switch-select" id="btn-switch-civility" data-value="Mme">
                  <div class="switch-label">
                    <p class="current-choice">Mme</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <ul class="switch-list">
                    <li class="choice" data-choice="Mme">Mme</li>
                    <li class="choice" data-choice="M.">M.</li>
                  </ul>
                </div>
                <input type="text" id="input-user-lastname" class="btn-input" placeholder="Nom" />
              </div>
            </div>
        `,
        confirmButtonText: 'Confirmer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("btn-switch-civility").addEventListener('click', (e) => {
            const btn = e.target.closest("#btn-switch-civility");
            if (!btn.classList.contains('active')) {
              btn.querySelectorAll('.choice').forEach((li) => {
                li.style.display = li.dataset && li.dataset.choice == btn.dataset.value ? 'none' : 'flex';
              });
            }
            else {
              const choice = e.target.closest(".choice");
              if (choice) {
                btn.dataset.value = choice.dataset.choice;
                btn.querySelector('.current-choice').textContent = choice.dataset.choice;
              }
            }
            btn.classList.toggle('active');
          });
          document.getElementById("input-user-lastname").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value.toUpperCase().replaceAll('  ', ' ');
            }
          });
        },
        preConfirm: () => {
          const values = {
            civility: document.getElementById("btn-switch-civility").dataset.value,
            lastname: document.getElementById("input-user-lastname").value,
            label: null,
          };

          if (!values.lastname) {
            Swal.showValidationMessage(`${nbGuests > 1 ? "Les invités doivent" : "L'invité doit"} avoir un nom.`);
          }

          values.label = `${values.civility} ${values.lastname}`;

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          this.addGuestConfigModal(null, data.value.label, dateStart, dateEnd, nbGuests, false);
        }
        if (data.isDismissed) {
          this.addGuestModal(null, null, dateStart, dateEnd, nbGuests, false);
        }
      });
    },
    addGuestConfigModal(userId, guestLabel, dateStart, dateEnd, nbGuests, isStaff) {
      const user = state.users.find(u => u.id == userId);
      const listDate = [];
      for (var m = moment(dateStart); m.diff(dateEnd, 'days') <= 0; m.add(1, 'days')) {
        listDate.push(m.format('DD-MM-YYYY'));
      }
      const defaultDaysConfig = listDate.map((date) => {
        return `'${date}': true`;
      }).join(',') ?? '';
      const mealList = state.kindMeals.filter(kd => (kd.isStaff == isStaff || !isStaff) && kd.canGuest).map((kd) => {
        return `<tr data-id="${kd.id}" data-meal="false" data-delivery="false" data-config="{${defaultDaysConfig}}">
            <td>
              ${kd.label}
            </td>
            <td>
              <div class="custom-checkbox" data-type="meal"></div>
            </td>
            <td>
              <div class="btn-select" data-type="days" data-value="{${defaultDaysConfig}}">
                  <div class="select-label">
                    <p class="current-choice"></p>
                  </div>
                  <ul class="select-list">
                    <li class="label"><p>${kd.label}</p></li>
                    ${listDate.map((date) => `<li class="choice active" data-choice="${date}"><div class="custom-checkbox"></div>${date}</li>`).join('')}
                  </ul>
                </div>
            </td>
          </tr> `
      }).join('');
      Swal.mixin({
        width: '50vw',
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Créer une configuration de repas`,
        html: `
            <div id="click-container" class="add-user-config-modal-container modal-container">
              <h2>${(userId && user) ? 'Invité de ' + user.civility + ' ' + user.lastname : guestLabel} (${nbGuests})</h2>
              <table class="table meal-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Repas</th>
                    <th>Jours actifs</th>
                  </tr>
                </thead>
                <tbody id="user-config-meal-list">
                  ${mealList}
                </tbody>
              </table>
              <div class="input-row">
                <p>Informations supplémentaires :</p>
                <input type="text" id="input-guest-info" class="btn-input w-1/3" placeholder="" />
              </div>
            </div> `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Retour',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('user-config-meal-list').addEventListener('click', (e) => {
            if (!(e.target.closest('tr') && e.target.closest('tr').dataset.meal == "true") && !(e.target.closest('div').dataset.type && e.target.closest('div').dataset.type == "meal")) return;
            if (e.target.closest('div').classList.contains('custom-checkbox') && e.target.closest('div').dataset.type) {
              const checkbox = e.target.closest('div');

              const type = checkbox.dataset.type;
              const tr = e.target.closest('tr');
              if (checkbox.classList.contains('active')) {
                checkbox.classList.remove('active');
                tr.dataset[type] = false;
              }
              else {
                checkbox.classList.add('active');
                tr.dataset[type] = true;
              }
            }
            else if (e.target.closest('li') && e.target.closest('li').classList.contains('choice')) {
              const tr = e.target.closest('tr');
              const li = e.target.closest('.choice');
              const select = li.closest('.btn-select');
              const current = JSON.parse(select.dataset.value.replaceAll("'", '"') ?? '{}');
              if (li.classList.contains('active')) {
                li.classList.remove('active');
                current[li.dataset.choice] = false;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              else {
                li.classList.add('active');
                current[li.dataset.choice] = true;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              const nbElement = Object.values(current).filter(v => v).length;
              switch (nbElement) {
                case 0:
                  tr.querySelector('.current-choice').textContent = 'Aucun jour';
                  break;
                case listDate.length:
                  tr.querySelector('.current-choice').textContent = 'Tous les jours';
                  break;

                default:
                  tr.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                  break;
              }
            }
            else if (e.target.closest('div.btn-select') && e.target.closest('div.btn-select').classList.contains('btn-select')) {
              if (!e.target.closest('ul.select-list')) {
                e.target.closest('div.btn-select').classList.toggle('active');
              }
            }
          });
          document.getElementById('user-config-meal-list').querySelectorAll('.btn-select').forEach((li) => {
            const current = JSON.parse(li.dataset.value.replaceAll("'", '"') ?? '{}');
            const nbElement = Object.values(current).filter(v => v).length;
            switch (nbElement) {
              case 0:
                li.querySelector('.current-choice').textContent = 'Aucun jour';
                break;
              case listDate.length:
                li.querySelector('.current-choice').textContent = 'Tous les jours';
                break;

              default:
                li.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                break;
            }
          });
          document.getElementById('input-guest-info').addEventListener('input', (e) => {
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById('click-container').addEventListener('click', (e) => {
            if ((e.target.closest('div.btn-select') && !e.target.closest('tr[data-meal="false"]')) || e.target.closest('ul.select-list')) return;
            document.querySelectorAll('div.btn-select').forEach((li) => {
              if (li.classList.contains('active')) {
                li.classList.remove('active');
              }
            });
          });
        },
        preConfirm: () => {
          const values = {
            entries: [],
            guestInfo: document.getElementById('input-guest-info').value,
          };

          document.getElementById('user-config-meal-list').querySelectorAll('tr').forEach(
            (tr) => {
              if (tr.dataset.id && tr.dataset.meal == "true") {
                const config = JSON.parse(tr.dataset.config.replaceAll("'", '"') ?? '{}');
                const trueDates = Object.entries(config)
                  .filter(([_, v]) => v == true)
                  .map(([dateStr]) => moment(dateStr, 'DD-MM-YYYY'))
                  .sort((a, b) => a - b);

                let start = null;
                let end = null;

                for (let i = 0; i < trueDates.length; i++) {
                  const current = trueDates[i];

                  if (!start) {
                    start = end = current;
                  } else {
                    if (current.diff(end, 'days') === 1) {
                      end = current;
                    } else {
                      values.entries.push({
                        idKindMeal: tr.dataset.id,
                        delivery: (tr.dataset.delivery == "true" || tr.dataset.delivery == 1),
                        dateStart: start.format('YYYY-MM-DD'),
                        dateEnd: end.format('YYYY-MM-DD'),
                      });
                      start = end = current;
                    }
                  }
                }

                if (start) {
                  values.entries.push({
                    idKindMeal: tr.dataset.id,
                    delivery: (tr.dataset.delivery == "true" || tr.dataset.delivery == 1),
                    dateStart: start.format('YYYY-MM-DD'),
                    dateEnd: end.format('YYYY-MM-DD'),
                  });
                }
              }
            }
          );
          if (!values.entries.length) {
            Swal.showValidationMessage(`Vous devez sélectionner au moins un repas.`);
          }
          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          socket.emit('add guest', {
            userId,
            nbGuests,
            label: guestLabel,
            info: data.value.guestInfo ?? '',
            isStaff,
            entries: data.value.entries
          });
        }
        if (data.isDismissed) {
          this.addGuestModal(userId, guestLabel, dateStart, dateEnd, nbGuests, isStaff);
        }
        // this.showUserModal(isStaff, userId);
      });
    },
    editGuestConfigModal(guestId) {
      const guest = state.guests.find(g => g.id == guestId);
      if (!guest) return;
      const dates = {
        first: guest.elements.find(e => guest.elements.every(el => moment(e.dateStart).isSameOrBefore(el.dateStart))).dateStart,
        last: guest.elements.find(e => guest.elements.every(el => moment(e.dateEnd).isSameOrAfter(el.dateEnd))).dateEnd,
      }
      const listDate = [];
      for (var m = moment(dates.first); m.diff(dates.last, 'days') <= 0; m.add(1, 'days')) {
        listDate.push(m.format('DD-MM-YYYY'));
      }
      const userGuest = guest.userId != null ? state.users.find(u => u.id == guest.userId) : null;
      const guestLabel = userGuest ? `Invité de ${userGuest.civility} ${userGuest.lastname}` : guest.label;

      const mealList = state.kindMeals.filter(kd => ((guest && guest.isStaff) || (userGuest && userGuest.isStaff)) ? kd.isStaff : kd.canGuest).map((kd) => {
        const current = guest.elements.filter(e => e.idKindMeal == kd.id);
        const daysConfig = listDate.map((date) => {
          if (current.find(c => moment(date, 'DD-MM-YYYY').isBetween(moment(c.dateStart), moment(c.dateEnd), 'days', '[]'))) {
            return `'${date}': true`;
          }
          return `'${date}': false`;
        }).join(',') ?? '';
        return `<tr data-id="${kd.id}" data-meal="false" data-delivery="false" data-config="{${daysConfig}}">
            <td>
              ${kd.label}
            </td>
            <td>
              <div class="custom-checkbox" data-type="meal"></div>
            </td>
            <td>
              <div class="btn-select" data-type="days" data-value="{${daysConfig}}">
                  <div class="select-label">
                    <p class="current-choice"></p>
                  </div>
                  <ul class="select-list">
                    <li class="label"><p>${kd.label}</p></li>
                    ${listDate.map((date) => `<li class="choice" data-choice="${date}"><div class="custom-checkbox"></div>${date}</li>`).join('')}
                  </ul>
                </div>
            </td>
          </tr> `
      }).join('');
      Swal.mixin({
        width: '50vw',
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Modifier la configuration d'invité`,
        html: `
            <div id="click-container" class="add-user-config-modal-container modal-container">
              <div class="trash-user-btn" id="trash-user-btn">${this.trashIcon}</div>
              <h2>${guestLabel} (${guest.nbGuests})</h2>
              <table class="table meal-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Repas</th>
                    <th>Jours actifs</th>
                  </tr>
                </thead>
                <tbody id="user-config-meal-list">
                  ${mealList}
                </tbody>
              </table>
              <div class="input-row">
                <p>Informations supplémentaires :</p>
                <input type="text" id="input-guest-info" class="btn-input w-1/3" value="${guest.info}" placeholder="" />
              </div>
            </div> `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Retour',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('user-config-meal-list').querySelectorAll('tr').forEach((tr) => {
            const config = JSON.parse(tr.dataset.config.replaceAll("'", '"') ?? '{}');

            if (Object.values(config).some(v => v == true)) {
              tr.dataset.meal = "true";
              tr.querySelector('div.custom-checkbox[data-type="meal"]').classList.add('active');
              tr.querySelectorAll('.choice').forEach((li) => {
                if (config[li.dataset.choice]) {
                  li.classList.add('active');
                }
              });
            }
          });
          document.getElementById('user-config-meal-list').addEventListener('click', (e) => {
            if (!(e.target.closest('tr').dataset.meal == "true") && !(e.target.closest('div').dataset.type && e.target.closest('div').dataset.type == "meal")) return;
            if (e.target.closest('div').classList.contains('custom-checkbox') && e.target.closest('div').dataset.type) {
              const checkbox = e.target.closest('div');

              const type = checkbox.dataset.type;
              const tr = e.target.closest('tr');
              if (checkbox.classList.contains('active')) {
                checkbox.classList.remove('active');
                tr.dataset[type] = false;
              }
              else {
                checkbox.classList.add('active');
                tr.dataset[type] = true;
              }
            }
            else if (e.target.closest('li') && e.target.closest('li').classList.contains('choice')) {
              const tr = e.target.closest('tr');
              const li = e.target.closest('.choice');
              const select = li.closest('.btn-select');
              const current = JSON.parse(select.dataset.value.replaceAll("'", '"') ?? '{}');
              if (li.classList.contains('active')) {
                li.classList.remove('active');
                current[li.dataset.choice] = false;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              else {
                li.classList.add('active');
                current[li.dataset.choice] = true;
                select.dataset.value = JSON.stringify(current);
                tr.dataset.config = JSON.stringify(current);
              }
              const nbElement = Object.values(current).filter(v => v).length;
              switch (nbElement) {
                case 0:
                  tr.querySelector('.current-choice').textContent = 'Aucun jour';
                  break;
                case listDate.length:
                  tr.querySelector('.current-choice').textContent = 'Tous les jours';
                  break;

                default:
                  tr.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                  break;
              }
            }
            else if (e.target.closest('div.btn-select') && e.target.closest('div.btn-select').classList.contains('btn-select')) {
              if (!e.target.closest('ul.select-list')) {
                e.target.closest('div.btn-select').classList.toggle('active');
              }
            }
          });
          document.getElementById('user-config-meal-list').querySelectorAll('.btn-select').forEach((li) => {
            const current = JSON.parse(li.dataset.value.replaceAll("'", '"') ?? '{}');
            const nbElement = Object.values(current).filter(v => v).length;
            switch (nbElement) {
              case 0:
                li.querySelector('.current-choice').textContent = 'Aucun jour';
                break;
              case listDate.length:
                li.querySelector('.current-choice').textContent = 'Tous les jours';
                break;

              default:
                li.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                break;
            }
          });
          document.getElementById('input-guest-info').addEventListener('input', (e) => {
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById('click-container').addEventListener('click', (e) => {
            if (e.target.closest('ul.select-list')) return;
            document.querySelectorAll('div.btn-select').forEach((li) => {
              if (li.classList.contains('active') && e.target.closest('div.btn-select') != li) {
                li.classList.remove('active');
              }
            });
          });
          document.getElementById('trash-user-btn').addEventListener('click', (e) => {
            Swal.clickDeny();
            this.deleteGuestModal(guestId);
          });
        },
        preConfirm: () => {
          const values = {
            entries: [],
            guestInfo: document.getElementById('input-guest-info').value,
          };

          document.getElementById('user-config-meal-list').querySelectorAll('tr').forEach(
            (tr) => {
              if (tr.dataset.id && tr.dataset.meal == "true") {
                const config = JSON.parse(tr.dataset.config.replaceAll("'", '"') ?? '{}');
                const trueDates = Object.entries(config)
                  .filter(([_, v]) => v == true)
                  .map(([dateStr]) => moment(dateStr, 'DD-MM-YYYY'))
                  .sort((a, b) => a - b);

                let start = null;
                let end = null;

                for (let i = 0; i < trueDates.length; i++) {
                  const current = trueDates[i];

                  if (!start) {
                    start = end = current;
                  } else {
                    if (current.diff(end, 'days') === 1) {
                      end = current;
                    } else {
                      values.entries.push({
                        idKindMeal: tr.dataset.id,
                        delivery: (tr.dataset.delivery == "true" || tr.dataset.delivery == 1),
                        dateStart: start.format('YYYY-MM-DD'),
                        dateEnd: end.format('YYYY-MM-DD'),
                      });
                      start = end = current;
                    }
                  }
                }

                if (start) {
                  values.entries.push({
                    idKindMeal: tr.dataset.id,
                    delivery: (tr.dataset.delivery == "true" || tr.dataset.delivery == 1),
                    dateStart: start.format('YYYY-MM-DD'),
                    dateEnd: end.format('YYYY-MM-DD'),
                  });
                }
              }
            }
          );
          if (!values.entries.length) {
            Swal.showValidationMessage(`Vous devez sélectionner au moins un repas.`);
          }
          values.adedEntries = values.entries.filter(c => !guest.elements.find(e => e.idKindMeal == c.idKindMeal && moment(e.dateStart).isSame(c.dateStart, 'days') && moment(e.dateEnd).isSame(c.dateEnd, 'days')));
          values.deletedEntries = guest.elements.filter(e => !values.entries.find(c => c.idKindMeal == e.idKindMeal && moment(e.dateStart).isSame(c.dateStart, 'days') && moment(e.dateEnd).isSame(c.dateEnd, 'days'))).map(e => e.id);

          if (values.adedEntries.length == 0 && values.deletedEntries.length == 0 && values.guestInfo == guest.info) {
            Swal.showValidationMessage(`Aucune modification n'a été effectuée.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.guestId = guestId;

          socket.emit('edit guest config', data.value);
        }
        if (!data.isDenied) {
          this.showHistoryModal();
        }
      });
    },
    addEventModal(userId, dateStart, dateEnd) {
      // get Filtered User List
      const userlist = util.getFilteredUsers(false).map((user) => {
        return `
          <li class="select-item" data-id="${user.id}">
            <p>${user.civility} <span class="filter">${user.lastname}</span></p>
          </li>
        `;
      }).join('');
      const currentUser = userId ? state.users.find(u => u.id == userId) : null;
      const nbDays = dateStart && dateEnd ? moment(dateEnd).diff(moment(dateStart)) / (1000 * 60 * 60 * 24) + 1 : null;
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Ajouter un événement`,
        html: `
          <div class="add-guest-modal-container modal-container">
            <div class="users-search-input">
              <input type="text" class="btn-input" id="search-users-label" data-id="${userId ?? 'null'}" value="${currentUser ? currentUser.civility + ' ' + currentUser.lastname : ''}" placeholder="Sélection du résident" />
              <div class="search-result">
                <ul id="update-users-list">
                  ${userlist}
                </ul>
              </div>
            </div>
            <div class="content-input">
              <div class="date-container">
                <h2>Date de début</h2>
                <input type="date" id="input-guest-date-start" value="${dateStart ?? ''}" class="btn-input" />
              </div>
              <div class="date-container">
                <h2>Date de fin</h2>
                <input type="date" id="input-guest-date-end" min="${dateStart ?? ''}" value="${dateEnd ?? ''}" class="btn-input" />
              </div>
              <p id="nb-selected-days" data-value="${nbDays ?? null}">${nbDays ? (nbDays + ' jour' + (nbDays > 1 ? 's' : '') + ' sélectionné' + (nbDays > 1 ? 's' : '')) : 'Aucun jour sélectionné'}</p>
            </div>
          </div>
        `,
        confirmButtonText: 'Confirmer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('update-users-list').addEventListener('update', () => {
            const list = document.getElementById('update-users-list');
            list.innerHTML = state.users.filter(u => u.isStaff == false).sort((a, b) => {
              if (a.lastname < b.lastname) return -1;
              if (a.lastname > b.lastname) return 1;
              return a.civility - b.civility;
            }).map((user) => {
              return `
              <li class="select-item" data-id="${user.id}">
                <p>${user.civility} <span class="filter">${user.lastname}</span></p>
              </li>
              `;
            }).join('');
          });
          document.getElementById('update-users-list').addEventListener('click', (e) => {
            if (e.target.closest('li')) {
              document.getElementById('search-users-label').value = e.target.closest('li').querySelector('p').textContent;
              document.getElementById('search-users-label').dataset.id = e.target.closest('li').dataset.id;
            }
          });
          document.getElementById('search-users-label').addEventListener('keydown', (e) => {
            if (e.target.dataset.id != "null") {
              e.target.value = "";
              e.target.dataset.id = null;
            }
          });
          document.getElementById('search-users-label').addEventListener('keyup', (e) => {
            const list = document.getElementById('update-users-list');
            const search = e.target.value.toLowerCase();
            list.querySelectorAll('li').forEach((li) => {
              const label = li.querySelector('p').textContent.toLowerCase();
              if (label.indexOf(search) == -1 && search.length != 0) {
                li.style.display = 'none';
              }
              else {
                li.style.display = 'flex';
              }
            });
          });
          document.getElementById('input-guest-date-start').addEventListener('change', (e) => {
            const dateEnd = document.getElementById('input-guest-date-end');
            if (e.target.value) {
              dateEnd.setAttribute('min', e.target.value);

              if (!dateEnd.value || moment(dateEnd.value).isBefore(e.target.value)) {
                dateEnd.value = e.target.value;
              }

              const nbDays = moment(document.getElementById('input-guest-date-end').value).diff(moment(e.target.value)) / (1000 * 60 * 60 * 24) + 1;
              const showNb = document.getElementById('nb-selected-days');
              showNb.textContent = `${nbDays} jour${nbDays > 1 ? 's' : ''} sélectionné${nbDays > 1 ? 's' : ''}`;
              showNb.dataset.value = nbDays;
            }
          });
          document.getElementById('input-guest-date-end').addEventListener('change', (e) => {
            const nbDays = moment(e.target.value).diff(moment(document.getElementById('input-guest-date-start').value)) / (1000 * 60 * 60 * 24) + 1;
            const showNb = document.getElementById('nb-selected-days');
            showNb.textContent = `${nbDays} jour${nbDays > 1 ? 's' : ''} sélectionné${nbDays > 1 ? 's' : ''}`;
            showNb.dataset.value = nbDays;
          });
        },
        preConfirm: () => {
          const values = {
            userId: document.getElementById("search-users-label").dataset.id,
            dateStart: document.getElementById("input-guest-date-start").value,
            dateEnd: document.getElementById("input-guest-date-end").value,
          };

          if (!values.userId || values.userId == "null") {
            Swal.showValidationMessage(`Vous devez sélectionner un résident.`);
          }
          if (!values.dateStart) {
            Swal.showValidationMessage(`La date de début est obligatoire.`);
          }
          if (!values.dateEnd) {
            Swal.showValidationMessage(`La date de fin est obligatoire.`);
          }
          if (values.dateStart && values.dateEnd && moment(values.dateStart).isAfter(values.dateEnd)) {
            Swal.showValidationMessage(`La date de début doit être avant la date de fin.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          this.addEventConfigModal(data.value.userId, data.value.dateStart, data.value.dateEnd);
        }
      });
    },
    addEventConfigModal(userId, dateStart, dateEnd) {
      const user = state.users.find(u => u.id == userId && u.isStaff == false);
      const listDate = [];
      for (var m = moment(dateStart); m.diff(dateEnd, 'days') <= 0; m.add(1, 'days')) {
        listDate.push(m.format('DD-MM-YYYY'));
      }
      const configsByDate = listDate.map((date) => {
        return {
          date,
          config: util.getConfigForDate(userId, date),
          events: util.getEventsForDate(userId, date),
        };
      });
      const mealList = state.kindMeals.map((kd) => {
        const currentDaysConfigMeal = {};
        const currentDaysConfigDelivery = {};

        configsByDate.map((cd) => {
          let mealIsActive = false;
          let deliveryIsActive = false;
          if (cd.config == null) {
            currentDaysConfigMeal[cd.date] = false;
            currentDaysConfigDelivery[cd.date] = false;
            return;
          }
          const dayElemConf = cd.config.elements.find((e) => e.idKindMeal == kd.id);
          const dayEvents = [];
          cd.events.forEach((ev) => {
            ev.elements.forEach((el) => {
              if (el.idKindMeal == kd.id && moment.utc(cd.date, "DD-MM-YYYY").isBetween(el.dateStart, el.dateEnd, 'day', '[]')) {
                dayEvents.push(el);
              }
            });
          });
          const day = moment.utc(cd.date, "DD-MM-YYYY").locale('en').format("dddd").toLowerCase();

          if (dayElemConf && dayElemConf[day]) {
            if (!(dayElemConf.publicHoliday == 0 && util.publicHolidayCheck(moment.utc(cd.date, "DD-MM-YYYY")))) {
              mealIsActive = true;
              if (dayElemConf.delivery) {
                deliveryIsActive = true;
              }
            }
          }
          dayEvents.forEach((ev) => {
            if (ev.isAbsence) {
              mealIsActive = false;
              deliveryIsActive = false;
            }
            else {
              mealIsActive = true;
              if (ev.delivery) {
                deliveryIsActive = true;
              }
            }
          });

          currentDaysConfigMeal[cd.date] = mealIsActive ? true : false;
          currentDaysConfigDelivery[cd.date] = deliveryIsActive ? true : false;
        });
        if (configsByDate.length < 2) {
          return `<tr data-id="${kd.id}" 
        data-dates="${JSON.stringify(listDate).replaceAll('"', "'")}"
        data-previous-meal="${JSON.stringify(currentDaysConfigMeal).replaceAll('"', "'")}"
        data-previous-delivery="${JSON.stringify(currentDaysConfigDelivery).replaceAll('"', "'")}" 
        data-meal="${JSON.stringify(currentDaysConfigMeal).replaceAll('"', "'")}" 
        data-delivery="${JSON.stringify(currentDaysConfigDelivery).replaceAll('"', "'")}">
            <td>
              ${kd.label}
            </td>
            <td>
              <div class="custom-checkbox ${currentDaysConfigMeal[listDate[0]] ? 'active' : ''}" data-type="meal"></div>
            </td>
            <td>
              <div class="custom-checkbox ${!kd.deliveryId ? 'disabled' : ''}" data-type="delivery"></div>
            </td>
          </tr> `;
        }
        else {
          return `<tr data-id="${kd.id}" 
        data-dates="${JSON.stringify(listDate).replaceAll('"', "'")}"
        data-previous-meal="${JSON.stringify(currentDaysConfigMeal).replaceAll('"', "'")}"
        data-previous-delivery="${JSON.stringify(currentDaysConfigDelivery).replaceAll('"', "'")}" 
        data-meal="${JSON.stringify(currentDaysConfigMeal).replaceAll('"', "'")}" 
        data-delivery="${JSON.stringify(currentDaysConfigDelivery).replaceAll('"', "'")}">
            <td>
              ${kd.label}
            </td>
            <td>
              <div class="custom-checkbox ${Object.values(currentDaysConfigMeal).find(c => c == true) ? 'active' : ''}" data-type="meal"></div>
            </td>
            <td>
              <div class="btn-select" data-type="meal" data-nb="${Object.values(currentDaysConfigMeal).filter(c => c == true).length}" data-value="${JSON.stringify(currentDaysConfigMeal).replaceAll('"', "'")}">
                <div class="select-label">
                  <p class="current-choice"></p>
                </div>
                <ul class="select-list">
                  <li class="label">
                    <svg class="select-all-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <p>Repas</p>
                    <svg class="remove-all-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </li>
                  <li class="label"><p>${kd.label}</p></li>
                  ${listDate.map((date) => `<li class="choice" data-choice="${date}"><div class="custom-checkbox"></div>${date}</li>`).join('')}
                </ul>
              </div>
            </td>
            <td>
              <div class="btn-select ${!kd.deliveryId ? 'not-delivery' : ''}" data-type="delivery" data-nb="${Object.values(currentDaysConfigDelivery).filter(c => c == true).length}" data-value="${JSON.stringify(currentDaysConfigDelivery).replaceAll('"', "'")}">
                <div class="select-label">
                  <p class="current-choice"></p>
                </div>
                <ul class="select-list">
                  <li class="label">
                    <svg class="select-all-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <p>Plateau</p>
                    <svg class="remove-all-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </li>
                  <li class="label"><p>${kd.label}</p></li>
                  ${listDate.map((date) => `<li class="choice disabled" data-choice="${date}"><div class="custom-checkbox"></div>${date}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr> `;
        }
      }).join('');
      Swal.mixin({
        width: '50vw',
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Modifier les repas de la sélection`,
        html: `
            <div id="click-container" class="add-user-config-modal-container modal-container">
              <h2>${user.civility} ${user.lastname} ${user.firstname}</h2>
              <table class="table meal-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Repas</th>
                    ${configsByDate.length > 1 ? `<th>Jours actifs</th>` : ''}
                    <th>Plateau</th>
                  </tr>
                </thead>
                <tbody id="user-config-meal-list">
                  ${mealList}
                </tbody>
              </table>
              <p class="font-semibold">${dateStart == dateEnd ? `${moment(dateStart).format('dddd D MMMM YYYY')}` : `Du ${moment(dateStart).format('DD-MM-YYYY')} au ${moment(dateEnd).format('DD-MM-YYYY')}`}</p>
            </div> `,
        confirmButtonText: 'Enregistrer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Retour',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          if (configsByDate.length < 2) {
            document.getElementById('user-config-meal-list').addEventListener('click', (e) => {
              const tr = e.target.closest('tr');
              const checkbox = e.target.closest('div');
              if (checkbox.classList.contains('custom-checkbox') && !checkbox.classList.contains('disabled')) {
                const type = checkbox.dataset.type;
                if (checkbox.classList.contains('active')) {
                  checkbox.classList.remove('active');
                  tr.dataset[type] = `{'${listDate[0]}':false}`;
                }
                else {
                  checkbox.classList.add('active');
                  tr.dataset[type] = `{'${listDate[0]}':true}`;
                }
              }
            });
          }
          else {
            document.getElementById('user-config-meal-list').addEventListener('click', (e) => {
              const tr = e.target.closest('tr');
              const mealSelect = tr.querySelector('div.btn-select[data-type="meal"]');
              const mealSelectValues = JSON.parse(mealSelect.dataset.value.replaceAll("'", '"') ?? '{}');
              const deliverySelect = tr.querySelector('div.btn-select[data-type="delivery"]');
              const deliverySelectValues = JSON.parse(deliverySelect.dataset.value.replaceAll("'", '"') ?? '{}');
              const mealCheckbox = tr.querySelector('div.custom-checkbox[data-type="meal"]');
              if (e.target.closest('svg')) {
                const select = e.target.closest('.btn-select');
                const type = select.dataset.type;
                const current = JSON.parse(select.dataset.value.replaceAll("'", '"') ?? '{}');
                if (e.target.closest('svg').classList.contains('select-all-btn')) {
                  Object.keys(current).forEach((key) => {
                    current[key] = (type == "delivery") ? (mealSelectValues[key] == true) : true;
                  });
                  select.dataset.value = JSON.stringify(current);
                  select.dataset.nb = Object.values(current).length;
                  tr.dataset[type] = JSON.stringify(current);
                  select.querySelectorAll('.choice:not(.disabled)').forEach((li) => {
                    li.classList.add('active');
                  });
                }
                else if (e.target.closest('svg').classList.contains('remove-all-btn')) {
                  Object.keys(current).forEach((key) => {
                    current[key] = false;
                  });
                  select.dataset.value = JSON.stringify(current);
                  select.dataset.nb = 0;
                  tr.dataset[type] = JSON.stringify(current);
                  select.querySelectorAll('.choice').forEach((li) => {
                    li.classList.remove('active');
                  });
                  if (type == "meal") {
                    Object.keys(deliverySelectValues).forEach((key) => {
                      deliverySelectValues[key] = false;
                      deliverySelect.querySelector(`li[data-choice="${key}"]`).classList.remove('active');
                    });
                    deliverySelect.dataset.value = JSON.stringify(deliverySelectValues);
                  }
                }
              }
              else if (e.target.closest('li') && e.target.closest('li').classList.contains('choice')) {
                const li = e.target.closest('.choice');
                const select = li.closest('.btn-select');
                const current = JSON.parse(select.dataset.value.replaceAll("'", '"') ?? '{}');
                if (select.dataset.type == "delivery") {
                  if (mealSelect[li.dataset.choice] == false) {
                    return;
                  }
                }
                else if (select.dataset.type == "meal") {
                  if (current[li.dataset.choice] == true) {
                    deliverySelect.querySelector(`li[data-choice="${li.dataset.choice}"]`).classList.remove('active');
                    deliverySelectValues[li.dataset.choice] = false;
                    deliverySelect.dataset.value = JSON.stringify(deliverySelectValues);
                  }
                }
                if (li.classList.contains('active')) {
                  li.classList.remove('active');
                  current[li.dataset.choice] = false;
                  select.dataset.value = JSON.stringify(current);
                  tr.dataset[select.dataset.type] = JSON.stringify(current);
                }
                else {
                  li.classList.add('active');
                  current[li.dataset.choice] = true;
                  select.dataset.value = JSON.stringify(current);
                  tr.dataset[select.dataset.type] = JSON.stringify(current);
                }
              }
              else if (e.target.closest('div.btn-select')) {
                if ((e.target.closest('div.btn-select') != deliverySelect) || (mealSelect && (mealSelect.dataset.nb != "0"))) {
                  if (e.target.closest('div.btn-select') == deliverySelect) {
                    deliverySelect.querySelectorAll('.choice').forEach((li) => {
                      if (mealSelectValues[li.dataset.choice] == false) {
                        li.classList.add('disabled');
                      }
                      else {
                        li.classList.remove('disabled');
                      }
                    });
                  }
                  if (!e.target.closest('ul.select-list')) {
                    e.target.closest('div.btn-select').classList.toggle('active');
                  }
                }
              }
              else if (e.target.closest('div.custom-checkbox') && !e.target.closest('div.custom-checkbox').classList.contains('disabled')) {
                if (mealCheckbox.classList.contains('active')) {
                  mealCheckbox.classList.remove('active');
                  Object.keys(mealSelectValues).forEach((key) => {
                    mealSelectValues[key] = false;
                  });
                  mealSelect.dataset.value = JSON.stringify(mealSelectValues);
                  mealSelect.dataset.nb = 0;
                  tr.dataset.meal = JSON.stringify(mealSelectValues);
                  mealSelect.querySelectorAll('.choice').forEach((li) => {
                    li.classList.remove('active');
                  });

                  Object.keys(deliverySelectValues).forEach((key) => {
                    deliverySelectValues[key] = false;
                    deliverySelect.querySelector(`li[data-choice="${key}"]`).classList.remove('active');
                  });
                  deliverySelect.dataset.value = JSON.stringify(deliverySelectValues);
                }
                else {
                  mealCheckbox.classList.add('active');
                  Object.keys(mealSelectValues).forEach((key) => {
                    mealSelectValues[key] = true;
                  });
                  mealSelect.dataset.value = JSON.stringify(mealSelectValues);
                  mealSelect.dataset.nb = Object.values(mealSelectValues).length;
                  tr.dataset.meal = JSON.stringify(mealSelectValues);
                  mealSelect.querySelectorAll('.choice').forEach((li) => {
                    li.classList.add('active');
                  });
                  mealSelect.classList.add('active');
                }
              }
              if (deliverySelect) {
                const deliverySelectValues = JSON.parse(deliverySelect.dataset.value.replaceAll("'", '"') ?? '{}');
                const nbElement = Object.values(deliverySelectValues).filter(v => v == true).length;
                switch (nbElement) {
                  case 0:
                    deliverySelect.querySelector('.current-choice').textContent = 'Aucun jour';
                    break;
                  case Object.values(deliverySelectValues).length:
                    deliverySelect.querySelector('.current-choice').textContent = 'Tous les jours';
                    break;

                  default:
                    deliverySelect.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                    break;
                }
                deliverySelect.dataset.nb = nbElement;
              }
              if (mealSelect) {
                const mealSelectValues = JSON.parse(mealSelect.dataset.value.replaceAll("'", '"') ?? '{}');
                const nbElement = Object.values(mealSelectValues).filter(v => v == true).length;
                switch (nbElement) {
                  case 0:
                    mealSelect.querySelector('.current-choice').textContent = 'Aucun jour';
                    break;
                  case Object.values(mealSelectValues).length:
                    mealSelect.querySelector('.current-choice').textContent = 'Tous les jours';
                    break;

                  default:
                    mealSelect.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                    break;
                }
                mealSelect.dataset.nb = nbElement;
                mealCheckbox.classList.toggle('active', nbElement > 0);
              }
            });
            document.getElementById('click-container').addEventListener('click', (e) => {
              if (e.target.closest('ul.select-list')) return;
              const clickItem = e.target.closest('div.custom-checkbox.active') ? e.target.closest('tr').querySelector('div.btn-select[data-type="meal"]') : e.target.closest('div.btn-select');

              document.querySelectorAll('div.btn-select').forEach((li) => {
                if (li.classList.contains('active') && clickItem != li) {
                  li.classList.remove('active');
                }
              });
            });
          }

          document.getElementById('user-config-meal-list').querySelectorAll('.btn-select').forEach((select) => {
            const current = JSON.parse(select.dataset.value.replaceAll("'", '"') ?? '{}');
            select.querySelectorAll('.choice').forEach((li) => {
              if (current[li.dataset.choice] == true || current[li.dataset.choice]) {
                li.classList.add('active');
              }
              else {
                li.classList.remove('active');
              }
            });
            const nbElement = Object.values(current).filter(v => v == true).length;
            switch (nbElement) {
              case 0:
                select.querySelector('.current-choice').textContent = 'Aucun jour';
                break;
              case listDate.length:
                select.querySelector('.current-choice').textContent = 'Tous les jours';
                break;

              default:
                select.querySelector('.current-choice').textContent = `${nbElement} jour${nbElement > 1 ? 's' : ''} `;
                break;
            }
          });
        },
        preConfirm: () => {
          const values = {
            entries: [],
          };

          document.getElementById('user-config-meal-list').querySelectorAll('tr').forEach(
            (tr) => {
              const currentEntries = [];
              const listDates = JSON.parse(tr.dataset.dates.replaceAll("'", '"') ?? '[]');
              const previous = {
                meal: JSON.parse(tr.dataset.previousMeal.replaceAll("'", '"') ?? '{}'),
                delivery: JSON.parse(tr.dataset.previousDelivery.replaceAll("'", '"') ?? '{}'),
              };
              const data = {
                meal: JSON.parse(tr.dataset.meal.replaceAll("'", '"') ?? '{}'),
                delivery: JSON.parse(tr.dataset.delivery.replaceAll("'", '"') ?? '{}'),
              };
              listDates.forEach((dateStr) => {
                if (data.meal[dateStr] == true) {
                  if (previous.meal[dateStr] == false) {
                    currentEntries.push({
                      idKindMeal: tr.dataset.id,
                      delivery: data.delivery[dateStr] == true,
                      dateStart: moment(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                      dateEnd: moment(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                      isAbsence: false,
                    });
                  }
                  else if (previous.delivery[dateStr] == false && data.delivery[dateStr] == true) {
                    currentEntries.push({
                      idKindMeal: tr.dataset.id,
                      delivery: true,
                      dateStart: moment(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                      dateEnd: moment(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                      isAbsence: false,
                    });
                  }
                }
                else if (previous.meal[dateStr] == true) {
                  currentEntries.push({
                    idKindMeal: tr.dataset.id,
                    delivery: false,
                    dateStart: moment(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    dateEnd: moment(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    isAbsence: true,
                  });
                }
              });
              if (currentEntries.length) {
                currentEntries.sort((a, b) => moment(a.dateStart).diff(moment(b.dateStart)));

                // Étape 2 : grouper
                const grouped = [];
                currentEntries.forEach(item => {
                  const last = grouped[grouped.length - 1];

                  if (
                    last &&
                    last.idKindMeal === item.idKindMeal &&
                    last.isAbsence === item.isAbsence &&
                    last.delivery === item.delivery &&
                    moment(item.dateStart).isSame(moment(last.dateEnd).add(1, 'day'), 'day')
                  ) {
                    last.dateEnd = item.dateEnd;
                  } else {
                    grouped.push({ ...item });
                  }
                });
                values.entries.push(...grouped);
              }
            }
          );
          if (!values.entries.length) {
            Swal.showValidationMessage(`Aucun changement repéré`);
          }
          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          socket.emit('add user event', {
            userId,
            entries: data.value.entries
          });
        }
        if (data.isDismissed) {
          this.addEventModal(userId, dateStart, dateEnd);
        }
      });
    },
    deleteEventModal(event) {
      const user = state.users.find(u => u.id == event.userId);
      if (!user) return;
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Supprimer un enregistrement`,
        html: `
            <div class="delete-event-modal-container modal-container">
              <h2 class="font-medium">${user.civility} ${user.lastname} ${user.firstname}</h2>
              <h2>Vous allez supprimer ${event.elements.length > 1 ? 'les modifications suivantes' : 'la modification suivante'} :</h2>
              <ul class="event-container">
                ${event.elements.map(e => `
                  <li data-id="${e.id}">
                    <p>
                      <strong class="${e.isAbsence ? 'text-red-600' : 'text-green-600'}">${e.isAbsence ? '(Absence)' : e.delivery ? '(Repas + Plateau)' : '(Repas)'}</strong>
                    ${e.dateStart == e.dateEnd ? `Le ${moment(e.dateStart).format('DD-MM-YYYY')}` : `Du ${moment(e.dateStart).format('DD-MM-YYYY')} au ${moment(e.dateEnd).format('DD-MM-YYYY')}`}
                    [ ${state.kindMeals.find(kd => kd.id == e.idKindMeal).label} ]
                    </p>
                  </li>
                `).join('')}
              </ul>
              <p class="warning-label">Cette action est irréversible.</p>
            </div>
        `,
        confirmButtonText: 'Confirmer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
      }).then((data) => {
        if (data.isConfirmed) {
          socket.emit('delete user event meal', event.id);
        }
        this.showHistoryModal();
      });
    },
    deleteGuestModal(guestId) {
      const guest = state.guests.find(g => g.id == guestId);
      if (!guest) return;
      const userGuest = guest.userId != null ? state.users.find(u => u.id == guest.userId) : null;
      const guestLabel = userGuest ? `${userGuest.civility} ${userGuest.lastname}` : guest.label;
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Supprimer un invité`,
        html: `
            <div class="delete-event-modal-container modal-container">
              <h2 class="font-medium"><strong>${guest.nbGuests}</strong> ${guest.nbGuests > 1 ? `Invités` : `Invité`} - ${guestLabel}</h2>
              <h2>Vous allez supprimer ${guest.elements.length > 1 ? 'les modifications suivantes' : 'la modification suivante'} :</h2>
              <ul class="event-container">
                ${guest.elements.map(e => `
                  <li data-id="${e.id}">
                    <p>
                      <strong class="text-green-600">(Repas)</strong>
                    ${e.dateStart == e.dateEnd ? `Le ${moment(e.dateStart).format('DD-MM-YYYY')}` : `Du ${moment(e.dateStart).format('DD-MM-YYYY')} au ${moment(e.dateEnd).format('DD-MM-YYYY')}`}
                    [ ${state.kindMeals.find(kd => kd.id == e.idKindMeal).label} ]
                    </p>
                  </li>
                `).join('')}
              </ul>
              <p class="warning-label">Cette action est irréversible.</p>
            </div>
        `,
        confirmButtonText: 'Confirmer',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
      }).then((data) => {
        if (data.isConfirmed) {
          socket.emit('delete guest', guest.id);
        }
        setTimeout(() => {
          this.showHistoryModal();
        }, 100);
      });
    },
    showHistoryModal(resetData = false) {
      if (resetData) {
        this.historyFilterData = {
          search: '',
          filter: 'all',
          dateStart: null,
          dateEnd: null
        };
      }
      const eventlist = state.userEvents.map((event) => {
        const user = state.users.find(u => u.id == event.userId);
        const listDate = [];
        event.elements.forEach((e) => {
          for (var m = moment(e.dateStart); m.diff(e.dateEnd, 'days') <= 0; m.add(1, 'days')) {
            const dateStr = m.format('DD-MM-YYYY');
            if (!listDate.includes(dateStr)) {
              listDate.push(dateStr);
            }
          }
        });
        return {
          created: event.created,
          html: `
          <li data-id="${event.id}" data-type="event" data-dates="${listDate}">
            <p title="${moment(event.created).format("DD-MM-YYYY | HH:mm:ss")}">
              <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              ${user.civility} <span class="px-1 filter">${user.lastname}</span> [${event.elements.length}]
              <span class="absolute right-14 italic">${moment(event.created).calendar()}</span>
              <span class="absolute right-4 icon trash" title="Supprimer">${this.trashIcon}</span>
            </p>
            <ul>
              ${event.elements.map(e => `
                <li data-id="${e.id}">
                  <p>
                    <strong>${e.isAbsence ? '(Absence)' : e.delivery ? '(Repas + Plateau)' : '(Repas)'}</strong>
                    ${e.dateStart == e.dateEnd ? `Le ${moment(e.dateStart).format('DD-MM-YYYY')}` : `Du ${moment(e.dateStart).format('DD-MM-YYYY')} au ${moment(e.dateEnd).format('DD-MM-YYYY')}`}
                    [ ${state.kindMeals.find(kd => kd.id == e.idKindMeal).label} ]
                  </p>
                </li>
              `).join('')}
            </ul>
          </li>
        `};
      });
      const guestlist = state.guests.map((guest) => {
        const userGuest = guest.userId != null ? state.users.find(u => u.id == guest.userId) : null;
        const guestLabel = userGuest ? `${userGuest.civility} ${userGuest.lastname}` : guest.label;
        const listDate = [];
        guest.elements.forEach((e) => {
          for (var m = moment(e.dateStart); m.diff(e.dateEnd, 'days') <= 0; m.add(1, 'days')) {
            const dateStr = m.format('DD-MM-YYYY');
            if (!listDate.includes(dateStr)) {
              listDate.push(dateStr);
            }
          }
        });
        return {
          created: guest.created,
          html: `
          <li data-id="${guest.id}" data-type="guest" data-dates="${listDate}">
            <p title="${moment(guest.created).format("DD-MM-YYYY | HH:mm:ss")}">
              <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <strong class="pr-1">${guest.nbGuests}</strong> ${guest.nbGuests > 1 ? `Invités` : `Invité`} - <span class="px-1 filter">${guestLabel}</span> [${guest.elements.length}]
              <span class="absolute right-14 italic">${moment(guest.created).calendar()}</span>
              <span class="absolute right-4 icon edit" title="Modifier">${this.editIcon}</span>
            </p>
            <ul>
              ${guest.elements.map(e => `
                <li data-id="${e.id}">
                  <p>
                    ${e.dateStart == e.dateEnd ? `Le ${moment(e.dateStart).format('DD-MM-YYYY')}` : `Du ${moment(e.dateStart).format('DD-MM-YYYY')} au ${moment(e.dateEnd).format('DD-MM-YYYY')}`}
                    [ ${state.kindMeals.find(kd => kd.id == e.idKindMeal).label} ]
                  </p>
                </li>
              `).join('')}
            </ul>
          </li>
        `};
      });
      const sortedList = ([...guestlist, ...eventlist]).sort((a, b) => moment(a.created).isBefore(moment(b.created)) ? 1 : -1);

      Swal.mixin({
        width: '50rem',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: `Historique des modifications`,
        html: `
            <div class="history-modal-container modal-container">
              <div class="triple-switch" data-value="${this.historyFilterData.filter}" id="history-switch">
                <button class="btn-switch-choice" data-option="all">Tout</button>
                <button class="btn-switch-choice" data-option="event">Événements</button>
                <button class="btn-switch-choice" data-option="guest">Invités</button>
                <span class="btn-element"></span>
              </div>
              <div class="default-list-container">
                <input type="text" id="input-search-list" class="btn-input btn-search" value="${this.historyFilterData.search}" placeholder="Rechercher par nom" />
                <ul class="default-list history-list update-user-events-list update-guests-list" id="update-user-guest-events-list">
                  ${sortedList.map(e => e.html).join('')}
                </ul>
              </div>
              <div class="content-input">
                <h1>Période de recherche :</h1>
                <div class="date-container">
                  <h2>Date de début</h2>
                  <input type="date" id="input-search-date-start" max="${this.historyFilterData.dateEnd ? moment(this.historyFilterData.dateEnd).format('YYYY-MM-DD') : null}" value="${this.historyFilterData.dateStart ? moment(this.historyFilterData.dateStart).format('YYYY-MM-DD') : null}" class="btn-input">
                </div>
                <div class="date-container">
                  <h2>Date de fin</h2>
                  <input type="date" id="input-search-date-end" min="${this.historyFilterData.dateStart ? moment(this.historyFilterData.dateStart).format('YYYY-MM-DD') : null}" value="${this.historyFilterData.dateEnd ? moment(this.historyFilterData.dateEnd).format('YYYY-MM-DD') : null}" class="btn-input">
                </div>
              </div>
            </div>
        `,
        confirmButtonText: 'Fermer',
        focusConfirm: false,
        showDenyButton: false,
        willOpen: () => {
          function updateList(historyFilterData) {
            document.getElementById('update-user-guest-events-list').querySelectorAll(':scope > li').forEach((li) => {
              const label = li.querySelector('.filter').textContent.toLowerCase();
              const type = li.dataset.type;
              let display = true;

              if (historyFilterData.filter != 'all' && type != historyFilterData.filter) {
                display = false;
              }

              if (label.indexOf(historyFilterData.search) == -1 && historyFilterData.search.length != 0) {
                display = false;
              }

              const eventDates = li.dataset.dates.split(',');
              if (historyFilterData.dateStart && historyFilterData.dateEnd) {
                let isInRange = false;
                eventDates.forEach((d) => {
                  const mDate = moment(d, 'DD-MM-YYYY');
                  if (mDate.isBetween(moment(historyFilterData.dateStart), moment(historyFilterData.dateEnd), 'days', '[]')) {
                    isInRange = true;
                  }
                });
                if (!isInRange) {
                  display = false;
                }
              }
              else if (historyFilterData.dateStart) {
                let isInRange = false;
                eventDates.forEach((d) => {
                  const mDate = moment(d, 'DD-MM-YYYY');
                  if (mDate.isSameOrAfter(moment(historyFilterData.dateStart), 'days')) {
                    isInRange = true;
                  }
                });
                if (!isInRange) {
                  display = false;
                }
              }
              else if (historyFilterData.dateEnd) {
                let isInRange = false;
                eventDates.forEach((d) => {
                  const mDate = moment(d, 'DD-MM-YYYY');
                  if (mDate.isSameOrBefore(moment(historyFilterData.dateEnd), 'days')) {
                    isInRange = true;
                  }
                });
                if (!isInRange) {
                  display = false;
                }
              }

              li.style.display = display ? 'flex' : 'none';
            });
          }
          function getCurrentConfig() {
            return {
              search: document.getElementById('input-search-list').value.toLowerCase(),
              filter: document.getElementById('history-switch').dataset.value,
              dateStart: document.getElementById('input-search-date-start').value,
              dateEnd: document.getElementById('input-search-date-end').value,
            };
          }
          updateList(this.historyFilterData);

          document.querySelectorAll('#history-switch .btn-switch-choice').forEach((btn) => {
            if (btn.dataset.option == this.historyFilterData.filter) {
              btn.classList.add('active');
            }
          });
          document.getElementById('update-user-guest-events-list').addEventListener('click', (e) => {
            if (e.target.closest('span.trash') || e.target.closest('span.edit')) {
              const type = e.target.closest('li[data-id]').dataset.type;
              const eventId = e.target.closest('li[data-id]').dataset.id;
              if (e.target.closest('span').classList.contains('trash') && type == 'event') {
                const event = state.userEvents.find(ev => ev.id == eventId);
                Swal.close();
                this.deleteEventModal(event);
              }
              else if (e.target.closest('span').classList.contains('edit') && type == 'guest') {
                Swal.close();
                this.editGuestConfigModal(eventId);
              }
              return;
            }
            if (e.target.closest('ul').classList.contains('history-list')) {
              if (e.target.closest('li').classList.contains('active')) {
                e.target.closest('li').classList.remove('active');
                e.target.closest('li').style.height = `3.25rem`;
              }
              else {
                e.target.closest('li').classList.add('active');
                if (e.target.closest('li').getElementsByTagName('ul').length) {
                  e.target.closest('li').style.height = `${3 * (e.target.closest('li').getElementsByTagName('ul')[0].querySelectorAll('li').length + 1) + 0.25}rem`;
                }
              }
            }
          });
          document.getElementById('update-user-guest-events-list').addEventListener('update', () => {
            const newEventlist = state.userEvents.map((event) => {
              const user = state.users.find(u => u.id == event.userId);
              const listDate = [];
              event.elements.forEach((e) => {
                for (var m = moment(e.dateStart); m.diff(e.dateEnd, 'days') <= 0; m.add(1, 'days')) {
                  const dateStr = m.format('DD-MM-YYYY');
                  if (!listDate.includes(dateStr)) {
                    listDate.push(dateStr);
                  }
                }
              });
              return {
                created: event.created,
                html: `
          <li data-id="${event.id}" data-type="event" data-dates="${listDate}">
            <p title="${moment(event.created).format("DD-MM-YYYY | HH:mm:ss")}">
              <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              ${user.civility} <span class="px-1 filter">${user.lastname}</span> [${event.elements.length}]
              <span class="absolute right-14 italic">${moment(event.created).calendar()}</span>
              <span class="absolute right-4 icon trash" title="Supprimer">${this.trashIcon}</span>
            </p>
            <ul>
              ${event.elements.map(e => `
                <li data-id="${e.id}">
                  <p>
                    <strong>${e.isAbsence ? '(Absence)' : e.delivery ? '(Repas + Plateau)' : '(Repas)'}</strong>
                    ${e.dateStart == e.dateEnd ? `Le ${moment(e.dateStart).format('DD-MM-YYYY')}` : `Du ${moment(e.dateStart).format('DD-MM-YYYY')} au ${moment(e.dateEnd).format('DD-MM-YYYY')}`}
                    [ ${state.kindMeals.find(kd => kd.id == e.idKindMeal).label} ]
                  </p>
                </li>
              `).join('')}
            </ul>
          </li>
        `};
            });
            const newGuestlist = state.guests.map((guest) => {
              const userGuest = guest.userId != null ? state.users.find(u => u.id == guest.userId) : null;
              const guestLabel = userGuest ? `${userGuest.civility} ${userGuest.lastname}` : guest.label;
              const listDate = [];
              guest.elements.forEach((e) => {
                for (var m = moment(e.dateStart); m.diff(e.dateEnd, 'days') <= 0; m.add(1, 'days')) {
                  const dateStr = m.format('DD-MM-YYYY');
                  if (!listDate.includes(dateStr)) {
                    listDate.push(dateStr);
                  }
                }
              });
              return {
                created: guest.created,
                html: `
          <li data-id="${guest.id}" data-type="guest" data-dates="${listDate}">
            <p title="${moment(guest.created).format("DD-MM-YYYY | HH:mm:ss")}">
              <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <strong class="pr-1">${guest.nbGuests}</strong> ${guest.nbGuests > 1 ? `Invités` : `Invité`} - <span class="px-1 filter">${guestLabel}</span> [${guest.elements.length}]
              <span class="absolute right-14 italic">${moment(guest.created).calendar()}</span>
              <span class="absolute right-4 icon edit" title="Modifier">${this.editIcon}</span>
            </p>
            <ul>
              ${guest.elements.map(e => `
                <li data-id="${e.id}">
                  <p>
                    ${e.dateStart == e.dateEnd ? `Le ${moment(e.dateStart).format('DD-MM-YYYY')}` : `Du ${moment(e.dateStart).format('DD-MM-YYYY')} au ${moment(e.dateEnd).format('DD-MM-YYYY')}`}
                    [ ${state.kindMeals.find(kd => kd.id == e.idKindMeal).label} ]
                  </p>
                </li>
              `).join('')}
            </ul>
          </li>
        `};
            });
            const newSortedList = ([...newEventlist, ...newGuestlist]).sort((a, b) => moment(a.created).isBefore(moment(b.created)) ? 1 : -1);
            document.getElementById('update-user-guest-events-list').innerHTML = newSortedList.map((e) => e.html).join('');
            this.historyFilterData = getCurrentConfig();
            updateList(this.historyFilterData);
          });
          document.getElementById('input-search-list').addEventListener('input', (e) => {
            this.historyFilterData = getCurrentConfig();
            updateList(this.historyFilterData);
          });
          document.getElementById('input-search-date-start').addEventListener('change', (e) => {
            const dateStart = e.target.value;
            document.getElementById('input-search-date-end').setAttribute('min', dateStart);
            this.historyFilterData = getCurrentConfig();
            updateList(this.historyFilterData);
          });
          document.getElementById('input-search-date-end').addEventListener('change', (e) => {
            const dateEnd = e.target.value;
            document.getElementById('input-search-date-start').setAttribute('max', dateEnd);
            this.historyFilterData = getCurrentConfig();
            updateList(this.historyFilterData);
          });
          document.getElementById('history-switch').addEventListener('click', (e) => {
            if (e.target.closest('button') && e.target.closest('button').classList.contains('btn-switch-choice')) {
              document.getElementById('history-switch').querySelectorAll('.btn-switch-choice').forEach((btn) => {
                btn.classList.remove('active');
              });
              e.target.closest('button').classList.add('active');
              e.target.closest('#history-switch').dataset.value = e.target.closest('button').dataset.option;
              this.historyFilterData = getCurrentConfig();
              updateList(this.historyFilterData);
            }
          });
        },
      });
    },
    openExportModal() {
      Swal.fire({
        title: 'Exporter',
        showCancelButton: false,
        confirmButtonText: 'Fermer',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false,
        html: `
            <div class="export-modal-container modal-container">
              <div class="double-switch" data-value="days" id="period-switch">
                <button class="btn-switch-choice active" data-option="days">Jours</button>
                <button class="btn-switch-choice" data-option="months">Mois</button>
                <span class="btn-element"></span>
              </div>
              <div class="export-list">
                <button class="export-btn" id="left-btn-date">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div class="btn-list-container" id="export-btn-list" data-value="${moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(1, 'days').format('DD-MM-YYYY')}">
                </div>
                <button class="export-btn right" id="right-btn-date">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
            `,
        willOpen: () => {
          function updateList() {
            document.getElementById('export-btn-list').classList.remove('active');
            const periodValue = document.getElementById('period-switch').dataset.value;
            const dateValue = document.getElementById('export-btn-list').dataset.value;
            const format = document.getElementById('period-switch').dataset.value == 'days' ? 'dddd D MMMM' : 'MMMM YYYY';
            const date = moment(dateValue, 'DD-MM-YYYY');
            const listDates = [moment(date), moment(date.add(1, periodValue)), moment(date.add(1, periodValue))];
            document.getElementById('export-btn-list').innerHTML = listDates.map(d => `
              <button class="btn btn-default" data-date="${d.format('DD-MM-YYYY')}">${d.format(format)}</button>
            `).join('');
            setTimeout(() => {
              document.getElementById('export-btn-list').classList.add('active');
            }, 100);
          }
          updateList();
          document.getElementById('period-switch').addEventListener('click', (e) => {
            if (e.target.closest('button') && e.target.closest('button').classList.contains('btn-switch-choice')) {
              if (e.target.closest('button').classList.contains('active')) {
                return;
              }
              document.getElementById('period-switch').querySelectorAll('.btn-switch-choice').forEach((btn) => {
                btn.classList.remove('active');
              });
              e.target.closest('button').classList.add('active');
              e.target.closest('#period-switch').dataset.value = e.target.closest('button').dataset.option;
              if (e.target.closest('button').dataset.option == 'days') {
                document.getElementById('export-btn-list').dataset.value = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(1, 'days').format('DD-MM-YYYY');
              }
              else {
                document.getElementById('export-btn-list').dataset.value = moment().subtract(1, 'months').set({ date: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).format('DD-MM-YYYY');
              }
              updateList();
            }
          });
          document.getElementById('left-btn-date').addEventListener('click', () => {
            const periodValue = document.getElementById('period-switch').dataset.value;
            const dateValue = document.getElementById('export-btn-list').dataset.value;
            const newDate = moment(dateValue, 'DD-MM-YYYY').subtract(3, periodValue);
            document.getElementById('export-btn-list').dataset.value = newDate.format('DD-MM-YYYY');
            updateList();
          });
          document.getElementById('right-btn-date').addEventListener('click', () => {
            const periodValue = document.getElementById('period-switch').dataset.value;
            const dateValue = document.getElementById('export-btn-list').dataset.value;
            const newDate = moment(dateValue, 'DD-MM-YYYY').add(3, periodValue);
            document.getElementById('export-btn-list').dataset.value = newDate.format('DD-MM-YYYY');
            updateList();
          });
          document.getElementById('export-btn-list').addEventListener('click', (e) => {
            if (e.target.closest('button') && e.target.closest('button').classList.contains('btn')) {
              const dateData = e.target.closest('button').dataset.date;
              const periodValue = document.getElementById('period-switch').dataset.value;
              const dateValue = (periodValue == 'months') ? dateData.replace('01-', '') : dateData;

              window.open(`/export-meals/${periodValue}/${dateValue}`, '_blank');
            }
          });
        },
      });
    },
    getUserConfigMeal(userId, kindMealId) {
      const config = util.getConfigForDate(userId, moment(this.date).format('DD-MM-YYYY'));
      if (config && config.elements.find(el => el.idKindMeal == kindMealId)) {
        return config.elements.find(el => el.idKindMeal == kindMealId)[moment(this.date).format('dddd').toLowerCase()];
      }
      return false;
    },
    getUserConfigDelivery(userId, kindMealId) {
      const config = state.userMealConfigs.find(c => c.userId == userId && c.elements.find(el => el.idKindMeal == kindMealId));
      if (config) {
        return config.elements.find(el => el.idKindMeal == kindMealId).delivery;
      }
      return false;
    },
  },
  computed: {
    getAllKindMeal() {
      return util.getAllKindMeal(this.isStaffMealView, this.date)
    },
    getAllUserWithData() {
      return util.getAllUserWithData(this.isStaffMealView, this.date);
    },
    getDayDate() {
      return moment(this.date).format('dddd D MMMM YYYY');
    }
  }
};
</script>

<template>
  <div class="general-container meal-container">
    <h1>Repas - {{ getDayDate }}</h1>
    <div class="btn-container">
      <button class="btn btn-setting" @click="configModal">
        <IconSetting />
      </button>
      <label for="btn-switch-view" class="btn-switch">
        <input id="btn-switch-view" type="checkbox" v-model="isStaffMealView" />
        <span class="slider"></span>
        <span class="choice" :class="{ 'active': !isStaffMealView }">Résidents</span>
        <span class="choice" :class="{ 'active': isStaffMealView }">Personnels</span>
      </label>
    </div>
    <div class="btn-container right">
      <button class="btn" @click="openExportModal">Exporter</button>
    </div>
    <Meals :isStaffMealView="isStaffMealView" :date="date" :kindMeals="getAllKindMeal"
      :usersWithData="getAllUserWithData" />
    <div class="general-footer">
      <div class="btn-left-container">
        <button class="btn" @click="addEventModal()">Événement</button>
        <button class="btn" @click="addGuestModal()">Invité</button>
      </div>
      <div class="general-form-date">
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
      <div class="btn-right-container">
        <button class="btn" @click="showHistoryModal(true)">Historique</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
