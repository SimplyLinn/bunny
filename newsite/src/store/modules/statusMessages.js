let keyCounter = 0;

const state = {
  messages: []
};

const mutations = {
  add({ messages } , message) {
    messages.push({ ...message, key: `statusMessage[${keyCounter++}]`});
  },
  dismiss({ messages }, message) {
    const index = messages.findIndex(msg=>msg.key === message.key);
    console.log('dismissing index', index);
    if(index >= 0) messages.splice(index, 1);
  },
  dismissAll( state ) {
    state.messages = [];
  }
}

export default { namespaced: true, state, mutations };