<template>
  <b-dropdown-form @submit="onSubmit">
    <b-form-group label="Email" label-for="dropdown-form-email" @submit.stop.prevent>
      <b-form-input
        id="dropdown-form-email"
        size="sm"
        placeholder="email@example.com"
        v-model="email"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Username" label-for="dropdown-form-username" @submit.stop.prevent>
      <b-form-input
        id="dropdown-form-username"
        size="sm"
        placeholder="Username"
        v-model="username"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Password" label-for="dropdown-form-password">
      <b-form-input
        id="dropdown-form-password"
        :type="showPassword ? 'text' : 'password'"
        size="sm"
        placeholder="Password"
        v-model="password"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Repeat Password" label-for="dropdown-form-password">
      <b-form-input
        id="dropdown-form-repeat-password"
        type="password"
        size="sm"
        placeholder="Repeat Password"
        v-model="repeatPassword"
      ></b-form-input>
    </b-form-group>

    <b-form-checkbox class="mb-3">Remember me</b-form-checkbox>
    <b-button type="submit" variant="primary" size="sm">Sign In</b-button>
  </b-dropdown-form>
</template>

<script>
import api from '@/api';

export default {
  name: 'SignUpForm',
  data: () => ({
    showPassword: false,
    email: '',
    username: '',
    password: '',
    repeatPassword: ''
  }),
  props: {
    dropdown: Object,
  },
  components: {
  },
  methods: {
    onSubmit(ev) {
      api.get('/', {
        noDefaultError: true,
      });
      ev.preventDefault();
    }
  }
};
</script>