<script>
import { state, socket } from "@/socket";
import moment from "moment";

export default {
    components: {
    },
    props: {
        isStaff: {
            type: Boolean,
            required: true
        },
        period: {
            type: String,
            required: true
        },
        date: {
            type: Object,
            required: true
        },
        tableData: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
    },
    computed: {
        getCurrentDay() {
            if (!this.date) return '';
            return (this.period == "months") ? this.date.format('MMMM YYYY') : this.date.format('dddd DD MMMM YYYY');
        },
        getTotalRows() {
            const totals = {
                mealsList: [],
                delivery: {
                    midday: 0,
                    evening: 0
                },
                guestMealsList: []
            };
            this.tableData.rows.forEach(row => {
                row.mealsList.forEach(meal => {
                    const ml = totals.mealsList.find(m => m.id == meal.id);
                    if (ml) {
                        ml.value += meal.value ? meal.value : 0;
                    }
                    else {
                        totals.mealsList.push({
                            id: meal.id,
                            value: meal.value ? meal.value : 0
                        });
                    }
                });
                totals.delivery.midday += row.delivery.midday.value ? row.delivery.midday.value : 0;
                totals.delivery.evening += row.delivery.evening.value ? row.delivery.evening.value : 0;
                row.guestMealsList.forEach(guestMeal => {
                    const gml = totals.guestMealsList.find(m => m.id == guestMeal.id);
                    if (gml) {
                        gml.value += guestMeal.value ? guestMeal.value : 0;
                    }
                    else {
                        totals.guestMealsList.push({
                            id: guestMeal.id,
                            value: guestMeal.value ? guestMeal.value : 0
                        });
                    }
                });
            });
            if (this.isStaff) {
                totals.mealsGuestList = totals.mealsList.map(m => {
                    const currentGuestMeal = totals.guestMealsList.find(gm => gm.id == m.id);
                    return {
                        id: m.id,
                        value: currentGuestMeal ? currentGuestMeal.value + m.value : m.value
                    };
                });
            }
            return totals;
        }
    }
}
</script>

<template>
    <section class="export-page-component">
        <h2>{{ isStaff ? 'Personnels' : 'Résidents' }} - {{ getCurrentDay }}</h2>
        <table v-if="tableData.rows.length != 0" :class="isStaff ? 'staff-table' : 'resident-table'">
            <thead>
                <tr>
                    <th v-if="date" :rowspan="isStaff ? 1 : 2">{{ (period == "months") ? date.format('MM-YYYY') :
                        date.format('DD-MM-YYYY') }}</th>
                    <template v-if="isStaff">
                        <th v-for="kd in tableData.kindMeals" :key="kd.id">
                            <p>{{ kd.label }}</p>
                        </th>
                    </template>
                    <template v-else>
                        <th colspan="2">Lieu du repas</th>
                        <th :colspan="tableData.kindMeals.length">Repas</th>
                        <th colspan="2">Portage</th>
                        <th :colspan="tableData.kindMeals.length">Invités</th>
                    </template>
                </tr>
                <template v-if="!isStaff">
                    <tr>
                        <th>
                            <p>Midi</p>
                        </th>
                        <th>
                            <p>Soir</p>
                        </th>
                        <th v-for="kd in tableData.kindMeals">
                            <p>{{ kd.abbreviation ?? kd.label }}</p>
                        </th>
                        <th>
                            <p>Midi</p>
                        </th>
                        <th>
                            <p>Soir</p>
                        </th>
                        <th v-for="kd in tableData.kindMeals.filter(k => k.canGuest == true)">
                            <p>{{ kd.abbreviation ?? kd.label }}</p>
                        </th>
                    </tr>
                </template>
            </thead>
            <tbody v-if="tableData">
                <tr v-for="row in tableData.rows" :key="row.id">
                    <td>
                        <p>{{ row.userLabel }}</p>
                    </td>
                    <template v-if="isStaff">
                        <td v-if="row.mealsList.length" v-for="kd in row.mealsList" :key="kd.id">
                            <p>{{ kd.value ? kd.value : '' }}</p>
                        </td>
                        <td v-if="row.guestMealsList.length" v-for="kd in row.guestMealsList" :key="kd.id">
                            <p>{{ kd.value ? kd.value : '' }}</p>
                        </td>
                    </template>
                    <template v-else>
                        <template v-if="row.mealsList.length == 0">
                            <td colspan="2"></td>
                            <td v-for="kd in tableData.kindMeals"></td>
                        </template>
                        <template v-else>
                            <td>
                                <p>{{ (row.eating && row.eating.midday) ? row.eatingArea.midday : '' }}</p>
                            </td>
                            <td>
                                <p>{{ (row.eating && row.eating.evening) ? row.eatingArea.evening : '' }}</p>
                            </td>
                            <td v-for="kd in row.mealsList" :key="kd.id"
                                :class="(kd.isEvent && period == 'days') ? 'event' : ''">
                                <p>{{ kd.value ? kd.value : '' }}</p>
                            </td>
                        </template>
                        <td :class="(row.delivery.midday.isEvent && period == 'days') ? 'event' : ''">
                            <p>{{ row.delivery.midday.value ? row.delivery.midday.value : '' }}</p>
                        </td>
                        <td :class="(row.delivery.evening.isEvent && period == 'days') ? 'event' : ''">
                            <p>{{ row.delivery.evening.value ? row.delivery.evening.value : '' }}</p>
                        </td>
                        <td v-for="kd in row.guestMealsList" :key="kd.id"
                            :class="(kd.value && period == 'days') ? 'event' : ''">
                            <p>{{ kd.value ? kd.value : '' }}</p>
                        </td>
                    </template>
                    <div class="infos" v-if="row.infos && row.infos.length">
                        <p>{{row.infos.map(i => `${i.nb}: ${i.label}`).join(' ')}}</p>
                    </div>
                </tr>
                <tr v-for="index in 4">
                    <td>
                        <p></p>
                    </td>
                    <template v-if="isStaff">
                        <td v-if="tableData.kindMeals.length" v-for="kd in tableData.kindMeals" :key="kd.id"></td>
                    </template>
                    <template v-else>
                        <td colspan="2"></td>
                        <td v-for="kd in tableData.kindMeals"></td>
                        <td></td>
                        <td></td>
                        <td v-for="kd in tableData.kindMeals.filter(k => k.canGuest == true)"></td>
                    </template>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>
                        <p>Total</p>
                    </td>
                    <template v-if="isStaff">
                        <td v-for="kd in getTotalRows.mealsGuestList" :key="kd.id">
                            <p>{{ kd.value }}</p>
                        </td>
                    </template>
                    <template v-else>
                        <td colspan="2"></td>
                        <td v-for="kd in getTotalRows.mealsList" :key="kd.id">
                            <p>{{ kd.value }}</p>
                        </td>
                        <td>{{ getTotalRows.delivery ? getTotalRows.delivery.midday : 0 }}</td>
                        <td>{{ getTotalRows.delivery ? getTotalRows.delivery.evening : 0 }}</td>
                        <td v-for="kd in getTotalRows.guestMealsList" :key="kd.id">
                            <p>{{ kd.value }}</p>
                        </td>
                    </template>
                </tr>
            </tfoot>
        </table>
        <div v-else class="loading">
            <p>Chargement des données en cours</p>
            <div role="status">
                <svg aria-hidden="true" class="w-8 h-8 text-neutral-500 animate-spin fill-black" viewBox="0 0 100 101"
                    fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor" />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill" />
                </svg>
                <span class="sr-only">Chargement...</span>
            </div>
        </div>
    </section>
</template>

<style lang="scss"></style>
