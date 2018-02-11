<template>
  <div>
    {{ dot.display_name }}
    <carc-c
      v-for="card in child_cards" :key="card.dot.destination_id"
      :dot="card.dot"
      :child_cards="card.child_cards"
    />
  </div>

</template>

<script>
    export default {
      name: "carc-c",
      props:['dot', 'child_cards']
    }
</script>

<style scoped>

</style>
