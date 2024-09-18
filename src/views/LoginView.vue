<script>
import { socket } from "@/socket";

export default {
  components: {
  },
  props: {
  },
  data() {
    return {
      connectUser: {
        login: "",
        password: ""
      }
    }
  },
  methods: {
    async Login() {
      if (this.formIsValid) {
        socket.emit("company connect", { login: this.connectUser.login, password: this.connectUser.password });
      }
    }
  },
  computed: {
    formIsValid() {
      return this.connectUser.login && this.connectUser.password;
    }
  }
}
</script>

<template>
  <form class="general-container login-container" @submit.prevent="Login()">
    <h1>Menus</h1>
    <div class="input-container">
      <div class="input-row">
        <label for="login-login">Login</label>
        <input type="text" name="email" id="login-login" v-model="connectUser.login" placeholder="Obligatoire" required
          autocomplete="false">
      </div>
      <div class="input-row">
        <label for="login-password">Mdp</label>
        <input type="password" name="password" id="login-password" v-model="connectUser.password"
          placeholder="Obligatoire" required autocomplete="false">
      </div>
    </div>
    <input class="btn" :class="formIsValid ? '' : 'disabled'" name="login" type="submit" value="Se connecter">
  </form>
</template>

<style>
.login-container {
  @apply pb-6 max-w-md;
}

.login-container h1 {
  @apply pb-2;
}

.login-container .input-container {
  @apply flex flex-col max-w-md space-y-5 pb-8;
}

.login-container .input-row {
  @apply flex flex-col;
}

.login-container .input-row label {
  @apply text-xl font-semibold pb-2 pl-2;
}

.login-container .input-row input {
  @apply flex rounded-xl border-4 border-white bg-white/40 overflow-hidden resize-none outline-none px-2 py-1 text-lg;
}
</style>
