<script>
import moment from 'moment';
import Swal from "sweetalert2";
import { state, socket } from "@/socket";
import IconPlus from "@/components/icons/IconPlus.vue";
import IconEdit from "@/components/icons/IconEdit.vue";
import IconImg from "@/components/icons/IconImg.vue";
import IconPaint from "@/components/icons/IconPaint.vue";

export default {
    components: {
        IconPlus,
        IconEdit,
        IconImg,
        IconPaint,
    },
    props: {
        day: {
            type: Object,
            required: true
        },
        months: {
            type: Array,
            required: true
        },
        days: {
            type: Array,
            required: true
        },
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
        }
    },
    mounted() {
    },
    methods: {
        addAnimationPlanningModal(date) {
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${this.days[moment(date).day()]} ${moment(date).date()} ${this.months[moment(date).month()]}`,
                html: `
            <div class="add-anim-day-modal-container modal-container">
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
              <div class="content-input">
                <input type="text" class="btn-input" id="planning-content-input" placeholder="Texte de remplacement" value=""/>
              </div>
              <div class="reccurence-inputs">
                <h2>Heure de la journée</h2>
                <div class="reccurence-hour">
                  <input type="text" class="btn-input" id="planning-hour-input" placeholder="15" />
                  <div class="points-icon"></div>
                  <input type="text" class="btn-input" id="planning-minute-input" placeholder="00" />
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
                        list.innerHTML = state.animations.filter(a => a.isActive).map(a => `<li data-id="${a.id}"><p>${a.label}</p></li>`).join('');
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
                    document.getElementById('planning-hour-input').addEventListener('input', (e) => {
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
                            document.getElementById('planning-minute-input').focus();
                        }
                    });
                    document.getElementById('planning-hour-input').addEventListener('focusout', (e) => {
                        if (e.target.value.length == 1) {
                            e.target.value = '0' + e.target.value;
                        }
                    });
                    document.getElementById('planning-minute-input').addEventListener('input', (e) => {
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
                            document.getElementById('planning-minute-input').focus();
                        }
                    });
                    document.getElementById('planning-minute-input').addEventListener('focusout', (e) => {
                        e.target.value = e.target.value - e.target.value % 5;
                        if (e.target.value.length == 1) {
                            e.target.value = '0' + e.target.value;
                        }
                    });
                    document.getElementById('planning-minute-input').addEventListener('keydown', (e) => {
                        if (e.key == "Backspace" && e.target.value.length == 0) {
                            document.getElementById('planning-hour-input').focus();
                        }
                    });
                },
                preConfirm: () => {
                    const values = {
                        content: document.getElementById('planning-content-input').value,
                        animationId: document.getElementById('search-anim-label').dataset.id,
                        hour: document.getElementById('planning-hour-input').value,
                        minute: document.getElementById('planning-minute-input').value,
                    };

                    if (values.animationId == "null") {
                        Swal.showValidationMessage(`Vous devez sélectionner une animation.`);
                    }
                    if (!values.hour) {
                        values.hour = "15";
                    }
                    if (!values.minute) {
                        values.minute = "00";
                    }

                    values.dateTime = moment(date).set({ hour: values.hour, minute: values.minute }).format('YYYY-MM-DD HH:mm:ss');
                    const current = state.animations.find(a => a.id == values.animationId);
                    values.iconId = current.icons.length > 0 ? current.icons[Math.floor(Math.random() * current.icons.length)] : null;
                    if (values.content == "") {
                        values.content = current.label;
                    }

                    return values;
                },
            }).then((data) => {
                if (data.isConfirmed) {
                    socket.emit("add animation planning", data.value);
                }
            });
        },
        changeIcon(date, placementChoice, e) {
            if (e) {
                e.stopPropagation();
            }
            const current = state.decorations.find(d => moment(d.date).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') && d.placementChoice == placementChoice);
            const img = current ? state.animations.find(a => a.label == "").icons.find(i => i.id == current.iconId) : null;
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${this.days[moment(date).day()]} ${moment(date).date()} ${this.months[moment(date).month()]}`,
                html: `
            <div class="custom-img-day-modal-container modal-container">
              <div class="img-upload-container ${current ? 'active' : ''}" id="img-upload-container" data-src="" data-name="">
                <img id="current-img" src="${current && img ? state.url + img.path.replace('./', '/') : ''}" alt="image" />
                <label for="import-icon" id="label-import-icon" class="btn btn-import">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </label>
                <input type="file" id="import-icon" style="display: none" ref="fileInput" accept="image/*"/>
              </div>
            </div>
            `,
                confirmButtonText: current ? 'Enregistrer' : 'Ajouter',
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
                            document.getElementById('current-img').src = event.target.result;
                            const container = document.getElementById('img-upload-container');
                            container.dataset.src = event.target.result;
                            container.dataset.name = files[0].name;
                            container.classList.add('active');

                            this.$emit('customiseImgModal', container, {
                                src: event.target.result,
                                name: files[0].name,
                            });
                        };
                        if (fileReader && files[0]) {
                            fileReader.readAsDataURL(files[0]);
                        }
                    });
                },
                preConfirm: () => {
                    const values = {
                        src: document.getElementById('img-upload-container').dataset.src,
                        label: document.getElementById('img-upload-container').dataset.name,
                    };
                    if (values.src == "") {
                        Swal.showValidationMessage(`Vous devez sélectionner une image.`);
                    }
                    values.date = moment(date).format('YYYY-MM-DD');
                    values.placementChoice = placementChoice;
                    values.iconId = null;
                    return values;
                },
            }).then((data) => {
                if (data.isConfirmed) {
                    if (current) {
                        data.value.id = current.id;
                        socket.emit("edit decoration", data.value);
                    }
                    else {
                        socket.emit("add decoration", data.value);
                    }
                }
            });
        },
        customImgPlanningModal(date, placementChoice, e) {
            if (e) {
                e.stopPropagation();
            }
            const defaultIcons = state.animations.find(a => a.label == "").icons;
            const currentDeco = state.decorations.find(d => moment(d.date).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') && d.placementChoice == placementChoice);
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${this.days[moment(date).day()]} ${moment(date).date()} ${this.months[moment(date).month()]}`,
                html: `
                <div class="edit-icon-container modal-container" id="edit-icon-container" data-id="${currentDeco ? currentDeco.iconId : null}">
                    <div class="icons-list" id="icons-list-edit" data-choice="${currentDeco ? currentDeco.iconId : null}">
                        <label id="label-import-icon" for="import-icon-btn" class="btn btn-import import-view">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            <input type="file" data-src="" id="import-icon-btn" style="display: none" ref="fileInput" accept="image/*"/>
                            <img id="imported-icon" src="" alt="" />
                        </label>
                        <div class="icon-container" id="none-icon" data-id="null">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        ${defaultIcons.map(icon => `
                            <div class="icon-container" data-id="${icon.id}" data-animation-id="${icon.animationId}">
                                <img src="${state.url}${icon.path.replace('./', '/')}" alt="${icon.label}" />
                            </div>
                        `).join('')}
                    </div>
                </div>`,
                confirmButtonText: 'Modifier',
                showCancelButton: true,
                focusConfirm: false,
                cancelButtonText: 'Annuler',
                reverseButtons: true,
                showDenyButton: false,
                willOpen: () => {
                    const currentIconChoice = document.getElementById('icons-list-edit').dataset.choice;
                    if (currentIconChoice) {
                        document.getElementById('icons-list-edit').querySelector(`.icon-container[data-id="${currentIconChoice}"]`).classList.add('active');
                    }
                    document.getElementById('icons-list-edit').addEventListener('click', (e) => {
                        if (e.target.closest('div').classList.contains('icon-container') && !e.target.closest('div').classList.contains('active')) {
                            document.getElementById('label-import-icon').classList.remove('active');
                            document.getElementById('icons-list-edit').querySelectorAll('.icon-container').forEach(icon => {
                                icon.classList.remove('active');
                            });
                            e.target.closest('div').classList.add('active');
                            document.getElementById('icons-list-edit').dataset.choice = e.target.closest('div').dataset.id;
                        }
                    });
                    document.getElementById('import-icon-btn').addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                document.getElementById('imported-icon').src = event.target.result;
                                document.getElementById('label-import-icon').classList.add('active');
                                document.getElementById('icons-list-edit').dataset.choice = "new";
                                document.getElementById('icons-list-edit').querySelectorAll('.icon-container').forEach(icon => {
                                    icon.classList.remove('active');
                                });

                                this.$emit('customiseImgModal', document.getElementById('imported-icon'), {
                                    src: event.target.result,
                                    name: file.name,
                                });
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                },
                preConfirm: () => {
                    const values = {
                        iconId: document.getElementById('icons-list-edit').dataset.choice ?? null,
                        img: {
                            src: document.getElementById('imported-icon').dataset.src,
                            name: document.getElementById('imported-icon').dataset.name,
                        }
                    }

                    return values;
                },
            }).then((data) => {
                if (data.isConfirmed) {
                    if (currentDeco) {
                        if (data.value.iconId == "null") {
                            socket.emit("delete decoration", currentDeco.id);
                        }
                        else if (data.value.iconId == "new") {
                            data.value.iconId = null;
                            socket.emit("edit decoration", {
                                id: currentDeco.id,
                                iconId: null,
                                src: data.value.img.src,
                                label: data.value.img.name,
                                placementChoice,
                            });
                        }
                        else {
                            socket.emit("edit decoration", {
                                id: currentDeco.id,
                                iconId: data.value.iconId,
                                placementChoice,
                            });
                        }
                    }
                    else {
                        if (data.value.iconId == "new") {
                            socket.emit("add decoration", {
                                iconId: null,
                                src: data.value.img.src,
                                label: data.value.img.name,
                                date: moment(date).format('YYYY-MM-DD'),
                                placementChoice,
                            });
                        }
                        else if (data.value.iconId != "null") {
                            socket.emit("add decoration", {
                                iconId: data.value.iconId,
                                date: moment(date).format('YYYY-MM-DD'),
                                placementChoice,
                            });
                        }
                    }
                }
            });
        },
        customPlanningModal(date, e) {
            if (e) {
                e.stopPropagation();
            }
            const current = state.plannings.find(p => moment(p.dateTime).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') && p.animationId == null);
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${this.days[moment(date).day()]} ${moment(date).date()} ${this.months[moment(date).month()]}`,
                html: `
            <div class="add-anim-day-modal-container modal-container">
              <input type="text" id="content-anim-label" class="btn-input" value="${current ? current.content : ''}" placeholder="Texte a afficher" />
            </div>
            `,
                confirmButtonText: current ? 'Enregistrer' : 'Ajouter',
                showCancelButton: true,
                focusConfirm: false,
                cancelButtonText: 'Annuler',
                reverseButtons: true,
                showDenyButton: false,
                preConfirm: () => {
                    const values = {
                        content: document.getElementById('content-anim-label').value,
                    };

                    values.dateTime = moment(date).set({ hour: 0, minute: 0 }).format('YYYY-MM-DD HH:mm:ss');

                    return values;
                },
            }).then((data) => {
                if (data.isConfirmed) {
                    if (current) {
                        if (current.content == "") {
                            socket.emit("delete animation planning", current.id);
                        }
                        else {
                            data.value.id = current.id;
                            socket.emit("edit animation planning", data.value);
                        }
                    }
                    else {
                        socket.emit("add animation planning", data.value);
                    }
                }
            });
        },
        getCustomPlanning(date) {
            const today = state.plannings.find(p => moment(p.dateTime).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') && p.animationId == null);
            if (today) {
                return {
                    id: today.id,
                    content: today.content,
                };
            }
        },
        getDecoration(date, placementChoice) {
            const decoration = state.decorations.find(d => moment(d.date).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') && d.placementChoice == placementChoice);
            if (decoration) {
                let icon = null
                state.animations.map(a => {
                    if (a.icons.find(i => i.id == decoration.iconId)) {
                        icon = a.icons.find(i => i.id == decoration.iconId)
                    }
                });
                if (icon) {
                    return {
                        id: decoration.id,
                        placementChoice: decoration.placementChoice,
                        icon: {
                            id: decoration.iconId,
                            path: icon.path,
                        },
                    };
                }
            }
            return false;
        },
        getAnimationsPlanning(date) {
            const todayList = state.plannings.filter(p => p.dateTime.split('T')[0] == moment(date).format('YYYY-MM-DD') && p.animationId != null);
            return todayList.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).map(a => {
                return {
                    id: a.id,
                    animationId: a.animationId,
                    content: a.content,
                    hour: moment(a.dateTime).minute() == 0 ? moment(a.dateTime).format('HH') + 'h' : moment(a.dateTime).format('HH:mm').replace(':', 'h'),
                };
            });
        },
        getAnimationsPlanningToString(date) {
            const todayList = this.getAnimationsPlanning(date);
            return todayList.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).map(a => {
                return `
                <li data-id="${a.id}">
                    <p><span>${a.hour}:</span>${a.content}</p>
                    <div class="inputs">
                        <div class="icon edit">${this.editIcon}</div>
                        <div class="icon trash">${this.trashIcon}</div>
                    </div>
                </li>`;
            }).join('');
        },
        getIconsListPlanning(date) {
            const todayList = this.getAnimationsPlanning(date);
            const icons = [];
            todayList.map(a => {
                const animIcons = state.animations.find(anim => anim.id == a.animationId).icons;
                if (animIcons.length > 0) {
                    icons.push({
                        id: a.animationId,
                        icons: animIcons,
                    });
                }
            });
            return icons;
        },
        editPlanningModal(date, e) {
            if (e) {
                e.stopPropagation();
            }
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-close",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${this.days[moment(date).day()]} ${moment(date).date()} ${this.months[moment(date).month()]}`,
                html: `
          <div class="edit-planning-container modal-container">
            <ul id="update-planning-list">
              ${this.getAnimationsPlanningToString(date)}
            </ul>
          </div>
        `,
                confirmButtonText: 'Fermer',
                showCancelButton: false,
                willOpen: () => {
                    document.getElementById('update-planning-list').addEventListener('update', () => {
                        const list = document.getElementById('update-planning-list');
                        const contentHtml = this.getAnimationsPlanningToString(date);
                        if (!contentHtml) {
                            Swal.clickConfirm();
                        }
                        list.innerHTML = contentHtml;
                    });
                    document.getElementById('update-planning-list').addEventListener('click', (e) => {
                        if (e.target.closest('div').classList.contains('icon')) {
                            const id = e.target.closest('li').dataset.id;
                            if (e.target.closest('div').classList.contains('edit')) {
                                this.editAnimationPlanningModal(id);
                            }
                            else if (e.target.closest('div').classList.contains('trash')) {
                                this.deleteAnimationPlanningModal(id);
                            }
                        }
                        return;
                    });
                },
            });
        },
        editImgPlanningModal(date, e) {
            if (e) {
                e.stopPropagation();
            }
            const iconsChoice = [];
            const animsChoice = [];
            this.getIconsListPlanning(date).forEach(element => {
                animsChoice.push(state.animations.find(a => a.id == element.id));
                element.icons.forEach(icon => {
                    if (!iconsChoice.find(i => i.id == icon.id)) {
                        iconsChoice.push({ id: icon.id, path: icon.path, label: icon.label, animationId: element.id });
                    }
                });
            });
            const currentDecoration = state.decorations.find(d => moment(d.date).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD'));
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${this.days[moment(date).day()]} ${moment(date).date()} ${this.months[moment(date).month()]}`,
                html: `
          <div class="edit-decoration-container modal-container" id="edit-decoration-container" data-id="${currentDecoration ? currentDecoration.id : null}">
            <div class="icons-list" id="icons-list-edit" data-choice="${currentDecoration ? currentDecoration.iconId : null}">
              <div class="icon-container" id="none-icon" data-id="null">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              </div>
              ${iconsChoice.map(icon => `
                <div class="icon-container" data-id="${icon.id}" data-animation-id="${icon.animationId}">
                  <img src="${state.url}${icon.path.replace('./', '/')}" alt="${icon.label}" />
                </div>
              `).join('')}
            </div>
            <div class="icon-placement">
              <h2>Placement</h2>
              <div id="placement-choice" class="radio-choice-container" data-choice="${currentDecoration ? currentDecoration.placementChoice : 1}">
                <div class="radio-choice" data-radio="1">
                  <span class="radio"></span>
                  <p>Au-dessus</p>
                </div>
                <div class="radio-choice" data-radio="2">
                  <span class="radio"></span>
                  <p>En dessous</p>
                </div>
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
                    const currentIconChoice = document.getElementById('icons-list-edit').dataset.choice;
                    if (currentIconChoice) {
                        document.getElementById('icons-list-edit').querySelector(`.icon-container[data-id="${currentIconChoice}"]`).classList.add('active');
                    }
                    const currentPlacementChoice = document.getElementById('placement-choice').dataset.choice;
                    if (currentPlacementChoice && currentPlacementChoice != "null") {
                        document.getElementById('placement-choice').querySelector(`.radio-choice[data-radio="${currentPlacementChoice}"]`).classList.add('active');
                    }
                    else {
                        document.getElementById('placement-choice').querySelector(`.radio-choice[data-radio="1"]`).classList.add('active');
                    }
                    document.getElementById('icons-list-edit').addEventListener('click', (e) => {
                        if (e.target.closest('div').classList.contains('icon-container') && !e.target.closest('div').classList.contains('active')) {
                            document.getElementById('icons-list-edit').querySelectorAll('.icon-container').forEach(icon => {
                                icon.classList.remove('active');
                            });
                            e.target.closest('div').classList.add('active');
                            document.getElementById('icons-list-edit').dataset.choice = e.target.closest('div').dataset.id;
                        }
                    });
                    document.getElementById('placement-choice').addEventListener('click', (e) => {
                        if (e.target.closest('div').classList.contains('radio-choice') && !e.target.closest('div').classList.contains('active')) {
                            document.getElementById('placement-choice').querySelectorAll('.radio-choice').forEach(icon => {
                                icon.classList.remove('active');
                            });
                            e.target.closest('div').classList.add('active');
                            document.getElementById('placement-choice').dataset.choice = e.target.closest('div').dataset.radio;
                        }
                    });
                },
                preConfirm: () => {
                    const values = {
                        id: parseInt(document.getElementById('edit-decoration-container').dataset.id) ?? null,
                        iconId: parseInt(document.getElementById('icons-list-edit').dataset.choice) ?? null,
                        placementChoice: parseInt(document.getElementById('placement-choice').dataset.choice) ?? 1,
                        date: moment(date).format('YYYY-MM-DD')
                    }
                    if (!values.iconId && !values.id) {
                        Swal.showValidationMessage(`Vous devez sélectionner une icône.`);
                    }

                    return values;
                },
            }).then((data) => {
                if (data.isConfirmed) {
                    if (data.value.id) {
                        if (data.value.iconId) {
                            socket.emit("edit decoration", data.value);
                        }
                        else {
                            socket.emit("delete decoration", data.value.id);
                        }
                    }
                    else {
                        socket.emit("add decoration", data.value);

                    }
                }
            });
        },
        editAnimationPlanningModal(id) {
            const animation = state.plannings.find(a => a.id == id);
            const anim = state.animations.find(a => a.id == animation.animationId);
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${this.days[moment(animation.dateTime).day()]} ${moment(animation.dateTime).date()} ${this.months[moment(animation.dateTime).month()]}`,
                html: `
            <div class="edit-anim-day-modal-container modal-container">
              <div class="animation-search-input">
                <input type="text" class="btn-input" value="${anim.label}" disabled/>
              </div>
              <div class="content-input">
                <input type="text" class="btn-input" id="planning-content-input" placeholder="Texte de remplacement" value="${anim.label == animation.content ? '' : animation.content}"/>
              </div>
              <div class="reccurence-inputs">
                <h2>Heure de la journée</h2>
                <div class="reccurence-hour">
                  <input type="text" class="btn-input" id="planning-hour-input" value="${moment(animation.dateTime).format('HH')}" placeholder="00" />
                  <div class="points-icon"></div>
                  <input type="text" class="btn-input" id="planning-minute-input" value="${moment(animation.dateTime).format('mm')}" placeholder="00" />
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
                    document.getElementById('planning-hour-input').addEventListener('input', (e) => {
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
                            document.getElementById('planning-minute-input').focus();
                        }
                    });
                    document.getElementById('planning-hour-input').addEventListener('focusout', (e) => {
                        if (e.target.value.length == 1) {
                            e.target.value = '0' + e.target.value;
                        }
                    });
                    document.getElementById('planning-minute-input').addEventListener('input', (e) => {
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
                            document.getElementById('planning-minute-input').focus();
                        }
                    });
                    document.getElementById('planning-minute-input').addEventListener('focusout', (e) => {
                        e.target.value = e.target.value - e.target.value % 5;
                        if (e.target.value.length == 1) {
                            e.target.value = '0' + e.target.value;
                        }
                    });
                    document.getElementById('planning-minute-input').addEventListener('keydown', (e) => {
                        if (e.key == "Backspace" && e.target.value.length == 0) {
                            document.getElementById('planning-hour-input').focus();
                        }
                    });
                },
                preConfirm: () => {
                    const values = {
                        id,
                        hour: document.getElementById('planning-hour-input').value,
                        minute: document.getElementById('planning-minute-input').value,
                        content: document.getElementById('planning-content-input').value,
                    };

                    if (!values.hour || !values.minute) {
                        Swal.showValidationMessage(`Vous devez sélectionner une heure.`);
                    }
                    if (values.content == "") {
                        values.content = anim.label;
                    }

                    values.dateTime = moment(animation.dateTime).set({ hour: values.hour, minute: values.minute }).format('YYYY-MM-DD HH:mm:ss');

                    return values;
                },
            }).then((data) => {
                if (data.isConfirmed) {
                    socket.emit("edit animation planning", data.value);
                }
                this.editPlanningModal(animation.dateTime);
            });
        },
        deleteAnimationPlanningModal(id) {
            const animation = state.plannings.find(a => a.id == id);
            Swal.fire({
                title: 'Êtes-vous sûr ?',
                text: `Vous allez supprimer l'animation "${animation.content}" le ${this.days[moment(animation.dateTime).day()]} ${moment(animation.dateTime).date()} ${this.months[moment(animation.dateTime).month()]} à ${moment(animation.dateTime).format('HH:mm').replace(':', 'h')}`,
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
                    socket.emit("delete animation planning", id);
                }
                this.editPlanningModal(animation.dateTime);
            });
        },
    },
    computed: {
        getUrl() {
            return state.url;
        },
    }
}
</script>

<template>
    <div class="day"
        @click="getCustomPlanning(day.date) ? customPlanningModal(day.date, $event) : addAnimationPlanningModal(day.date)">
        <span :class="{ 'month': day.isCurrentMonth }">{{ day.day }}</span>
        <div class="decoration-container justify-center" v-if="getDecoration(day.date, 1)">
            <img :src="getUrl + getDecoration(day.date, 1).icon.path.replace('./', '/')" alt="decoration" />
        </div>
        <div class="anim-list" :class="{ 'custom': getCustomPlanning(day.date) }">
            <div v-if="!getCustomPlanning(day.date)" class="anim" v-for="anim in getAnimationsPlanning(day.date)"
                :key="anim.id">
                <p class="content"><span class="hour">{{ anim.hour }}:</span>{{ anim.content }}</p>
            </div>
            <div class="custom" v-else>
                <p class="content">{{ getCustomPlanning(day.date).content }}</p>
            </div>
        </div>
        <div class="decoration-container" :class="getCustomPlanning(day.date) ? 'justify-center' : 'justify-end px-6'"
            v-if="getDecoration(day.date, 2)">
            <img :src="getUrl + getDecoration(day.date, 2).icon.path.replace('./', '/')" alt="decoration" />
        </div>
        <div class="select">
            <IconEdit v-if="getAnimationsPlanning(day.date).length" @click="editPlanningModal(day.date, $event)" />
            <IconImg v-if="getIconsListPlanning(day.date).length" @click="editImgPlanningModal(day.date, $event)" />
            <IconPlus v-if="!getCustomPlanning(day.date)" />
            <IconPaint @click="customPlanningModal(day.date, $event)" v-if="!getAnimationsPlanning(day.date).length" />
            <div class="custom">
                <IconImg v-if="getCustomPlanning(day.date)" @click="customImgPlanningModal(day.date, 1, $event)" />
                <IconImg v-if="getCustomPlanning(day.date)" @click="customImgPlanningModal(day.date, 2, $event)" />
            </div>
        </div>
    </div>
</template>

<style lang="scss"></style>
