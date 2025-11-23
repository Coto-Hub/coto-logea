<script>
import moment from 'moment';
import { state, socket } from "@/socket";
import DayContainer from "@/components/DayContainer.vue";
import WaitingComponent from "@/components/WaitingComponent.vue";

export default {
    components: {
        WaitingComponent,
        DayContainer,
    },
    props: {
        weeks: {
            type: Array,
            required: true
        },
        loading: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            skipInit: false,
        }
    },
    mounted() {
    },
    methods: {
        // Children content
        getPlanningsForDay(day) {
            const planningDay = {
                date: null,
                startDeco: null,
                endDeco: null,
                content: null,
            };
            const animations = state.plannings.filter(p => moment(p.dateTime).format('YYYY-MM-DD') == moment(day.date).format('YYYY-MM-DD'));
            const decorations = state.decorations.filter(d => moment(d.date).format('YYYY-MM-DD') == moment(day.date).format('YYYY-MM-DD'));
            planningDay.date = day.date;
            if (animations.length > 0) {
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
                                hour: moment(p.dateTime).format('HH:mm').replace('h00', 'h'),
                                label: anim ? anim.label : 'Animation supprimée',
                                dateTime: moment(p.dateTime),
                            });
                        }
                    });
                    planningDay.content.sort((a, b) => moment(a.dateTime).diff(moment(b.dateTime)));
                }
            }
            return planningDay;
        },
    },
    computed: {
        getAnimationsForMonth() {
            if (!this.weeks || this.weeks.length == 0) {
                return false;
            }
            const firstDay = this.weeks[0][0].date;
            const lastDay = this.weeks[this.weeks.length - 1][this.weeks[this.weeks.length - 1].length - 1].date;
            return state.plannings.filter(p => moment(p.dateTime).isBetween(firstDay, lastDay));
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
        // getAnimationsForMonth() {
        //     if (!this.weeks || this.weeks.length == 0) {
        //         return false;
        //     }
        //     const firstDay = this.weeks[0][0].date;
        //     const lastDay = this.weeks[this.weeks.length - 1][this.weeks[this.weeks.length - 1].length - 1].date;
        //     return state.plannings.filter(p => moment(p.dateTime).isBetween(firstDay, lastDay)).map((a) => {
        //         return {
        //             id: a.id,
        //             content: a.content,
        //             date: a.dateTime.split('T')[0],
        //             hour: moment(a.dateTime).minute() == 0 ? moment(a.dateTime).format('HH') + 'h' : moment(a.dateTime).format('HH:mm').replace(':', 'h'),
        //         };
        //     });
        // },
    }
}
</script>

<template>
    <section class="general-input" v-if="!loading">
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
                <tr v-for="week in getPlanningsForMonth">
                    <td v-for="day in week">
                        <DayContainer :day="day.day" :planningDay="day"
                            @customiseImgModal="(container, image) => $emit('customiseImgModal', container, image)"
                            @customPlanningModal="(date, event) => $emit('customPlanningModal', date, event)"
                            @addAnimationPlanningModal="(date) => $emit('addAnimationPlanningModal', date)"
                            @editImgPlanningModal="(date, placement, event) => $emit('editImgPlanningModal', date, placement, event)"
                            @editPlanningModal="(date, event) => $emit('editPlanningModal', date, event)"
                            @deleteCustomPlanningModal="(date) => $emit('deleteCustomPlanningModal', date)" />
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
    <WaitingComponent v-else />
</template>

<style lang="scss"></style>
