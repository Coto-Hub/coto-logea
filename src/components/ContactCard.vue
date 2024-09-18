<script>
import moment from "moment";

export default {
    components: {
    },
    props: {
        contact: {
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
    }
}
</script>

<template>
    <div class="card-container">
        <div class="card">
            <div class="card-header">
                <h1>{{ contact.civility }} {{ contact.lastname }} {{ contact.firstname }}</h1>
            </div>
            <div class="card-content">
                <div class="card-row">
                    {{ contact.email }}
                </div>
                <div class="card-row">
                    {{ contact.phone }}
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
