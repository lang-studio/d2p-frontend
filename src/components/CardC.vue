<template>
  <div>
    {{ dot.display_name }}
    <button v-on:click="removeCard(dot.destination_id)">X</button>

    <carc-c
      v-for="card in child_cards" :key="card.dot.destination_id"
      :dot="card.dot"
      :child_cards="card.child_cards"
      v-on:remove_card_event="removeCard"
    /> <!-- this v-on is to recursively pop up events to session -->
  </div>

</template>

<script>
    export default {
      name: "carc-c",
      props:['dot', 'child_cards'],
      methods: {
        removeCard: function(destination_id){
          this.$emit('remove_card_event', destination_id);
        }
      }
    }
</script>

<style scoped>

</style>
