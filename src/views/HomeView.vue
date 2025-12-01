<script>
import { state } from "@/socket";
import LoginComponent from "@/components/Login.vue";

export default {
  components: {
    LoginComponent,
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
    <LoginComponent v-if="!isConnected" />
  </main>
</template>

<style lang="scss"></style>
