<template>
  <div class="statusMessages">
    <b-alert v-for="message of messages" :key="message.key"
      :show="message.timer || true"
      :dismissible="message.boolean !== false"
      :variant="message.variant"
      @dismissed="dismiss(message)"
      @dismiss-count-down="(timer)=>countDownChanged(message, timer)"
    >
      {{message.text}}
      <b-progress v-if="message.timer"
        :variant="message.variant"
        :max="message.timer-1"
        :value="getTimer(message)-1"
        height="4px"
      ></b-progress>
    </b-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: () => ({
    timers: {
    },
  }),
  methods: {
    async dismiss(message) {
      console.log('dismissed', message.key);
      delete this.timers[message.key];
      await this.$nextTick();
      this.$store.commit('statusMessages/dismiss', message);
    },
    getTimer(message) {
      if(!(message.key in this.timers)) {
        this.$set(this.timers, message.key, message.timer)
      }
      return this.timers[message.key];
    },
    countDownChanged(message, timer) {
      this.timers[message.key] = timer;
    }
  },
  computed: {
    ...mapState({
      messages: state => state.statusMessages.messages
    })
  }
};
</script>
