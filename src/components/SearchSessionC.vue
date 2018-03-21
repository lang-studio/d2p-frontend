<template>
  <div>
    <p>{{ search_session.display_name }}</p>
    <div v-for="card in search_session.cards_to_render" :key="card.dot.destination_id">
      <card-c
        :dot="card.dot"
        :child_cards="card.child_cards"
      />
    </div>
    <div class="dot-droppable"></div>
  </div>

</template>

<script>

  import CardC from './CardC'
  const o = require('../search_session.js');
  const log = require('loglevel');
  log.setLevel('debug');
  export default {
    name: "search-session-c",
    props:['search_session'],
    components:{CardC},
    mounted: function(){
      const e = this;
      $(".dot-droppable").droppable({
        accept:".marker-draggable",
        drop: function (event, ui) {
          log.debug("dropped marker", ui.draggable.attr("destination-id"));
          const did = Number(ui.draggable.attr("destination-id"));
          const name = ui.draggable.attr("name");
          const lat = Number(ui.draggable.attr("lat"));
          const lng = Number(ui.draggable.attr('lng'));
          let dot = new o.Dot(did, name, lat, lng);

          e.search_session.post_drag_dot(dot);

        }
      })
    }
  }
</script>

<style scoped>

  .dot-droppable{
    width: 100px;
    height: 30px;
    background-color: green;
  }

</style>
