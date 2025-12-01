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
        date: {
            type: String,
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
            return moment(this.date, 'DD-MM-YYYY').format('dddd DD MMMM YYYY');
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
        <table :class="isStaff ? 'staff-table' : 'resident-table'">
            <thead>
                <tr>
                    <th :rowspan="isStaff ? 1 : 2">{{ date }}</th>
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
                                <p>{{ row.eatingArea.midday }}</p>
                            </td>
                            <td>
                                <p>{{ row.eatingArea.evening }}</p>
                            </td>
                            <td v-for="kd in row.mealsList" :key="kd.id" :class="kd.isEvent ? 'event' : ''">
                                <p>{{ kd.value ? kd.value : '' }}</p>
                            </td>
                        </template>
                        <td :class="row.delivery.midday.isEvent ? 'event' : ''">
                            <p>{{ row.delivery.midday.value ? row.delivery.midday.value : '' }}</p>
                        </td>
                        <td :class="row.delivery.evening.isEvent ? 'event' : ''">
                            <p>{{ row.delivery.evening.value ? row.delivery.evening.value : '' }}</p>
                        </td>
                        <td v-for="kd in row.guestMealsList" :key="kd.id" :class="kd.value ? 'event' : ''">
                            <p>{{ kd.value ? kd.value : '' }}</p>
                        </td>
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
    </section>
</template>

<style lang="scss"></style>
