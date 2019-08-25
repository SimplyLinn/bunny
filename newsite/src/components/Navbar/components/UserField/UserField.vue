<template>
  <user-dropdown v-if='isLoggedIn' :username="username" :userId="userId" />
  <login-button v-else />
</template>

<script>
import UserDropdown from './components/UserDropdown';
import LoginButton from './components/LoginButton';
import { mapState } from 'vuex';

export default {
  name: 'home',
  components: {
    UserDropdown,
    LoginButton
  },
  computed: {
    ...mapState({
      isLoggedIn: state => state.user.isLoggedIn,
      username: state => state.user.username,
      userId: state => state.user.userId,
    })
  }
};
</script>