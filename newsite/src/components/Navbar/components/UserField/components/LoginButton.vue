<template>
  <b-nav-item-dropdown
    @show="show"
    @hide="hide"
    @shown="open=true"
    @hidden="open=false"
    size="md"
    right
    lazy
    variant="link"
    toggle-class="text-decoration-none"
    no-caret
    class="login-signup-dropdown"
  >
    <b-button-group slot="button-content">
      <b-button
        @click="click('logIn')"
        @keydown.enter="click('logIn')"
        @keydown.space="click('logIn')"
        variant="outline-success"
        :pressed="open && !signUp"
        class="text-nowrap"
      >
        Log In
      </b-button>
      <b-button
        @click="click('signUp')"
        @keydown.enter="click('signUp')"
        @keydown.space="click('signUp')"
        variant="outline-info"
        :pressed="open && signUp"
        class="text-nowrap"
      >
        Sign Up
      </b-button>
    </b-button-group>
    <template v-if="signUp">
      <sign-up-form />
    </template>
    <template v-else>
      <login-form />
      <b-dropdown-divider />
      <b-dropdown-item-button>Forgot Password?</b-dropdown-item-button>
    </template>
  </b-nav-item-dropdown>
</template>

<script>
import { mapMutations } from 'vuex';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';

// @click="()=>login({username: 'Linn', userId: '1234'})"
export default {
  name: 'home',
  data: () => ({
    signUp: false,
    open: false,
    clicked: null
  }),
  components: {
    SignUpForm,
    LoginForm
  },
  methods: {
    click(btn) {
      this.clicked=btn;
    },
    show(ev) {
      const clicked = this.clicked;
      this.clicked = null;
      switch(clicked) {
        case 'signUp':
          this.signUp = true;
          break;
        case 'logIn':
          this.signUp = false;
          break;
        default:
          return ev.preventDefault();
      }
    },
    hide(ev) {
      const clicked = this.clicked;
      this.clicked = null;
      let shouldHide = false;
      switch(clicked) {
        case 'signUp':
          shouldHide = this.signUp;
          break;
        case 'logIn':
          shouldHide = !this.signUp;
          break;
        default:
          return;
      }
      if(!shouldHide) {
        this.signUp = !this.signUp;
        ev.preventDefault();
      }
    },
    ...mapMutations([
      'login'
    ])
  }
};
</script>