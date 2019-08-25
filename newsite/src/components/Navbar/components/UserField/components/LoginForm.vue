<template>
  <b-dropdown-form>
    <b-form-group label="Username" label-for="dropdown-form-username" @submit.stop.prevent>
      <b-form-input
        id="dropdown-form-username"
        size="sm"
        placeholder="Username"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Password" label-for="dropdown-form-password">
      <b-form-input
        id="dropdown-form-password"
        type="password"
        size="sm"
        placeholder="Password"
      ></b-form-input>
    </b-form-group>

    <b-form-checkbox class="mb-3">Remember me</b-form-checkbox>
    <b-button variant="primary" size="sm">Sign In</b-button>
  </b-dropdown-form>
</template>