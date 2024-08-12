<script>
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import { socket, state } from "@/socket";
import { useStore } from "vuex";

export default {
  name: "App",
  components: {
  },
  setup() {
    
    return {
    };
  },
};
</script>

<template>
  <header class="w-full h-14 flex bg-white/60">
    <div class="container flex justify-between h-full items-center">
      <h1 class="font-semibold text-xl">Villa de Bury</h1>
      <nav class="nav-container">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/menu">Menu</RouterLink>
      </nav>
    </div>
  </header>
  <div class="page-container container mx-auto">
    <RouterView />
  </div>
</template>

<style>
html, body {
  @apply w-full h-full;
}
#app {
  @apply w-screen h-screen bg-no-repeat bg-center bg-cover flex flex-col absolute;
  background-image: url(./assets/background.svg);
}
.container {
  @apply mx-auto;
}
.page-container {
  @apply w-full h-full flex text-lg justify-center items-center;
}
.page-container h1 {
  @apply font-semibold text-3xl;
}
.nav-container {
  @apply flex text-lg h-full;
}
.nav-container a {
  @apply flex h-full font-medium items-center px-6;
}
.nav-container a:hover {
  @apply bg-gray-500/5;
}
.nav-container a.router-link-active {
  @apply font-bold bg-gray-500/10;
}
.swal2-container .swal2-modal {
  @apply rounded-2xl border-solid border-4 bg-white border-gray-500/70 overflow-hidden shadow shadow-gray-400;
}
.swal2-container .swal2-modal h2 {
  @apply bg-transparent;
}
.swal2-container .swal2-modal .btn:hover {
  @apply border-gray-500/70 bg-gray-500/30;
}
.swal2-container .swal2-modal .btn-import {
  @apply bg-gray-300/30 border-gray-300/70;
}
.swal2-container .swal2-modal .import-modal-container input[type=date] {
  @apply border-gray-300/70 bg-gray-300/30 rounded-xl;
}
</style>
