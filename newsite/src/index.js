import Vue from 'vue';

import store from './store';
import './scss/custom.scss'
import App from './App.vue';
import router from './router';

function fallbackErrorHandler(error) {
  if(error instanceof Error) {
    store.commit('statusMessages/add', { variant: 'danger', text: `${error.name}: ${error.message}`});
  } else if (typeof error === 'string' && error) {
    store.commit('statusMessages/add', { variant: 'danger', text: error});
  } else {
    store.commit('statusMessages/add', { variant: 'danger', text: 'Something went wrong, I\'m sorry, I don\'t have more information than that :('});
  }
}

window.addEventListener('unhandledrejection', ({ reason: error }) => fallbackErrorHandler(error));


window.addEventListener('error', ({ error }) => fallbackErrorHandler(error));

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

store.commit('statusMessages/add', { variant: 'info', text: "Here's an info message, no error, maybe there's an update scheduled for tonight and the service will be unavailable or something" });
