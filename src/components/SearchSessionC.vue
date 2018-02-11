<template>
  <div>
    <p>{{ search_session.display_name }}</p>
    <div v-for="card in search_session.cards_to_render" :key="card.dot.destination_id">
      <card-c
        :dot="card.dot"
        :child_cards="card.child_cards"
      />
    </div>
  </div>

</template>

<script>

  import CardC from './CardC'
  export default {
    name: "search-session-c",
    props:['search_session'],
    components:{CardC}
  }
</script>

<style scoped>

</style>
