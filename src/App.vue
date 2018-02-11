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

    <div class="col-3"> <!-- todo: replace this with rendering search session -->

    </div>
  </div>
</template>

<script>
  const o = require('./search_session.js');

  // mock up searchSession
  const session1 = new o.SearchSession(1,"session1");


export default {
  name: 'App',
  components: {},
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
      searchSessions:[session1],
      mapData:[],
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

  /* drag drop below */
  .gmarker {
    width: 32px;
    height: 32px;
    /*background-color: aqua;*/
    background-image: url("./assets/map-marker.png");
    background-size: cover;
    cursor: pointer;
  }


</style>
