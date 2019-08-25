<template>
  <div id="app">
    <nav-bar />
    <b-container class="pt-3 position-relative">
      <status-messages />
      <router-view />
    </b-container>
  </div>
</template>

<script>
// @ is an alias to /src
import NavBar from '@/components/Navbar';
import StatusMessages from '@/components/StatusMessages';

export default {
  name: 'home',
  components: {
    NavBar,
    StatusMessages
  }
};
</script>