import Vuex from 'vuex';

import user from './modules/user';
import statusMessages from './modules/statusMessages';

const store = new Vuex.Store({
  modules: {
    user,
    statusMessages
  }
});

export default store;