<template>
  <a class="list-card"
     @mouseover="isActiveCard=true"
     @mouseleave="isActiveCard=false"
     v-bind:class="{'active-card':isActiveCard}">
            <span class="list-card-operation delete-icon"
                  @mouseover="hoverDelete=true"
                  @mouseleave="hoverDelete=false"
                  v-bind:class="{'active-card':isActiveCard, 'dark-hover':hoverDelete}"
                  v-on:click="removeMe"></span>
    <div class="list-card-details">
                <span class="list-card-title">
                    {{ card.text }}
                </span>
    </div>
  </a>
</template>

<script>
export default {
  name: 'dragged-card',
  props: ['card'],
  data: function () {
    return {
      isActiveCard: false,
      hoverDelete: false
    }
  },
  methods: {
    removeMe: function () {
      this.$emit('removecard', this.card.destination_id);
    }
  }
}
</script>

<style scoped>

</style>
