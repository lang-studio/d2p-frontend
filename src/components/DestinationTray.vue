<template>
  <div class="list-content">
    <div class="list-header">{{ tray.text }}</div>
    <div class="list-cards">

      <!-- populated by code -->
      <dragged-card
        v-for="card in tray.draggedCards"
        v-bind:card="card"
        v-on:removecard="removeCard">
      </dragged-card>


      <a class="list-card ui-droppable">
        <div class="list-card-details">
                    <span class="list-card-title">
                        Drop marker here
                    </span>
        </div>
      </a>

    </div>
  </div>
</template>

<script>
  import DraggedCard from './DraggedCard'
    export default {
      name: "destination-tray",
      props: ['tray', 'data'],
      components:{DraggedCard},
      mounted: function(){ // todo: use vue-draggable
        // this hack because "this" will be overwritten in jquery below
        const tray_id = this.tray.id;
        const e = this;
        $(".ui-droppable").droppable({
          accept: ".marker-draggable",
          hoverClass: "dropaccept",
          drop: function (event, ui) {
            const did = ui.draggable.attr("destination-id");
            const d = e.data[did];
            console.log(d);
            e.$emit('droppedcard', did, d, tray_id);
          }
        });
      },
      methods: {
        removeCard: function (did) {
          this.$emit('removecard', did, this.tray.id);
        }
      }
    }
</script>

<style scoped>

</style>
