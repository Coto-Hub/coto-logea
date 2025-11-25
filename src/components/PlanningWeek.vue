<script>
import moment from 'moment';
import { state, socket } from "@/socket";
import html2canvas from 'html2canvas';

export default {
    components: {
    },
    props: {
        startDate: {
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
            months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            config: false,
            choice: {
                text: "#000000",
                background: "#FFFFFF",
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
                ]
            }
        }
    },
    mounted() {
        this.reloadConfig();
        socket.on("config weeks info", ({ allWeekConfigs }) => {
            this.reloadConfig();
        });
    },
    methods: {
        saveConfig() {
            const config = state.week_configs.find(c => c.week == `${moment(this.startDate).week()}-${moment(this.startDate).year()}`);
            if (config) {
                socket.emit('edit week config', {
                    id: config.id,
                    text: this.choice.text,
                    background: this.choice.background,
                });
            } else {
                socket.emit('add week config', {
                    week: `${moment(this.startDate).week()}-${moment(this.startDate).year()}`,
                    text: this.choice.text,
                    background: this.choice.background,
                });
            }
            this.config = false;
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
                a.download = `planning-semaine-${moment(this.startDate).week()}.jpg`;
                a.click();
            });
        },
        chooseColor(hex) {
            this.choice[this.currentChoice] = hex;
        },
        getMonth(date) {
            return this.months[moment(date).month()];
        },
        getDay(date) {
            return this.days[moment(date).day()];
        },
        getDate(date) {
            return moment(date).date();
        },
        reloadConfig() {
            const config = state.week_configs.find(c => c.week == `${moment(this.startDate).week()}-${moment(this.startDate).year()}`);
            if (config) {
                this.choice.text = config.text;
                this.choice.background = config.background;
            }
        },
    },
    computed: {
        getCssColors() {
            return {
                "--background-color": this.choice.background,
                "--text-color": this.choice.text
            }
        },
        getColors() {
            return this.currentChoice ? this.colors[this.currentChoice] : [];
        },
        configIsSave() {
            const config = state.week_configs.find(c => c.week == `${moment(this.startDate).week()}-${moment(this.startDate).year()}`);
            return config && (config.text == this.choice.text && config.background == this.choice.background);
        },
        getStartDate() {
            return moment(this.startDate);
        },
        getEndDate() {
            return moment(this.startDate).add(6, 'd');
        },
        getWeek() {
            const startDate = moment(this.startDate);
            const week = [];
            for (let i = 0; i < 7; i++) {
                let isCustom = false;
                const currentDate = startDate.clone().add(i, 'd');
                const elements = state.plannings.filter((planning) => moment(planning.dateTime).isSame(currentDate, 'day')).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).map(
                    (planning) => {
                        if (planning.animationId == null) {
                            isCustom = true;
                            return {
                                id: planning.id,
                                content: planning.content,
                            }
                        }
                        else {
                            return {
                                id: planning.id,
                                content: planning.content,
                                hour: moment(planning.dateTime).minute() == 0 ? moment(planning.dateTime).format('HH') + 'h' : moment(planning.dateTime).format('HH:mm').replace(':', 'h'),
                                dayPart: moment(planning.dateTime).hour() <= 12 ? 'am' : 'pm',
                            }
                        }
                    }
                );
                week.push({
                    date: currentDate,
                    am: !isCustom ? elements.filter((element) => element.dayPart == 'am') : null,
                    pm: !isCustom ? elements.filter((element) => element.dayPart == 'pm') : null,
                    custom: isCustom ? elements[0] : null,
                    icons: state.decorations.filter((d) => moment(d.date).isSame(currentDate, 'day')).map(
                        (decoration) => {
                            const icon = state.icons.find((i) => i.id == decoration.iconId);
                            return {
                                id: decoration.id,
                                placement: decoration.placementChoice,
                                iconPath: `${state.url}${icon.path.replace('./', '/')}`,
                                iconName: icon.name,
                            }
                            // const iconAnimation = state.animations.find((a) => a.icons.find((i) => i.id == decoration.iconId));
                            // if (iconAnimation && iconAnimation.icons) {
                            //     const icon = iconAnimation.icons.find((i) => i.id == decoration.iconId);
                            //     return {
                            //         id: decoration.id,
                            //         placement: decoration.placementChoice,
                            //         iconPath: `${state.url}${icon.path.replace('./', '/')}`,
                            //         iconName: icon.name,
                            //     }
                            // }
                        }
                    )
                });
            }
            return week;
        }
    }
}
</script>

<template>
    <div class="page-week">
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
                <div class="head">
                    <div class="logo">
                        <img src="/logo-logea.png" alt="Logo de la Villa Marguerite" />
                    </div>
                    <div class="contact">
                        <p>28 Bis Boulevard de Bury</p>
                        <p>16000 Angoulême</p>
                        <p>05 45 37 60 60</p>
                        <p>villamarguerite@logea.asso.fr</p>
                    </div>
                </div>
                <div class="title">
                    <h1>Les moments de partage de la Villa Marguerite</h1>
                    <h1>Du {{ getStartDate.format('DD/MM') }} au {{ getEndDate.format('DD/MM') }}</h1>
                </div>
            </div>
            <div class="table-border">
                <table class="planning-table">
                    <tbody class="planning-body" id="planning-body">
                        <tr v-for="(day, index) in getWeek">
                            <td>
                                <div class="day">
                                    <p>{{ getDay(day.date) }}</p>
                                    <p>{{ getDate(day.date) }}</p>
                                    <p>{{ getMonth(day.date) }}</p>
                                </div>
                            </td>
                            <td :colspan="(index >= 5 || day.custom) ? 2 : 1">
                                <div class="flex w-full h-full" :class="{ 'custom-container': day.custom }">
                                    <div class="anim-list anim-am" v-if="!day.custom">
                                        <p v-html="(index < 5 ? day.am : day.am.concat(day.pm)).map((e) => `<span class='hour'>${e.hour}:</span>
                                            ${e.content}`).join('<br>')">
                                        </p>
                                        <!-- <div class="anim"
                                            v-for="element in (index < 5 ? day.am : day.am.concat(day.pm))"
                                            :key="element.id">
                                            <p class="content" :class="{ 'custom-wrap': element.content.length > 18 }">
                                                <span class="hour">{{ element.hour }}:</span>
                                                {{ element.content }}
                                            </p>
                                        </div> -->
                                    </div>
                                    <div class="icon-container"
                                        v-if="day.icons.length && day.icons.find(i => i.placement == 1)">
                                        <img :src="day.icons.find(i => i.placement == 1).iconPath" alt="decoration"
                                            loading="lazy" />
                                    </div>
                                    <div class="custom" v-if="day.custom">
                                        <p class="content">{{ day.custom.content }}</p>
                                    </div>
                                    <div class="icon-container"
                                        v-if="(day.custom || index >= 5) && day.icons.length && day.icons.find(i => i.placement == 2)">
                                        <img :src="day.icons.find(i => i.placement == 2).iconPath" alt="decoration"
                                            loading="lazy" />
                                    </div>
                                </div>
                            </td>
                            <td v-if="(index < 5 && !day.custom)">
                                <div class="flex w-full h-full">
                                    <div class="anim-list anim-pm">
                                        <p
                                            v-html="day.pm.map((e) => `<span class='hour'>${e.hour}:</span>
                                            ${e.content}`).join('<br>') +
                                                (day.icons.length && day.icons.find(i => i.placement == 2) ? `<img class='icon' src='${day.icons.find(i => i.placement == 2).iconPath}' alt='decoration' loading='lazy' />` : '')">
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="page-btn left">
            <button class="btn btn-cancel" @click="$emit('closePlanningWeek')">Fermer</button>
        </div>
        <div class="page-btn right">
            <button class="btn btn-confirm" v-if="configIsSave" @click="printPlanning">Imprimer</button>
            <button class="btn btn-default" v-else @click="saveConfig">Enregistrer</button>
        </div>
    </div>
</template>

<style lang="scss">
.page-week {
    @apply fixed inset-0 bg-white p-4 flex justify-center items-center;

    .planning-export {
        @apply flex flex-col items-center h-full overflow-hidden p-2;
        aspect-ratio: 210/297;
        background-color: var(--background-color);

        .planning-header {
            @apply flex flex-col items-center justify-between px-2 relative w-full;
            height: 17%;

            .head {
                @apply flex justify-between;
            }

            .logo {
                @apply w-1/4 flex items-center justify-center;
            }

            .title {
                @apply text-center w-full;
                font-family: "Lazy Dog Regular";

                h1 {
                    @apply text-lg font-bold p-0 font-sans;
                }

                h2 {
                    @apply text-4xl font-bold;
                    color: var(--text-color);
                }
            }

            .contact {
                @apply text-center;
                color: #00437A;

                p {
                    @apply text-sm font-medium;
                }
            }
        }

        .table-border {
            @apply flex w-full h-full;
        }

        .planning-table {
            @apply w-full h-full border-none text-xs border-collapse;
            table-layout: fixed;

            tr td {
                height: calc(100% / 7) !important;
                max-height: calc(100% / 7) !important;
            }

            tr {
                @apply border-b-2 border-black;

                &:not(tr:first-child):last-child {
                    @apply border-b-0;
                }

                td {
                    width: calc(80% / 2);

                    .anim-list {
                        @apply w-full;

                        .content {
                            @apply w-full text-wrap;
                        }
                    }

                    &:first-child {
                        @apply w-[20%];

                        .day {
                            @apply flex flex-col items-center justify-center h-full p-2 text-center;

                            p {
                                @apply text-lg font-bold;
                                color: var(--text-color);
                                font-family: 'Lazy Dog Regular';
                            }
                        }
                    }

                    &:not(:last-child) {
                        @apply border-r-2 border-black;
                    }

                    &:not(:first-child) {
                        @apply h-full;

                        .anim-list {
                            @apply h-full p-1 text-base tracking-wide overflow-hidden max-h-full flex items-center;

                            p {
                                @apply w-full leading-6;

                                .hour {
                                    @apply font-semibold pr-1;
                                }

                                .icon {
                                    @apply float-right max-w-11 max-h-11 mt-1;
                                }

                                .span~span {
                                    ~.icon {
                                        @apply -mt-4;
                                    }

                                    ~span~.icon {
                                        @apply -mt-6;
                                    }
                                }
                            }
                        }

                        .custom {
                            @apply w-1/2 flex justify-center items-center;

                            .content {
                                @apply text-lg font-bold text-center;

                                &.custom-wrap {
                                    @apply text-wrap min-w-[12vw];
                                }
                            }
                        }

                        .custom-container {
                            @apply text-xl;
                            font-family: "Lazy Dog Regular";

                            .icon-container {
                                @apply w-1/3 flex justify-center items-center self-center mb-0;

                                img {
                                    @apply w-auto max-h-[8vh] max-w-[90%];
                                }
                            }
                        }

                        .icon-container {
                            @apply max-w-24 self-center px-1;
                        }
                    }
                }

                &:nth-child(6),
                &:nth-child(7) {
                    td {
                        .anim-list {
                            @apply w-auto;

                            p {
                                @apply leading-8 w-full;
                            }
                        }

                        .icon-container {
                            @apply flex flex-col max-w-none w-1/4 items-center self-center mb-0;

                            img {
                                @apply w-auto object-center max-h-[8vh] max-w-[90%];
                            }
                        }
                    }
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
