<script>
import Cake from "@/components/icons/IconCake.vue";
import Floor from "@/components/icons/IconFloor.vue";
import Room from "@/components/icons/IconRoom.vue";
import Contact from "@/components/icons/IconContact.vue";
import moment from "moment";

export default {
    components: {
        Contact,
        Floor,
        Room,
        Cake
    },
    props: {
        resident: {
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
        getAge(date) {
            return moment().diff(date, 'years');
        }
    },
    computed: {
        isBirthdayMonth() {
            return moment(this.resident.birthday).format('M') == moment().format('M');
        },
        isBirthday() {
            return moment(this.resident.birthday).format('M/D') == moment().format('M/D');
        }
    }
}
</script>

<template>
    <div class="card-container">
        <div class="card">
            <div class="card-header">
                <h1>{{ resident.civility }} {{ resident.lastname }} {{ resident.firstname }}</h1>
            </div>
            <div class="card-content">
                <div class="card-part left">
                    <div v-if="resident.floor == parseInt(resident.floor)" class="icon-container">
                        <Floor />
                        <span v-if="resident.floor">
                            {{ resident.floor }}
                            {{ (resident.floor > 0) ? '° étage' : null }}
                        </span>
                        <span v-else>Up</span>
                    </div>
                    <div v-if="resident.room" class="icon-container">
                        <Room />
                        <span>{{ resident.room }}</span>
                    </div>
                </div>
                <div class="card-part right">
                    <div v-if="resident.contacts" class="icon-container">
                        <Contact />
                        <span>{{ resident.contacts.length }}</span>
                    </div>
                    <div v-if="resident.birthday" class="icon-container">
                        <Cake :class="{ isMonth: isBirthdayMonth, isBirthday: isBirthday }" />
                        <span>{{ getAge(resident.birthday) }} ans</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
