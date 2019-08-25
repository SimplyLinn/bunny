<template>
  <b-nav-item-dropdown right>
    <!-- Using 'button-content' slot -->
    <template slot="button-content"><em>{{username}}</em></template>
    <b-dropdown-item href="#">Profile</b-dropdown-item>
    <b-dropdown-item href="#" @click="logout">Sign Out</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'LoginButton',
  props: {
    username: String,
    userId: String,
  },
  components: {
  },
  methods: {
    ...mapMutations([
      'logout'
    ])
  }
};
</script>