<script>
import Swal from "sweetalert2";
import moment from 'moment';
import { socket, state } from "@/socket";
import IconMinus from "@/components/icons/IconMinus.vue";
import IconPlus from "@/components/icons/IconPlus.vue";
import IconEdit from "@/components/icons/IconEdit.vue";
import IconImg from "@/components/icons/IconImg.vue";
import IconPaint from "@/components/icons/IconPaint.vue";
import Planning from "@/components/Planning.vue";
import PlanningWeek from "@/components/PlanningWeek.vue";
import ImgEdit from "@/components/ImgEdit.vue";
import DayContainer from "@/components/DayContainer.vue";

export default {
  name: "app-planning",
  components: {
    DayContainer,
    IconMinus,
    IconPlus,
    IconEdit,
    IconImg,
    IconPaint,
    Planning,
    PlanningWeek,
    ImgEdit
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
      months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      weeks: [],
      date: {
        isActive: false,
        string: null,
        month: moment().month(),
        year: moment().year(),
      },
      skipInit: false,
      printMonth: false,
      printWeek: {
        isActive: false,
        dateStart: null,
      },
      editImg: {
        isActive: false,
        img: null,
        callbackClose: null,
        callbackConfirm: null,
        container: null,
      },
    }
  },
  emits: [],
  created() {
  },
  mounted() {
    this.updateDate();
  },
  methods: {
    updateDate() {
      this.skipInit = false;
      this.date.string = `${this.months[this.date.month]} ${this.date.year}`;

      const firstDay = moment(`${this.date.year}-${this.date.month + 1}-01`);
      firstDay.subtract((firstDay.day() == 0 ? 7 : firstDay.day()) - 1, "days");
      const lastDay = moment(`${this.date.year}-${this.date.month + 1}-01`).endOf('month');
      lastDay.add(7 - lastDay.day(), "days");
      const weeks = [];
      for (var m = moment(firstDay); m.isBefore(lastDay); m.add(1, 'days')) {
        if (weeks.length == 0 || m.day() == 1) {
          weeks.push([]);
        }
        weeks[weeks.length - 1].push({
          date: m.format('YYYY-MM-DD'),
          isCurrentMonth: m.month() == this.date.month,
          day: m.format('DD'),
        });
      }
      this.weeks = weeks.filter(week => week.filter(day => day.isCurrentMonth).length > 3);
    },
    focusModal() {
      this.$refs[`input_month`].focus();
    },
    updateMonth(int, isActive = false) {
      if (isActive) {
        this.focusModal()
      }
      this.date.month += int;
      if (this.date.month == -1) {
        this.date.year--;
        this.date.month = 11;
      }
      else if (this.date.month == 12) {
        this.date.year++;
        this.date.month = 0;
      }
      this.date.month = this.date.month % 12;
      this.updateDate();
    },
    updateYear(int) {
      this.focusModal();
      this.date.year += int;
      this.updateDate();
    },
    addAnimationModal(e) {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Ajouter une animation',
        html: `
            <div class="add-anim-modal-container modal-container">
              <input type="text" class="btn-input" id="anim-label" placeholder="Nom de l'animation" />
              <h2>Icônes</h2>
              <div class="icons-list">
                <label for="import-icon" id="label-import-icon" class="btn btn-import">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </label>
                <input type="file" id="import-icon" style="display: none" ref="fileInput" accept="image/*"/>
              </div>
            </div>
            `,
        confirmButtonText: 'Ajouter',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("anim-label").focus();
          document.getElementById("import-icon").addEventListener('change', (e) => {
            const files = document.getElementById("import-icon").files;
            const fileReader = new FileReader();

            fileReader.onload = event => {
              var container = document.createElement('div');
              container.classList.add('icon-container');
              container.classList.add('can-delete');
              container.classList.add('new-icon');
              var img = document.createElement('img');
              img.src = event.target.result;
              img.alt = "icon";
              container.appendChild(img);
              container.dataset.src = event.target.result;
              container.dataset.name = files[0].name;
              document.getElementById("import-icon").after(container);
              container.addEventListener('click', () => {
                container.remove();
              });

              this.customiseImgModal(container, {
                src: event.target.result,
                name: files[0].name,
              });
            };
            if (fileReader && files[0]) {
              fileReader.readAsDataURL(files[0]);
            }
          });
          document.getElementById("anim-label").addEventListener('input', (e) => {
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
            label: document.getElementById("anim-label").value,
            icons: Array.from(document.getElementsByClassName("icon-container can-delete new-icon")).map(icon => { return { src: icon.dataset.src, label: icon.dataset.name }; }),
          };

          if (!values.label) {
            Swal.showValidationMessage(`L'animation doit avoir un Nom.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          socket.emit("add animation", data.value);
        }
        this.listAnimationModal();
      });
    },
    addReccurenceModal(e) {
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Ajouter une récurrence',
        html: `
            <div class="add-reccurence-modal-container modal-container">
              <div class="animation-search-input">
                <input type="text" class="btn-input" id="search-anim-label" data-id="null" placeholder="Sélection de l'animation" />
                <div class="animation-search-result">
                  <ul id="update-anim-list">
                    ${state.animations.filter(a => a.isActive).map(a => `
                      <li data-id="${a.id}">
                        <p>${a.label}</p>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              </div>
              <div class="reccurence-inputs">
                <h2>Jour de la semaine</h2>
                <div class="reccurence-day" id="select-reccurence-day">
                  <svg fill="#141414" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" data-number="-1">
                    <g opacity="0.2">
                      <circle cx="128" cy="128" r="96" />
                    </g>
                    <g>
                      <path d="M127.99951,24.00012a104,104,0,1,0,104,104A104.11791,104.11791,0,0,0,127.99951,24.00012Zm0,192a88,88,0,1,1,88-88A88.09957,88.09957,0,0,1,127.99951,216.00012Z" />
                      <path d="M167.99951,120.00012h-80a8,8,0,1,0,0,16h80a8,8,0,0,0,0-16Z" />
                    </g>
                  </svg>
                  <p class="btn btn-input" id="reccurence-day-input" data-number="1">Lundi</p>
                  <svg fill="#000000" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" data-number="1">
                    <g opacity="0.2">
                      <circle cx="128" cy="128" r="96" />
                    </g>
                    <g>
                      <path d="M128,24A104,104,0,1,0,232,128,104.11791,104.11791,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.09957,88.09957,0,0,1,128,216Z" />
                      <path d="M168,120H136V88a8,8,0,0,0-16,0v32H88a8,8,0,0,0,0,16h32v32a8,8,0,0,0,16,0V136h32a8,8,0,0,0,0-16Z" />
                    </g>
                  </svg>
                </div>
                <h2>Heure de la journée</h2>
                <div class="reccurence-hour">
                  <input type="text" class="btn-input" id="reccurence-hour-input" placeholder="00" />
                  <div class="points-icon"></div>
                  <input type="text" class="btn-input" id="reccurence-minute-input" placeholder="00" />
                </div>
              </div>
            </div>
            `,
        confirmButtonText: 'Ajouter',
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById('update-anim-list').addEventListener('update', () => {
            const list = document.getElementById('update-anim-list');
            list.innerHTML = state.animations.filter(a => a.isActive).map(a => `
              <li data-id="${a.id}">
                <p>${a.label}</p>
              </li>
            `).join('');
          });
          document.getElementById('update-anim-list').addEventListener('click', (e) => {
            if (e.target.closest('li')) {
              document.getElementById('search-anim-label').value = e.target.closest('li').querySelector('p').textContent;
              document.getElementById('search-anim-label').dataset.id = e.target.closest('li').dataset.id;
            }
          });
          document.getElementById('search-anim-label').addEventListener('keydown', (e) => {
            if (e.target.dataset.id != "null") {
              e.target.value = "";
              e.target.dataset.id = null;
            }
          });
          document.getElementById('search-anim-label').addEventListener('keyup', (e) => {
            const list = document.getElementById('update-anim-list');
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
          document.getElementById('select-reccurence-day').addEventListener('click', (e) => {
            if (e.target.closest('svg')) {
              const day = document.getElementById('reccurence-day-input').dataset.number;
              const Days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
              document.getElementById('reccurence-day-input').dataset.number = (parseInt(day) + parseInt(e.target.closest('svg').dataset.number) + 7) % 7;
              document.getElementById('reccurence-day-input').textContent = this.days[document.getElementById('reccurence-day-input').dataset.number];
            }
          });
          document.getElementById('reccurence-hour-input').addEventListener('input', (e) => {
            if (e.target.value != '00') {
              if (e.target.value.length && e.target.value[0] == '0') {
                e.target.value = '0' + (e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "");
              }
              else {
                e.target.value = e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "";
              }
            }
            if (e.target.value.length == 1 && e.target.value > 2) {
              e.target.value = '0' + e.target.value;
            }
            if (e.target.value.length > 2) {
              e.target.value = e.target.value.slice(0, 2);
            }
            if (e.target.value.length == 2) {
              document.getElementById('reccurence-minute-input').focus();
            }
          });
          document.getElementById('reccurence-hour-input').addEventListener('focusout', (e) => {
            if (e.target.value.length == 1) {
              e.target.value = '0' + e.target.value;
            }
          });
          document.getElementById('reccurence-minute-input').addEventListener('input', (e) => {
            if (e.target.value != '00') {
              if (e.target.value.length && e.target.value[0] == '0') {
                e.target.value = '0' + (e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "");
              }
              else {
                e.target.value = e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "";
              }
            }
            if (e.target.value.length == 1 && e.target.value > 5) {
              e.target.value = '0' + e.target.value;
            }
            if (e.target.value.length > 2) {
              e.target.value = e.target.value.slice(0, 2);
            }
            if (e.target.value.length == 2) {
              document.getElementById('reccurence-minute-input').focus();
            }
          });
          document.getElementById('reccurence-minute-input').addEventListener('focusout', (e) => {
            e.target.value = e.target.value - e.target.value % 5;
            if (e.target.value.length == 1) {
              e.target.value = '0' + e.target.value;
            }
          });
          document.getElementById('reccurence-minute-input').addEventListener('keydown', (e) => {
            if (e.key == "Backspace" && e.target.value.length == 0) {
              document.getElementById('reccurence-hour-input').focus();
            }
          });
        },
        preConfirm: () => {
          const values = {
            animationId: document.getElementById('search-anim-label').dataset.id,
            day: document.getElementById('reccurence-day-input').dataset.number ?? 1,
            hour: document.getElementById('reccurence-hour-input').value,
            minute: document.getElementById('reccurence-minute-input').value,
          };

          if (values.animationId == "null") {
            Swal.showValidationMessage(`Vous devez sélectionner une animation.`);
          }
          if (!values.hour || !values.minute) {
            Swal.showValidationMessage(`Vous devez sélectionner une heure.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          socket.emit("add reccurence", { animationId: data.value.animationId, day: data.value.day, time: `${data.value.hour}:${data.value.minute}` });
        }
        this.listReccurenceModal();
      });
    },
    editAnimationModal(id) {
      const animation = state.animations.find(a => a.id == id);
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Modifier une animation',
        html: `
            <div class="add-anim-modal-container modal-container">
              <input type="text" class="btn-input" id="anim-label" placeholder="Nom de l'animation" value="${animation.label}" />
              <h2>Icônes</h2>
              <div class="icons-list" id="icons-list-edit">
                <label for="import-icon" id="label-import-icon" class="btn btn-import">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </label>
                <input type="file" id="import-icon" style="display: none" ref="fileInput" accept="image/*"/>
                ${animation.icons.map(icon => `
                  <div class="icon-container can-delete" data-id="${icon.id}">
                    <img src="${state.url}${icon.path.replace('./', '/')}" alt="${icon.label}" />
                    <p>${icon.label}</p>
                  </div>
                `).join('')}
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
          document.getElementById("import-icon").addEventListener('change', (e) => {
            const files = document.getElementById("import-icon").files;
            const fileReader = new FileReader();

            fileReader.onload = event => {
              var container = document.createElement('div');
              container.classList.add('icon-container');
              container.classList.add('can-delete');
              container.classList.add('new-icon');
              var img = document.createElement('img');
              img.src = event.target.result;
              img.alt = "icon";
              container.appendChild(img);
              container.dataset.src = event.target.result;
              container.dataset.name = files[0].name;
              document.getElementById("import-icon").after(container);
              container.addEventListener('click', () => {
                container.remove();
              });

              this.customiseImgModal(container, {
                src: event.target.result,
                name: files[0].name,
              });
            };
            if (fileReader && files[0]) {
              fileReader.readAsDataURL(files[0]);
            }
          });
          document.getElementById("anim-label").addEventListener('input', (e) => {
            if (e.target.value == " ") {
              e.target.value = "";
            }
            if (e.target.value.length > 0) {
              e.target.value = e.target.value[0].toUpperCase() + e.target.value.replaceAll('  ', ' ').slice(1);
            }
          });
          document.getElementById("icons-list-edit").addEventListener('click', (e) => {
            if (e.target.dataset && e.target.dataset.id) {
              e.target.classList.add('remove-icon');
            }
          });
        },
        preConfirm: () => {
          const values = {
            label: document.getElementById("anim-label").value,
            newIcons: Array.from(document.getElementsByClassName("icon-container new-icon")).map(icon => { return { src: icon.dataset.src, label: icon.dataset.name }; }),
            removeIcons: Array.from(document.getElementsByClassName("icon-container remove-icon")).map(icon => icon.dataset.id),
          };

          if (!values.label) {
            Swal.showValidationMessage(`L'animation doit avoir un Nom.`);
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.lastLabel = animation.label;
          data.value.id = id;
          socket.emit("edit animation", data.value);
        }
        this.listAnimationModal();
      });
    },
    editReccurenceModal(id) {
      const reccurence = state.reccurences.find(r => r.id == id);
      const animation = state.animations.find(a => a.id == reccurence.animationId);
      Swal.mixin({
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Modifier une récurrence',
        html: `
            <div class="add-reccurence-modal-container modal-container">
              <div class="animation-search-input">
                <input type="text" class="btn-input" data-id="null" value="${animation.label}" disabled/>
              </div>
              <div class="reccurence-inputs">
                <h2>Jour de la semaine</h2>
                <div class="reccurence-day" id="select-reccurence-day">
                  <svg fill="#141414" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" data-number="-1">
                    <g opacity="0.2">
                      <circle cx="128" cy="128" r="96" />
                    </g>
                    <g>
                      <path d="M127.99951,24.00012a104,104,0,1,0,104,104A104.11791,104.11791,0,0,0,127.99951,24.00012Zm0,192a88,88,0,1,1,88-88A88.09957,88.09957,0,0,1,127.99951,216.00012Z" />
                      <path d="M167.99951,120.00012h-80a8,8,0,1,0,0,16h80a8,8,0,0,0,0-16Z" />
                    </g>
                  </svg>
                  <p class="btn btn-input" id="reccurence-day-input" data-number="${reccurence.day}">${this.days[reccurence.day]}</p>
                  <svg fill="#000000" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" data-number="1">
                    <g opacity="0.2">
                      <circle cx="128" cy="128" r="96" />
                    </g>
                    <g>
                      <path d="M128,24A104,104,0,1,0,232,128,104.11791,104.11791,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.09957,88.09957,0,0,1,128,216Z" />
                      <path d="M168,120H136V88a8,8,0,0,0-16,0v32H88a8,8,0,0,0,0,16h32v32a8,8,0,0,0,16,0V136h32a8,8,0,0,0,0-16Z" />
                    </g>
                  </svg>
                </div>
                <h2>Heure de la journée</h2>
                <div class="reccurence-hour">
                  <input type="text" class="btn-input" id="reccurence-hour-input" value="${reccurence.time.split(':')[0]}" placeholder="00" />
                  <div class="points-icon"></div>
                  <input type="text" class="btn-input" id="reccurence-minute-input" value="${reccurence.time.split(':')[1]}" placeholder="00" />
                </div>
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
          document.getElementById('select-reccurence-day').addEventListener('click', (e) => {
            if (e.target.closest('svg')) {
              const day = document.getElementById('reccurence-day-input').dataset.number;
              const Days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
              document.getElementById('reccurence-day-input').dataset.number = (parseInt(day) + parseInt(e.target.closest('svg').dataset.number) + 7) % 7;
              document.getElementById('reccurence-day-input').textContent = this.days[document.getElementById('reccurence-day-input').dataset.number];
            }
          });
          document.getElementById('reccurence-hour-input').addEventListener('input', (e) => {
            if (e.target.value != '00') {
              if (e.target.value.length && e.target.value[0] == '0') {
                e.target.value = '0' + (e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "");
              }
              else {
                e.target.value = e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "";
              }
            }
            if (e.target.value.length == 1 && e.target.value > 2) {
              e.target.value = '0' + e.target.value;
            }
            if (e.target.value.length > 2) {
              e.target.value = e.target.value.slice(0, 2);
            }
            if (e.target.value.length == 2) {
              document.getElementById('reccurence-minute-input').focus();
            }
          });
          document.getElementById('reccurence-hour-input').addEventListener('focusout', (e) => {
            if (e.target.value.length == 1) {
              e.target.value = '0' + e.target.value;
            }
          });
          document.getElementById('reccurence-minute-input').addEventListener('input', (e) => {
            if (e.target.value != '00') {
              if (e.target.value.length && e.target.value[0] == '0') {
                e.target.value = '0' + (e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "");
              }
              else {
                e.target.value = e.target.value && parseInt(e.target.value) ? parseInt(e.target.value) : "";
              }
            }
            if (e.target.value.length == 1 && e.target.value > 5) {
              e.target.value = '0' + e.target.value;
            }
            if (e.target.value.length > 2) {
              e.target.value = e.target.value.slice(0, 2);
            }
            if (e.target.value.length == 2) {
              document.getElementById('reccurence-minute-input').focus();
            }
          });
          document.getElementById('reccurence-minute-input').addEventListener('focusout', (e) => {
            e.target.value = e.target.value - e.target.value % 5;
            if (e.target.value.length == 1) {
              e.target.value = '0' + e.target.value;
            }
          });
          document.getElementById('reccurence-minute-input').addEventListener('keydown', (e) => {
            if (e.key == "Backspace" && e.target.value.length == 0) {
              document.getElementById('reccurence-hour-input').focus();
            }
          });
        },
        preConfirm: () => {
          const values = {
            day: document.getElementById('reccurence-day-input').dataset.number ?? 1,
            hour: document.getElementById('reccurence-hour-input').value,
            minute: document.getElementById('reccurence-minute-input').value,
          };

          if (!values.hour || !values.minute) {
            Swal.showValidationMessage(`Vous devez sélectionner une heure.`);
          }
          else {
            values.time = `${values.hour}:${values.minute}`;
          }

          return values;
        },
      }).then((data) => {
        if (data.isConfirmed) {
          data.value.id = id;
          socket.emit("edit reccurence", data.value);
        }
        this.listReccurenceModal();
      });
    },
    deleteAnimationModal(id) {
      const animation = state.animations.find(a => a.id == id);
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: `Vous allez supprimer l'animation "${animation.label}"`,
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false,
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          socket.emit("delete animation", id);
        }
        this.listAnimationModal();
      });
    },
    deleteReccurenceModal(id) {
      const reccurence = state.reccurences.find(r => r.id == id);
      const animation = state.animations.find(a => a.id == reccurence.animationId);
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: `Vous allez supprimer la récurrence de l'animation "${animation.label}" le ${this.days[reccurence.day]} à ${reccurence.time.toString().slice(0, 5)}`,
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',
        customClass: {
          confirmButton: "btn btn-confirm",
          cancelButton: "btn btn-cancel",
          title: 'text-2xl',
        },
        buttonsStyling: false,
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          socket.emit("delete reccurence", id);
        }
        this.listReccurenceModal();
      });
    },
    listAnimationModal() {
      const animlist = this.getAnimationsForModal;
      Swal.mixin({
        width: '40rem',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false
      }).fire({
        title: 'Animations',
        html: `
            <div class="anim-modal-container modal-container">
              <div class="anim-list-container">
                <input type="text" id="input-search-list-animation" class="btn-input btn-anim" placeholder="Rechercher" />
                <ul class="anim-list" id="update-anim-list">
                  ${animlist}
                </ul>
              </div>
              <button type="button" id="add-anim" class="btn btn-confirm">Ajouter</button>
            </div>
            `,
        confirmButtonText: 'Fermer',
        focusConfirm: false,
        showDenyButton: false,
        willOpen: () => {
          document.getElementById("add-anim").addEventListener('click', (e) => {
            this.addAnimationModal(e);
          });
          document.getElementById('update-anim-list').addEventListener('update', () => {
            const list = document.getElementById('update-anim-list');
            list.innerHTML = this.getAnimationsForModal;
          });
          document.getElementById('update-anim-list').addEventListener('click', (e) => {
            if (e.target.closest('div').classList.contains('icon')) {
              const id = e.target.closest('li').dataset.id;
              if (e.target.closest('div').classList.contains('edit')) {
                Swal.close();
                this.editAnimationModal(id);
              }
              else if (e.target.closest('div').classList.contains('trash')) {
                this.deleteAnimationModal(id);
              }
            }
            return;
          });
          document.getElementById('input-search-list-animation').addEventListener('input', (e) => {
            const list = document.getElementById('update-anim-list');
            list.innerHTML = this.getAnimationsForModal;
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
    listReccurenceModal() {
      const reccurencelist = this.getReccurencesForModal;
      Swal.fire({
        title: 'Récurrences',
        showCancelButton: false,
        confirmButtonText: 'Fermer',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false,
        html: `
            <div class="reccurence-modal-container modal-container">
              <div class="reccurence-list-container">
                <input type="text" id="input-search-list-reccurence" class="btn-input btn-anim" placeholder="Rechercher" />
                <ul class="reccurence-list" id="update-reccurence-list">
                  ${reccurencelist}
                </ul>
              </div>
              <button type="button" id="add-reccurence" class="btn btn-confirm">Ajouter</button>
            </div>
            `,
        willOpen: () => {
          document.getElementById("add-reccurence").addEventListener('click', (e) => {
            this.addReccurenceModal(e);
          });
          document.getElementById('update-reccurence-list').addEventListener('update', () => {
            const list = document.getElementById('update-reccurence-list');
            list.innerHTML = this.getReccurencesForModal;
          });
          document.getElementById('input-search-list-reccurence').addEventListener('input', (e) => {
            const list = document.getElementById('update-reccurence-list');
            list.innerHTML = this.getReccurencesForModal;
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
          document.getElementById('update-reccurence-list').addEventListener('click', (e) => {
            if (e.target.closest('ul').classList.contains('reccurence-list')) {
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
          document.getElementById('update-reccurence-list').addEventListener('click', (e) => {
            if (e.target.closest('div').classList.contains('icon')) {
              const id = e.target.closest('li').dataset.id;
              if (e.target.closest('div').classList.contains('edit')) {
                this.editReccurenceModal(id);
              }
              else if (e.target.closest('div').classList.contains('trash')) {
                this.deleteReccurenceModal(id);
              }
            }
            return;
          });
        },
      });
    },
    initReccurence() {
      if (this.weeks.length == 0) {
        return false;
      }
      let listAnimations = [];
      const firstDay = this.weeks[0][0].date;
      const lastDay = this.weeks[this.weeks.length - 1][this.weeks[this.weeks.length - 1].length - 1].date;
      console.log(lastDay);
      state.reccurences.map((r) => {
        const start = moment(firstDay).day(r.day).hour(r.time.split(':')[0]).minute(r.time.split(':')[1]);
        const end = moment(lastDay).day(r.day).hour(r.time.split(':')[0]).minute(r.time.split(':')[1]);
        while (start.isBefore(end) || end.isSame(start)) {
          listAnimations.push({
            dateTime: start.format('YYYY-MM-DD HH:mm:ss'),
            content: state.animations.find(a => a.id == r.animationId).label,
            iconId: state.animations.find(a => a.id == r.animationId).icons[Math.floor(Math.random() * state.animations.find(a => a.id == r.animationId).icons.length)],
            animationId: r.animationId,
          });
          start.add(7, 'days');
        }
      });
      listAnimations = listAnimations.filter(a => {
        return moment(a.dateTime).isSameOrAfter(moment(firstDay)) && moment(a.dateTime).isSameOrBefore(moment(lastDay).set('hour', 23).set('minute', 59).set('second', 59));
      });
      if (listAnimations.length) {
        socket.emit("init animations planning", listAnimations);
      }
      // socket.emit("add animation planning", {
      //   dateTime: start.format('YYYY-MM-DD HH:mm:ss'),
      //   content: state.animations.find(a => a.id == r.animationId).label,
      //   iconId: state.animations.find(a => a.id == r.animationId).icons[Math.floor(Math.random() * state.animations.find(a => a.id == r.animationId).icons.length)],
      //   animationId: r.animationId,
      // });
    },
    openPrint() {
      document.getElementById('planning-wait').classList.add('active');
      const listWeeks = [];
      this.weeks.map(w => {
        const startDate = moment(w[0].date).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:mm:ss');
        const weekNumber = moment(w[0].date).week();
        listWeeks.push(`
                <button type="button" data-first-day="${startDate}" class="btn btn-default">Semaine ${weekNumber}</button>
        `);
      })
      Swal.fire({
        title: 'Récurrences',
        showCancelButton: false,
        confirmButtonText: 'Fermer',
        customClass: {
          confirmButton: "btn btn-close",
          title: 'text-2xl',
        },
        buttonsStyling: false,
        html: `
            <div class="export-modal-container modal-container">
              <div class="export-month">
                <button type="button" id="export-month" class="btn btn-confirm">Mois de ${this.months[this.date.month].toLowerCase()}</button>
              </div>
              <h2>Planning par semaine</h2>
              <div class="export-week" id="export-week">
                ${listWeeks.join('')}
              </div>
            </div>
            `,
        willOpen: () => {
          document.getElementById('export-month').addEventListener('click', () => {
            Swal.close();
            this.togglePrintMonth();
          });
          document.getElementById('export-week').addEventListener('click', (e) => {
            if (e.target.closest('button')) {
              const startDate = e.target.closest('button').dataset.firstDay;
              if (startDate) {
                this.printWeek.startDate = startDate;
                Swal.close();
                this.togglePrintWeek();
              }
            }
          });
        },
      }).then((result) => {
        document.getElementById('planning-wait').classList.remove('active');
      });
    },
    togglePrintMonth() {
      this.printMonth = !this.printMonth;
      document.getElementById('planning-wait').classList.remove('active');
    },
    togglePrintWeek() {
      this.printWeek.isActive = !this.printWeek.isActive;
      document.getElementById('planning-wait').classList.remove('active');
    },
    customiseImgModal(container, image) {
      this.editImg.container = container;
      this.editImg.callbackClose = () => {
        this.editImg.container.remove();
        this.resetImgModal();
      };
      this.editImg.callbackConfirm = (img) => {
        this.editImg.container.dataset.src = img.src;
        this.editImg.container.dataset.name = img.name;
        const imgTag = this.editImg.container.querySelector('img');
        if (imgTag) {
          imgTag.src = img.src;
          imgTag.alt = img.name;
        }
        else {
          this.editImg.container.src = img.src;
          this.editImg.container.name = img.name;
        }
        this.resetImgModal();
      };
      this.editImg.img = {
        src: image.src,
        name: image.name,
      };
      this.editImg.isActive = true;
    },
    resetImgModal() {
      this.editImg.isActive = false;
      this.editImg.callbackClose = null;
      this.editImg.callbackConfirm = null;
      this.editImg.img = null;
      this.editImg.container = null;
    },
  },
  computed: {
    getUrl() {
      return state.url;
    },
    getPrintMonth() {
      return this.printMonth;
    },
    getPrintWeek() {
      return this.printWeek.isActive;
    },
    getPrintWeekStartDate() {
      return moment(this.printWeek.startDate).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:mm:ss');
    },
    getMonths() {
      return months;
    },
    getAnimationsForModal() {
      return state.animations.filter(a => a.isActive).map((a) => `
        <li data-id="${a.id}">
          <p>${a.label}</p>
          <div class="inputs">
            <div class="icon edit">${this.editIcon}</div>
            <div class="icon trash">${this.trashIcon}</div>
          </div>
        </li>
      `).join('');
    },
    getReccurencesForModal() {
      const animations = [];
      state.reccurences.map((r) => {
        if (!animations.find(a => a.id == r.animationId)) {
          animations.push({
            id: r.animationId,
            reccurences: []
          });
        }
        const anim = animations.find(a => a.id == r.animationId);
        anim.reccurences.push({
          id: r.id,
          dayOrder: r.day == 0 ? 6 : r.day - 1,
          day: this.days[r.day],
          time: r.time.toString().slice(0, 5),
        });
      });
      return animations.map((a) => {
        return `
          <li data-id="${a.id}">
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              ${state.animations.find(anim => anim.id == a.id).label}
            </p>
            <ul>
              ${a.reccurences.sort((a, b) => a.dayOrder - b.dayOrder).map(r => `
                <li data-id="${r.id}">
                  <p>${r.day} - ${r.time}</p>
                  <div class="inputs">
                    <div class="icon edit">${this.editIcon}</div>
                    <div class="icon trash">${this.trashIcon}</div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </li>
        `;
      }).join('');
      // return state.reccurences.map((r) => `
      //   <li data-id="${r.id}">
      //     <p>${r.label}</p>
      //   </li>
      // `).join('');
    },
    getAnimationsForMonth() {
      if (this.weeks.length == 0) {
        return false;
      }
      const firstDay = this.weeks[0][0].date;
      const lastDay = this.weeks[this.weeks.length - 1][this.weeks[this.weeks.length - 1].length - 1].date;
      return state.plannings.filter(p => moment(p.dateTime).isBetween(firstDay, lastDay)).map((a) => {
        return {
          id: a.id,
          content: a.content,
          date: a.dateTime.split('T')[0],
          hour: moment(a.dateTime).minute() == 0 ? moment(a.dateTime).format('HH') + 'h' : moment(a.dateTime).format('HH:mm').replace(':', 'h'),
        };
      });
    }
  }
};
</script>

<template>
  <div class="general-container planning-container">
    <h1>{{ months[date.month] }}</h1>
    <div class="btn-container">
      <button class="btn" @click="listAnimationModal">Animations</button>
      <button class="btn" @click="listReccurenceModal">Récurrences</button>
    </div>
    <div class="btn-container right">
      <button class="btn" @click="openPrint">Exporter</button>
    </div>
    <section class="general-input">
      <table class="planning">
        <thead class="planning-head">
          <tr>
            <th>Lundi</th>
            <th>Mardi</th>
            <th>Mercredi</th>
            <th>Jeudi</th>
            <th>Vendredi</th>
            <th>Samedi</th>
            <th>Dimanche</th>
          </tr>
        </thead>
        <tbody class="planning-body" id="planning-body">
          <tr v-for="week in weeks">
            <td v-for="day in week">
              <DayContainer :day="day" :months="months" :days="days" @customiseImgModal="customiseImgModal" />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="planning-init" v-if="getAnimationsForMonth.length == 0 && !skipInit">
        <div class="init-container">
          <h2>Initialisation du planning du mois</h2>
          <p>Intégrer les récurrences ?</p>
          <div class="choice-container">
            <button class="btn btn-cancel" @click="skipInit = true">Annuler</button>
            <button class="btn btn-confirm" @click="initReccurence">Confirmer</button>
          </div>
        </div>
      </div>
    </section>
    <div class="general-form w-1/3 pt-1">
      <div class="general-form-date">
        <button class="date-btn" @click="updateMonth(-1)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div class="month-select-btn" :class="{ active: date.isActive }">
          <input type="text" v-model="date.string" @input="updateDate" :class="{ 'caret-transparent': true }"
            class="label" :ref="`input_month`" @focus="date.isActive = true" @focusout="date.isActive = false" />
          <span class="click-input"></span>
          <div class="select-items">
            <div class="select-items-container">
              <div class="select-month">
                <IconMinus @click="updateMonth(-1, true)" />
                <p class="month">{{ months[date.month] }}</p>
                <IconPlus @click="updateMonth(1, true)" />
              </div>
              <div class="select-year">
                <IconMinus @click="updateYear(-1)" />
                <p class="year">{{ date.year }}</p>
                <IconPlus @click="updateYear(1)" />
              </div>
            </div>
          </div>
        </div>
        <button class="date-btn" @click="updateMonth(+1)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
    <div class="export-wait" id="planning-wait">
      <div class="svg-container">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </div>
    </div>
    <Planning :weeks="weeks" :monthString="months[date.month]" :month="`${date.month}-${date.year}`"
      @customiseImgModal="customiseImgModal" v-if="getPrintMonth" @closePlanning="togglePrintMonth" />
    <PlanningWeek :startDate="getPrintWeekStartDate" v-if="getPrintWeek" @closePlanningWeek="togglePrintWeek"
      @customiseImgModal="customiseImgModal" />
    <ImgEdit v-if="editImg.isActive" :img="editImg.img" @closeImgEdit="editImg.callbackClose()"
      @confirmImgEdit="editImg.callbackConfirm" />
  </div>
</template>

<style lang="scss">
.planning-container {
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
  }

  .general-input {
    @apply flex w-full h-full border-y-4 border-white/60 relative;
  }

  .export-wait {
    @apply absolute inset-0 bg-gray-500/30 hidden;

    .svg-container {
      @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4;
    }

    svg {
      @apply w-full h-full animate-spin stroke-gray-500/70;
    }

    &.active {
      @apply flex;
    }
  }

  @screen md {
    @apply w-full;
  }
}

.month-select-btn .select-items-container {
  @apply w-full py-1 flex flex-col space-y-1 border-white border-4 transition-all duration-700 rounded-xl;

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
        &.paint-icon {
          @apply w-7 stroke-blue-600 stroke-2 fill-none absolute top-1 left-1;

          &:hover {
            @apply stroke-blue-800;
          }
        }

        &.img-icon,
        &.paint-icon {
          @apply left-auto right-1 top-auto bottom-1 stroke-gray-600 fill-black/20;

          &:hover {
            @apply stroke-gray-800;
          }
        }

        &.paint-icon {
          @apply right-auto left-1;
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
</style>
