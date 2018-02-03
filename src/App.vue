<template>
  <div class="row" id="vue-instance">
    <div class="col-9">
      <div id="map"></div>
      <div class="left-pane left-pane-visible" id="left-info-pane"
           v-bind:class="{'left-pane-collapsed':!leftPane.isActive}">

        <div class="left-pane-content-holder">
          <div class="card">
            <img class="card-img-top" id="left-pane-card-img" v-bind:src="leftPane.thumbnail">
            <div class="card-body">
              <h4 class="card-title" id="left-pane-card-title">{{ leftPane.name }}</h4>
              <p class="card-text" id="left-pane-card-text">{{ leftPane.description }}</p>
            </div>
          </div>
        </div>
        <div class="left-pane-toggle-button-container" v-show="leftPane.showBtn">
          <button type="button" class="left-pane-toggle-button"
                  v-on:click="leftPane.isActive = !leftPane.isActive"></button>
        </div>
      </div>
    </div>

    <div class="col-3">
      <div class="list-wrapper">

        <destination-tray
          v-for="tray in destinationTrays"
          v-bind:tray="tray"
          v-bind:data="mapData"
          v-on:droppedcard="dragCard"
          v-on:removecard="removeCard">
        </destination-tray>

      </div>


      <div class="dropzone"></div>
    </div>
  </div>
</template>

<script>
  import DestinationTray from './components/DestinationTray'
export default {
  name: 'App',
  components: {DestinationTray},
  mounted: function () {
    // init empty map
    this.map = new google.maps.Map($('#map')[0], {
      // below are init properties that will be updated by bounds later
      zoom: 10,
      center: new google.maps.LatLng(0, 0)
    });
  },
  data: function(){
    return {
      mapData:[],
      destinationTrays: [],// {id, text, draggedCards}
      draggedCards: [], // {text, destination_id}
      leftPane: {
        showBtn: false,
        isActive: false,
        name: '',
        description: '',
        thumbnail: ''
      }
    }
  },
  methods: {
    dragCard: function(did, d, tray_id){
      const tray = this.destinationTrays.filter(e => e.id === tray_id)[0];
      if (!(containsDestinationId(tray.draggedCards, did))){
        tray.draggedCards.push({text: d['name'], destination_id: did});
      } else {
        // todo flash-highlight the current already-dragged card
      }

    },
    removeCard:function(did, tray_id){
      const tray = this.destinationTrays.filter(e => e.id === tray_id)[0];
      tray.draggedCards = tray.draggedCards.filter(e => e.destination_id !== did);
    }
  }
}
</script>

<style>

  html, body {
    height: 100%;
  }

  .row { /* debug only */
    border: 1px dotted black;
  }

  html {
    font-family: Arial, Helvetica, sans-serif;
  }

  .container-fluid {
    padding-left: 0;
    padding-right: 0;
    position: relative;
  }

  /* dropzone debug styles */
  .list-wrapper {
    width: 270px;
    margin: 0 5px;
    box-sizing: border-box;
    display: inline-block;
    vertical-align: top;
    white-space: nowrap;
    background: #e2e4e6;
    border-radius: 3px;
  }

  .list-content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    position: relative;
    white-space: normal;
  }

  .list-header {
    min-height: 18px;
    padding: 8px 10px;
  }

  .list-cards {
    z-index: 1;
    margin: 0 4px;
    padding: 0 4px;
  }

  .list-card {
    background-color: #fff;
    border-bottom: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    display: block;
    margin-bottom: 6px;
    max-width: 300px;
    min-height: 20px;
    text-decoration: none;
    position: relative;
  }

  .list-card.active-card {
    background-color: #edeff0;
    border-bottom-color: #d6dadc;
  }

  .list-card.ui-droppable {
    background-color: #cccccc;
  }

  .list-card.ui-droppable.dropaccept {
    background-color: orange;
  }

  .list-card-title {
    clear: both;
    display: block;
    margin: 0 0 4px;
    padding: 6px 6px 2px 8px;
    overflow: hidden;
    text-decoration: none;
    word-wrap: break-word;
    color: #4d4d4d;
  }

  .list-card-operation {
    background-color: #edeff0;
    background-clip: padding-box;
    background-origin: padding-box;
    border-radius: 3px;
    opacity: .8;
    padding: 4px;
    position: absolute;
    right: 8px;
    top: 8px;
    visibility: hidden;
  }

  .list-card-operation.delete-icon {
    background-image: url("../dev-resources/images/delete-icon.png");
    background-size: cover;
    width: 22px;
    height: 22px;
  }

  .list-card-operation.active-card {
    visibility: visible;
  }

  .list-card-operation.dark-hover {
    background-color: #4d4d4d;
  }

  /* autocomplete */
  .search-scope {
    margin: 10px;
    width: 50%;
  }

  #search-input {
    border-color: blue;
  }

  #search-input.warning-flash {
    animation-duration: 0.5s;
    animation-name: warningflash;
  }

  @keyframes warningflash {
    from {
      border-color: red;
      background-color: lightpink;
    }
    to {
      border-color: blue;
      background-color: white;
    }
  }

  .autocomplete-suggestions {
    border: 1px solid #999;
    background: #FFF;
    overflow: auto;
  }

  .autocomplete-suggestion {
    padding: 2px 5px;
    white-space: nowrap;
    overflow: hidden;
  }

  .autocomplete-selected {
    background: #F0F0F0;
  }

  .autocomplete-suggestions strong {
    font-weight: normal;
    color: #3399FF;
  }

  .autocomplete-group {
    padding: 2px 5px;
  }

  .autocomplete-group strong {
    display: block;
    border-bottom: 1px solid #000;
  }

</style>
