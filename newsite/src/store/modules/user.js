const state = {
  isLoggedIn: false,
  userName: null,
  userId: null
};

const mutations = {
  login(user, { username, userId}) {
    user.username = username;
    user.userId = userId;
    user.isLoggedIn = true;
  },
  logout(user) {
    user.username = null;
    user.userId = null;
    user.isLoggedIn = false;
  }
}

const actions = {
  async login ({ commit }, { username, password }) {

  },
  async signup ({ commit }, { email, username, password}) {

  }
};

export default { namespaced: true, state, mutations, actions };