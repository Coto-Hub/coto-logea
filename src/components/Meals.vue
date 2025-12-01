<script>
import moment from 'moment';
import Swal from "sweetalert2";
import { socket, state } from "@/socket";

export default {
    components: {
    },
    props: {
        isStaffMealView: {
            type: Boolean,
            required: true
        },
        kindMeals: {
            type: Array,
            required: true
        },
        usersWithData: {
            type: Array,
            required: true
        },
        date: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            userSearch: '',
            dataHoverMealId: null,
        }
    },
    mounted() {
    },
    methods: {
        userNewEvent(userId, kindMeal, delivery) {
            const kindMealData = state.kindMeals.find(kd => kd.id === kindMeal.id);
            const user = state.users.find(u => u.id === userId);
            Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-confirm",
                    cancelButton: "btn btn-cancel",
                    title: 'text-2xl',
                },
                buttonsStyling: false
            }).fire({
                title: `${((kindMeal.meal && !delivery) || (delivery && kindMeal.delivery)) ? 'Retirer' : 'Ajouter'} ${(delivery || kindMeal.delivery) ? (!kindMeal.meal || (kindMeal.delivery && !delivery) ? 'le repas et le plateau' : 'le plateau') : 'le repas'} du ${kindMealData.label}`,
                html: `
                <div class="add-user-event-modal-container modal-container">
                    <p class="text-xl">
                        Pour ${user.civility} <strong>${user.lastname}</strong> ${user.firstname}
                        </br>
                        le <strong>${this.date.format('DD/MM/YYYY')}</strong>
                    </p>
                </div>`,
                confirmButtonText: 'Confirmer',
                showCancelButton: true,
                focusConfirm: false,
                cancelButtonText: 'Annuler',
                reverseButtons: true,
                showDenyButton: false,
            }).then((data) => {
                if (data.isConfirmed) {
                    socket.emit('add user event', {
                        userId,
                        entries: [{
                            idKindMeal: kindMeal.id,
                            delivery: delivery && !kindMeal.delivery,
                            dateStart: this.date.format('YYYY-MM-DD'),
                            dateEnd: this.date.format('YYYY-MM-DD'),
                            isAbsence: delivery ? false : kindMeal.meal,
                        }]
                    });
                }
            });
        },
    },
    computed: {
        getTotal() {
            const total = [];
            this.kindMeals.forEach(kd => {
                total.push({
                    id: kd.id,
                    label: kd.label,
                    deliveryId: kd.deliveryId,
                    meal: 0,
                    delivery: 0,
                });
            });
            this.usersWithData.forEach(user => {
                if (user.values) {
                    user.values.forEach(kd => {
                        const current = total.find(t => t.id === kd.id);
                        if (kd.meal) {
                            current.meal += 1;
                        }
                        if (kd.deliveryId && kd.delivery) {
                            current.delivery += 1;
                        }
                    });
                }
                if (user.guests) {
                    user.guests.forEach(guest => {
                        guest.values.forEach(kd => {
                            const current = total.find(t => t.id === kd.id);
                            if (kd.meal) {
                                current.meal += guest.nbGuests;
                            }
                        });
                    });
                }
            });
            return total;
        },
        getFilteredUsers() {
            this.usersWithData.forEach((user) => {
                const current = this.usersWithData.find(u => `${user.civility} ${user.lastname} ${user.firstname}` === `${u.civility} ${u.lastname} ${u.firstname}`);
                if (current && current.id !== user.id) {
                    user.isDuplicate = true;
                }
            });
            if (this.userSearch.trim() === '') {
                return this.usersWithData;
            }
            const search = this.userSearch.trim().toLowerCase();
            return this.usersWithData.filter(user => (user.lastname.toLowerCase()).includes(search));
        }
    }
}
</script>

<template>
    <section class="general-input" @mouseout="dataHoverMealId = null">
        <div class="meals-header">
            <div class="user-header">
                <input type="text" v-model="userSearch" placeholder="Rechercher par nom..." />
            </div>
            <div class="column-header"
                :class="{ 'with-tray': kd.deliveryId && !isStaffMealView, 'hover-meal': dataHoverMealId === kd.id }"
                v-for="kd in kindMeals" :key="kd.id" :data-meal-id="kd.id" @mouseover="dataHoverMealId = kd.id">
                <p class="kind-meal-label">{{ kd.label }}</p>
                <div class="flex h-full" v-if="kd.deliveryId && !isStaffMealView">
                    <p :class="kd.deliveryId ? 'w-1/2 border-r' : 'w-full'">Repas</p>
                    <p v-if="kd.deliveryId" class="w-1/2 border-l">Plateau</p>
                </div>
            </div>
        </div>
        <div class="overflow-x-hidden overflow-y-scroll meals-overflow">
            <div class="meals-body">
                <template v-for="user in getFilteredUsers" :key="user.id">
                    <div class="user-row">
                        <div class="user-label" @mouseover="dataHoverMealId = null">
                            <template v-if="!user.isDuplicate">
                                <p v-if="user.id != null">{{ user.civility }} {{ user.lastname }} {{ user.firstname }}
                                </p>
                                <p v-else><strong>Invités suplémentaires</strong></p>
                            </template>
                        </div>
                        <div class="meals-case-container"
                            :class="{ 'double-checkbox': kd.deliveryId && !isStaffMealView, 'hover-meal': dataHoverMealId === kd.id }"
                            v-for="kd in user.values" :key="kd.id" :data-meal-id="kd.id"
                            @mouseover="dataHoverMealId = kd.id">
                            <div class="custom-checkbox" :class="kd.meal ? 'active' : ''"
                                @click="userNewEvent(user.id, kd, false)"></div>
                            <div v-if="kd.deliveryId && !isStaffMealView" class="custom-checkbox"
                                :class="kd.delivery ? 'active' : ''" @click="userNewEvent(user.id, kd, true)"></div>
                        </div>
                    </div>
                    <div class="guest-row" v-for="guest in user.guests" :key="guest.id">
                        <div class="user-label" :title="`Invité(s) du ${guest.dateStart} au ${guest.dateEnd}`">
                            <p v-if="user.id != null">+ {{ guest.nbGuests }} Invité{{ guest.nbGuests > 1 ? 's' : '' }}
                                {{ guest.info ? `/ ${guest.info}` : '' }}
                            </p>
                            <p v-else>{{ guest.label }} ({{ guest.nbGuests }}) {{ guest.info ? `/ ${guest.info}` : '' }}
                            </p>
                        </div>
                        <div class="meals-case-container" v-for="kd in guest.values" :key="kd.id" :data-meal-id="kd.id"
                            :class="{ 'double-checkbox': kd.deliveryId && !isStaffMealView, 'hover-meal': dataHoverMealId === kd.id }"
                            @mouseover="dataHoverMealId = kd.id">
                            <div class="custom-checkbox" :class="kd.meal ? 'active' : ''"></div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="meals-footer">
            <div class="total-row">
                <div class="total-label">
                    <p>Total</p>
                </div>
                <div class="total-kd" v-for="kd in getTotal" :key="kd.id" :data-meal-id="kd.id"
                    :class="{ 'double': kd.deliveryId && !isStaffMealView, 'hover-meal': dataHoverMealId === kd.id }"
                    @mouseover="dataHoverMealId = kd.id">
                    <p>{{ kd.meal }}</p>
                    <p v-if="kd.deliveryId && !isStaffMealView">{{ kd.delivery }}</p>
                </div>
            </div>
        </div>
    </section>
</template>

<style lang="scss"></style>
