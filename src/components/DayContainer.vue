<script>
import { state, socket } from "@/socket";
import IconPlus from "@/components/icons/IconPlus.vue";
import IconEdit from "@/components/icons/IconEdit.vue";
import IconImg from "@/components/icons/IconImg.vue";
import IconPaint from "@/components/icons/IconPaint.vue";
import IconRemove from "@/components/icons/IconRemove.vue";

export default {
    components: {
        IconPlus,
        IconEdit,
        IconImg,
        IconPaint,
        IconRemove,
    },
    props: {
        day: {
            type: Object,
            required: true
        },
        planningDay: {
            type: Object,
            required: false,
            default: null,
        },
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
        getUrl() {
            return state.url;
        },
    }
}
</script>

<template>
    <div class="day">
        <span :class="{ 'month': day.isCurrentMonth }">{{ day.day }}</span>
        <div class="decoration-container justify-center" v-if="planningDay.startDeco">
            <img :src="getUrl + planningDay.startDeco.icon.path.replace('./', '/')" alt="decoration" loading="lazy" />
        </div>
        <div class="anim-list" :class="{ 'custom': !Array.isArray(planningDay.content) }">
            <div v-if="Array.isArray(planningDay.content)" class="anim" v-for="anim in planningDay.content"
                :key="anim.id">
                <p class="content"><span class="hour">{{ anim.hour }}:</span>{{ anim.content }}</p>
            </div>
            <div class="custom" v-else>
                <p class="content">{{ planningDay.content }}</p>
            </div>
        </div>
        <div class="decoration-container"
            :class="!Array.isArray(planningDay.content) ? 'justify-center' : 'justify-end px-6'"
            v-if="planningDay.endDeco">
            <img :src="getUrl + planningDay.endDeco.icon.path.replace('./', '/')" alt="decoration" loading="lazy" />
        </div>
        <div class="select">
            <IconEdit v-if="(typeof planningDay.content !== 'string' && planningDay.content !== null)"
                @click="$emit('editPlanningModal', day.date, $event)" />
            <IconImg v-if="(typeof planningDay.content !== 'string' && planningDay.content !== null)"
                @click="$emit('editImgPlanningModal', day.date, null, $event)" />
            <IconPlus v-if="Array.isArray(planningDay.content) || planningDay.content == null"
                @click="$emit('addAnimationPlanningModal', day.date)" />
            <IconPaint @click="$emit('customPlanningModal', day.date, $event)"
                v-if="!Array.isArray(planningDay.content)" />
            <IconRemove @click="$emit('deleteCustomPlanningModal', day.date)"
                v-if="!Array.isArray(planningDay.content) && planningDay.content !== null" />
            <div class="custom">
                <IconImg v-if="!Array.isArray(planningDay.content) && planningDay.content !== null"
                    @click="$emit('editImgPlanningModal', day.date, 1, $event)" />
                <!-- @click="customImgPlanningModal(day.date, 1, $event)" /> -->
                <IconImg v-if="!Array.isArray(planningDay.content) && planningDay.content !== null"
                    @click="$emit('editImgPlanningModal', day.date, 2, $event)" />
                <!-- @click="customImgPlanningModal(day.date, 2, $event)" /> -->
            </div>
        </div>
    </div>
</template>

<style lang="scss"></style>
