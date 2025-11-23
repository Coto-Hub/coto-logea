<script>
import moment from 'moment';
import Swal from "sweetalert2";
import { state, socket } from "@/socket";
import IconImg from "@/components/icons/IconImg.vue";
import html2canvas from 'html2canvas';

export default {
    components: {
        IconImg,
    },
    props: {
        weeks: {
            type: Array,
            required: true
        },
        monthString: {
            type: String,
            required: true
        },
        month: {
            type: String,
            required: true
        },
        refreshKey: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            config: false,
            choice: {
                text: "#000000",
                background: "#FFFFFF",
                date: "#000000",
            },
            showIcons: {
                left: null,
                right: null,
            },
            iconLeft: {
                path: null,
                name: null,
                id: null,
            },
            iconRight: {
                path: null,
                name: null,
                id: null,
            },
            currentChoice: "text",
            colors: {
                background: [
                    "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
                    "#FFB3E6", "#B3FFD9", "#FFC3A0", "#F3C5FF", "#B5D6D6",
                    "#FFCCF9", "#FFDEB4", "#FFD700", "#B0E57C", "#D4A5A5",
                    "#C2E8FF", "#FEC8D8", "#D4B3FF", "#A5E2C2", "#FFBE76",
                    "#B2A4FF", "#F5A623", "#B8B8FF", "#E3CF57", "#A0E6FF",
                    "#F9D8E7", "#FFBABA", "#C5FFFD", "#FFE4C4", "#B7E3A7",
                    "#FFDAC1", "#E2A9E5", "#B5C7C7", "#E6B3B3", "#FFC4D6",
                    "#FFAAFF", "#C4E17F", "#D0BFFF", "#FFABAB", "#D3F4FF",
                    "#A2D5F2", "#F7BB97", "#C4FCEF", "#FFDFE5", "#BFFCC6",
                    "#FFE5E5", "#FFE4E1", "#F5D0C5", "#F3E5AB", "#F6E8EA",
                    "#B5EAD7", "#E3B5A4", "#FFF2CC", "#B6D7A8", "#FFEAD0",
                    "#D6B0B1", "#FFC7C7", "#D3D3F3", "#C2C1C1", "#FDE2E2"
                ],
                text: [
                    "#FF5733", "#C70039", "#900C3F", "#581845", "#6C3483",
                    "#1F618D", "#117A65", "#138D75", "#1E8449", "#B7950B",
                    "#AF601A", "#884EA0", "#2E4053", "#616A6B", "#943126",
                    "#5D6D7E", "#A93226", "#34495E", "#A9DFBF", "#5DADE2",
                    "#2C3E50", "#34495E", "#16A085", "#27AE60", "#2980B9",
                    "#8E44AD", "#2C3E50", "#F39C12", "#D35400", "#E74C3C",
                    "#C0392B", "#7F8C8D", "#95A5A6", "#BDC3C7", "#34495E",
                    "#1ABC9C", "#3498DB", "#9B59B6", "#F1C40F", "#E67E22"
                ],
                date: [
                    "#FF5733", "#C70039", "#900C3F", "#581845", "#6C3483",
                    "#1F618D", "#117A65", "#138D75", "#1E8449", "#B7950B",
                    "#AF601A", "#884EA0", "#2E4053", "#616A6B", "#943126",
                    "#5D6D7E", "#A93226", "#34495E", "#A9DFBF", "#5DADE2",
                    "#2C3E50", "#34495E", "#16A085", "#27AE60", "#2980B9",
                    "#8E44AD", "#2C3E50", "#F39C12", "#D35400", "#E74C3C",
                    "#C0392B", "#7F8C8D", "#95A5A6", "#BDC3C7", "#34495E",
                    "#1ABC9C", "#3498DB", "#9B59B6", "#F1C40F", "#E67E22"
                ]
            }
        }
    },
    mounted() {
        this.reloadConfig();

        socket.on("config months info", ({ allMonthConfigs }) => {
            this.reloadConfig();
        });
    },
    methods: {
        getPlanningsForDay(day) {
            const planningDay = {
                date: null,
                startDeco: null,
                endDeco: null,
                content: null,
            };
            const animations = state.plannings.filter(p => moment(p.dateTime).format('YYYY-MM-DD') == moment(day.date).format('YYYY-MM-DD'));
            const decorations = state.decorations.filter(d => moment(d.date).format('YYYY-MM-DD') == moment(day.date).format('YYYY-MM-DD'));
            if (animations.length > 0) {
                planningDay.date = day.date;
                if (decorations.length) {
                    decorations.forEach(d => {
                        if (d.placementChoice == 1) {
                            planningDay.startDeco = {
                                id: d.id,
                                icon: state.icons.find(i => i.id == d.iconId),
                            };
                        }
                        else if (d.placementChoice == 2) {
                            planningDay.endDeco = {
                                id: d.id,
                                icon: state.icons.find(i => i.id == d.iconId),
                            };
                        }
                    });
                }
                if (animations.length == 1 && animations[0].animationId == null) {
                    planningDay.content = animations[0].content;
                }
                else {
                    planningDay.content = [];
                    animations.map(p => {
                        if (p.animationId != null) {
                            const anim = state.animations.find(a => a.id == p.animationId);
                            planningDay.content.push({
                                id: p.id,
                                animationId: p.animationId,
                                content: p.content,
                                hour: moment(p.dateTime).minute() == 0 ? moment(p.dateTime).format('HH') + 'h' : moment(p.dateTime).format('HH:mm').replace(':', 'h'),
                                label: anim ? anim.label : 'Animation supprimée',
                                dateTime: p.dateTime,
                            });
                        }
                    });
                    planningDay.content.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
                }
            }
            return planningDay;
        },
        getAnimationsPlanning(date) {
            return false;
            const todayList = state.plannings.filter(p => moment(p.dateTime).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD'));
            return todayList.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).map(a => {
                return {
                    id: a.id,
                    content: a.content,
                    hour: moment(a.dateTime).minute() == 0 ? moment(a.dateTime).format('HH') + 'h' : moment(a.dateTime).format('HH:mm').replace(':', 'h'),
                };
            });
        },
        printPlanning() {
            html2canvas(document.querySelector("#planning-export"), {
                allowTaint: true,
                logging: true,
                profile: true,
                useCORS: true,
                scale: 4,
            }).then(canvas => {
                var a = document.createElement('a');
                a.href = canvas.toDataURL();
                a.download = `planning-${this.month}.jpg`;
                a.click();
            });
        },
        chooseColor(hex) {
            this.choice[this.currentChoice] = hex;
        },
        getCustomPlanning(date) {
            return false;
            const today = state.plannings.find(p => moment(p.dateTime).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') && p.animationId == null);
            if (today) {
                return {
                    id: today.id,
                    content: today.content,
                };
            }
        },
        getDecoration(date, placementChoice) {
            return false;
            const decoration = state.decorations.find(d => moment(d.date).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') && d.placementChoice == placementChoice);
            if (decoration) {
                let icon = state.icons.find(i => i.id == decoration.iconId);
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
        saveConfig() {
            const config = state.month_configs.find(c => c.month == this.month);
            if (config) {
                socket.emit('edit month config', {
                    id: config.id,
                    month: this.month,
                    text: this.choice.text,
                    background: this.choice.background,
                    date: this.choice.date,
                    iconLeft: this.iconLeft,
                    iconRight: this.iconRight,
                });
            } else {
                socket.emit('add month config', {
                    month: this.month,
                    text: this.choice.text,
                    background: this.choice.background,
                    date: this.choice.date,
                    iconLeft: this.iconLeft,
                    iconRight: this.iconRight,
                });
            }
            this.config = false;
        },
        changeIcon(side) {
            const defaultIcons = state.animations.find(a => a.label == "").icons;
            const currentIcon = defaultIcons.find(i => i.id == (side == 'left' ? this.iconLeft.id : this.iconRight.id));
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `Icône de ${side == 'left' ? 'gauche' : 'droite'}`,
                html: `
                <div class="edit-icon-container modal-container" id="edit-icon-container" data-id="${currentIcon ? currentIcon.id : null}">
                    <div class="icons-list" id="icons-list-edit" data-choice="${currentIcon ? currentIcon.id : null}">
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
                                <img src="${state.url}${icon.path.replace('./', '/')}" alt="${icon.label}" loading="lazy" />
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
                    if (data.value.iconId == "new") {
                        if (side == 'left') {
                            this.iconLeft.path = data.value.img.src;
                            this.iconLeft.name = data.value.img.name;
                            this.iconLeft.id = null;
                        } else {
                            this.iconRight.path = data.value.img.src;
                            this.iconRight.name = data.value.img.name;
                            this.iconRight.id = null;

                        }
                    }
                    else if (data.value.iconId != "null") {
                        if (side == 'left') {
                            this.iconLeft.path = null;
                            this.iconLeft.name = null;
                            this.iconLeft.id = data.value.iconId;
                        } else {
                            this.iconRight.path = null;
                            this.iconRight.name = null;
                            this.iconRight.id = data.value.iconId;
                        }
                    } else {
                        if (side == 'left') {
                            this.iconLeft.path = null;
                            this.iconLeft.name = null;
                            this.iconLeft.id = null;
                        } else {
                            this.iconRight.path = null;
                            this.iconRight.name = null;
                            this.iconRight.id = null;
                        }
                    }

                    if (side == 'left') {
                        if (data.value.iconId == "new") {
                            this.showIcons.left = data.value.img.src;
                        }
                        else if (data.value.iconId == "null") {
                            this.showIcons.left = null;
                        }
                        else {
                            const currentIcon = defaultIcons.find(i => i.id == data.value.iconId);
                            if (currentIcon) {
                                this.showIcons.left = `${state.url}${currentIcon.path.replace('./', '/')}`;
                            }
                        }
                    } else {
                        if (data.value.iconId == "new") {
                            this.showIcons.right = data.value.img.src;
                        }
                        else if (data.value.iconId == "null") {
                            this.showIcons.right = null;
                        }
                        else {
                            const currentIcon = defaultIcons.find(i => i.id == data.value.iconId);
                            if (currentIcon) {
                                this.showIcons.right = `${state.url}${currentIcon.path.replace('./', '/')}`;
                            }
                        }
                    }
                }
            });
        },
        getBase64Img(icon) {
            return `${state.url}${icon.path.replace('./', '/')}`;
        },
        reloadConfig() {
            const config = state.month_configs.find(c => c.month == this.month);
            if (config) {
                this.choice.text = config.text;
                this.choice.background = config.background;
                this.choice.date = config.date;

                if (config.iconLeftId) {
                    this.iconLeft.id = config.iconLeftId;
                    if (state.animations.find(a => a.icons.find(i => i.id == config.iconLeftId))) {
                        const icon = state.animations.find(a => a.icons.find(i => i.id == config.iconLeftId)).icons.find(i => i.id == config.iconLeftId);
                        this.showIcons.left = `${state.url}${icon.path.replace('./', '/')}`;
                    }
                }
                if (config.iconRightId) {
                    this.iconRight.id = config.iconRightId;
                    if (state.animations.find(a => a.icons.find(i => i.id == config.iconRightId))) {
                        const icon = state.animations.find(a => a.icons.find(i => i.id == config.iconRightId)).icons.find(i => i.id == config.iconRightId);
                        this.showIcons.right = `${state.url}${icon.path.replace('./', '/')}`;
                    }
                }
            }
        },
    },
    computed: {
        getUrl() {
            return state.url;
        },
        configIsSave() {
            const config = state.month_configs ? state.month_configs.find(c => c.month == this.month) : null;
            return config && config.text == this.choice.text && config.background == this.choice.background && config.date == this.choice.date && config.iconLeftId == this.iconLeft.id && config.iconRightId == this.iconRight.id && this.iconLeft.path == null && this.iconRight.path == null;
        },
        getColors() {
            return this.currentChoice ? this.colors[this.currentChoice] : [];
        },
        getCssColors() {
            return {
                '--text-color': this.choice.text,
                '--background-color': this.choice.background,
                '--date-color': this.choice.date,
            };
        },
        getPlanningsForMonth() {
            return this.weeks.map(week => week.map(day => {
                return {
                    ...this.getPlanningsForDay(day),
                    day: day.day,
                    isCurrentMonth: day.isCurrentMonth,
                }
            }));
        }
    }
}
</script>

<template>
    <div class="page-month">
        <div class="planning-config" :class="{ 'active': config }">
            <div class="config-btn" @click="config = !config"></div>
            <div class="config-container">
                <h2>Choix des couleurs</h2>
                <div class="colors-config">
                    <div class="color-config-container" :class="{ 'active': currentChoice == 'text' }"
                        @click="currentChoice = 'text'">
                        <p>Texte</p>
                        <div class="color" :style="{ 'background-color': choice.text }"></div>
                    </div>
                    <div class="color-config-container" :class="{ 'active': currentChoice == 'background' }"
                        @click="currentChoice = 'background'">
                        <p>Fond</p>
                        <div class="color" :style="{ 'background-color': choice.background }"></div>
                    </div>
                    <div class="color-config-container" :class="{ 'active': currentChoice == 'date' }"
                        @click="currentChoice = 'date'">
                        <p>Date</p>
                        <div class="color" :style="{ 'background-color': choice.date }"></div>
                    </div>
                </div>
                <div class="color-list-choice">
                    <div class="color" v-for="color in getColors" :key="color" :style="{ 'background-color': color }"
                        @click="chooseColor(color)">
                    </div>
                </div>
                <div class="color-input">
                    <input type="color" v-model="choice[currentChoice]" @input="chooseColor(choice[currentChoice])" />
                </div>
            </div>
        </div>
        <div class="planning-export" id="planning-export" :style="getCssColors">
            <div class="planning-header">
                <div class="logo">
                    <img src="/logo-logea.png" alt="Logo de la Villa Marguerite" />
                </div>
                <div class="icon-left">
                    <label class="icon-label" @click="changeIcon('left')">
                        <div class="img-icon-container">
                            <img v-if="showIcons.left" :src="showIcons.left" alt="Icône de gauche" loading="lazy" />
                        </div>
                        <IconImg />
                    </label>
                </div>
                <div class="title">
                    <h1>Planning mensuel</h1>
                    <h2>{{ monthString }}</h2>
                </div>
                <div class="icon-right">
                    <label class="icon-label" @click="changeIcon('right')">
                        <div class="img-icon-container">
                            <img v-if="showIcons.right" :src="showIcons.right" alt="Icône de gauche" loading="lazy" />
                            <IconImg />
                        </div>
                    </label>
                </div>
                <div class="contact">
                    <p>28 Bis Boulevard de Bury</p>
                    <p>16000 Angoulême</p>
                    <p>05 45 37 60 60</p>
                    <p>villamarguerite@logea.asso.fr</p>
                </div>
            </div>
            <div class="table-border">
                <table class="planning-table">
                    <thead class="planning-head">
                        <tr>
                            <th>
                                <p>Lundi</p>
                            </th>
                            <th>
                                <p>Mardi</p>
                            </th>
                            <th>
                                <p>Mercredi</p>
                            </th>
                            <th>
                                <p>Jeudi</p>
                            </th>
                            <th>
                                <p>Vendredi</p>
                            </th>
                            <th>
                                <p>Samedi</p>
                            </th>
                            <th>
                                <p>Dimanche</p>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="planning-body" id="planning-body">
                        <tr v-for="week in getPlanningsForMonth">
                            <td v-for="planningDay in week">
                                <div class="day-print" :class="{
                                    'justify-start': planningDay.startDeco && Array.isArray(planningDay.content),
                                    'justify-end': planningDay.endDeco && Array.isArray(planningDay.content),
                                    'justify-center': (!planningDay.startDeco && !planningDay.endDeco) || !Array.isArray(planningDay.content),
                                }">
                                    <span :class="{ 'month': planningDay.isCurrentMonth }">{{ planningDay.day }}</span>
                                    <div class="decoration-container justify-center"
                                        :data-nb="Array.isArray(planningDay.content) ? `${planningDay.content.length}` : '1'"
                                        v-if="planningDay.startDeco && Array.isArray(planningDay.content) && planningDay.content.length < 4">
                                        <img :src="getBase64Img(planningDay.startDeco.icon)" alt="decoration"
                                            loading="lazy" />
                                    </div>
                                    <div class="anim-list" :class="{ 'custom': !Array.isArray(planningDay.content) }"
                                        :data-nb="Array.isArray(planningDay.content) ? `${planningDay.content.length}` : '1'">
                                        <div v-if="Array.isArray(planningDay.content)" class="anim"
                                            v-for="anim in planningDay.content" :key="anim.id">
                                            <p class="content"><span class="hour">{{ anim.hour }}:</span>{{
                                                anim.content }}</p>
                                        </div>
                                        <div class="custom" v-else>
                                            <p class="content">{{ planningDay.content }}</p>
                                        </div>
                                    </div>
                                    <div class="decoration-container"
                                        :data-nb="Array.isArray(planningDay.content) ? `${planningDay.content.length}` : '1'"
                                        :class="`${!Array.isArray(planningDay.content) ? 'justify-center' : 'justify-end px-6'}`"
                                        v-if="planningDay.endDeco && Array.isArray(planningDay.content) && planningDay.content.length < 4">
                                        <img :src="getBase64Img(planningDay.endDeco.icon)" alt="decoration"
                                            loading="lazy" />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="page-btn left">
            <button class="btn btn-cancel" @click="$emit('closePlanning')">Fermer</button>
        </div>
        <div class="page-btn right">
            <button class="btn btn-confirm" v-if="configIsSave" @click="printPlanning">Imprimer</button>
            <button class="btn btn-default" v-else @click="saveConfig">Enregistrer</button>
        </div>
    </div>
</template>

<style lang="scss">
.page-month {
    @apply fixed inset-0 bg-white p-4 flex justify-center items-center;

    .planning-export {
        @apply flex flex-col items-center justify-center h-full overflow-hidden p-2;
        aspect-ratio: 297/210;
        background-color: var(--background-color);

        .planning-header {
            @apply flex items-center justify-center relative w-full h-[10vh];

            .logo {
                @apply absolute top-1/2 -translate-y-1/2 left-[2.5%] w-36;
            }

            .title {
                @apply text-center w-1/3;
                font-family: "Lazy Dog Regular";

                h1 {
                    @apply text-3xl font-bold p-0;
                }

                h2 {
                    @apply text-4xl font-bold;
                    color: var(--text-color);
                }
            }

            .contact {
                @apply absolute top-1/2 -translate-y-1/2 right-3 text-center;
                color: #00437A;

                p {
                    @apply text-sm font-medium;
                }
            }

            .icon-left,
            .icon-right {
                @apply w-1/6 h-full p-2 flex flex-col items-center justify-center overflow-hidden;

                input {
                    @apply hidden;
                }

                label {
                    @apply relative w-full h-full;

                    .img-icon-container {
                        @apply absolute w-full h-full flex items-center justify-center;

                        img {
                            @apply object-contain h-full;
                        }
                    }

                    .img-icon {
                        @apply hidden absolute h-full w-full object-contain fill-gray-200 stroke-gray-600 cursor-pointer;
                    }

                    &:hover .img-icon {
                        @apply flex;
                    }
                }
            }
        }

        .table-border {
            @apply flex w-full;
            height: calc(100% - 5.5rem);
        }

        .planning-table {
            @apply w-full h-full border-2 border-black text-xs border-collapse;

            th {
                @apply text-center font-bold text-lg;
                width: calc(100% / 7);
                color: var(--text-color);
            }

            thead {
                height: 7%;

                tr,
                th {
                    @apply h-full;
                }

                p {
                    @apply w-full h-full flex items-center justify-center;
                }
            }

            th,
            td {
                @apply border-r-2 border-black;

                &:last-child {
                    @apply border-r-0;
                }
            }

            tr {
                @apply border-b-2 border-black;

                &:not(tr:first-child):last-child {
                    @apply border-b-0;
                }
            }

            tbody {
                height: 93%;
            }

            td {
                @apply relative;
                width: calc(100% / 7);
                height: calc(100% / 5.25);
            }

            .day-print {
                @apply inset-0 absolute overflow-hidden flex items-center;
                @apply flex flex-col;

                &>span {
                    @apply absolute top-0 right-2 font-semibold text-xl opacity-50;
                    color: var(--date-color);

                    &.month {
                        @apply opacity-100;
                    }
                }

                .decoration-container {
                    @apply h-[25%] w-full flex pt-1;

                    img {
                        // @apply h-full;
                        @apply object-contain;
                    }


                    &[data-nb="2"],
                    &[data-nb="3"] {
                        @apply h-[30%] pt-3;
                    }

                    &[data-nb="1"] {
                        @apply h-[30%];
                    }
                }

                .anim-list+.decoration-container {
                    @apply pt-0 pb-2;
                }
            }

            .decoration-container+.anim-list {
                @apply pt-0;
            }

            .anim-list {
                @apply flex flex-col items-center justify-around w-full overflow-hidden pt-2.5 flex-none;

                .anim {
                    @apply flex items-center px-1 font-medium;
                    font-size: 0.9rem;
                    line-height: 1.5rem;

                    .hour {
                        @apply mr-1.5 font-bold;
                    }

                    .content {
                        @apply text-center;
                    }
                }

                .custom {
                    @apply px-1 py-1 text-base text-center;
                    font-family: "Lazy Dog Regular";
                }

                &[data-nb="1"] {
                    @apply space-y-1;
                }

                &[data-nb="2"] {
                    @apply space-y-2 pt-2;
                }
            }
        }
    }

    .page-btn {
        @apply flex absolute bottom-4 bg-gray-100 rounded-xl;

        .btn {
            @apply shadow-md;
        }

        &.left {
            @apply left-1/4;
        }

        &.right {
            @apply right-1/4;
        }

        .btn-default {
            @apply border-gray-500/70 bg-gray-300/30;

            &:hover {
                @apply bg-white/40 border-white/10;
            }
        }
    }

    .planning-config {
        @apply absolute w-1/4 flex flex-col items-center justify-center bg-gray-100 h-full z-10 border-l-8 border-gray-300;
        @apply right-0 translate-x-full;
        transition: all 0.3s ease-in-out;

        .config-container {
            @apply flex flex-col items-center justify-center w-full h-full space-y-7;

            h2 {
                @apply text-2xl font-bold mb-4;
            }

            .colors-config {
                @apply flex items-center justify-around w-full mb-4;

                .color-config-container {
                    @apply flex flex-col items-center cursor-pointer border-4 border-gray-300 rounded-lg px-4 pb-2;

                    p {
                        @apply text-lg font-semibold mb-1;
                    }

                    .color {
                        @apply w-8 h-8 border border-black rounded-full;
                    }

                    &.active {
                        @apply border-blue-500;
                    }
                }
            }

            .color-list-choice {
                @apply flex items-center justify-around flex-wrap w-4/5 h-1/6 overflow-y-scroll gap-3 border-2 border-gray-300 rounded-lg p-2;

                .color {
                    @apply w-8 h-8 border-black rounded-full cursor-pointer;
                }
            }
        }

        .config-btn {
            @apply absolute top-1/2 -left-8 w-6 h-20 bg-gray-600 rounded-l-full cursor-pointer;

            &:hover {
                @apply bg-gray-400;
            }
        }

        &.active {
            @apply translate-x-0;
        }
    }
}
</style>
