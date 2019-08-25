<template>
  <b-navbar toggleable="lg" type="dark">
    <b-container>
      <b-navbar-brand to="/">Bunn.pro</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <main-nav />

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <user-field />
        </b-navbar-nav>
      </b-collapse>
    </b-container>
  </b-navbar>
</template>

<script>
import UserField from './components/UserField';
import MainNav from './components/MainNav';

export default {
  name: 'home',
  components: {
    UserField,
    MainNav
  }
};
</script>