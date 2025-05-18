<script>
import { state } from "@/socket";
import LoginView from "./LoginView.vue"

export default {
  components: {
    LoginView,
  },
  props: {
  },
  data() {
    return {
    }
  },
  methods: {
  },
  computed: {
    isConnected() {
      return state.company ? state.company.id : false;
    }
  }
}
</script>

<template>
  <main>
    <LoginView v-if="!isConnected" />
  </main>
</template>

<style lang="scss"></style>
