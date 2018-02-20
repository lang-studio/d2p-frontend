// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false;

// how to import class from other files
/*const o = require('./search_session.js');
const s = new o.SearchSession(0,0);
console.log(s);*/

const o = require('./search_session.js');

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'

});

const app1 = app.$root.$children[0];

// autocomplete search
const mockAutocompleteResult = [
  {value: 'Scotland', data: 1}, // data is destination_id
  {value: 'Edinburgh', data: 2}
];


let isValidSearch = false;
let lastSuggestion = null;

const searchSubmitBtn = document.getElementById('search-submit');
const searchInput = document.getElementById('search-input');

$('#search-input').devbridgeAutocomplete({
  // todo: turn it into backend call
  lookup: mockAutocompleteResult,
  triggerSelectOnValidInput: false,
  onSelect: function (suggestion) {
    isValidSearch = true;
    lastSuggestion = suggestion
  },
  onInvalidateSelection: function () {
    isValidSearch = false
    // flash input border to red?
    // searchInput.classList.add('warning-flash')
  }
});

searchSubmitBtn.addEventListener('click', function () {
  if (isValidSearch) {
    console.log(lastSuggestion);
    const destination_id = lastSuggestion.data;
    // push a new search session
    let s = new o.SearchSession(destination_id, lastSuggestion.value);
    app1.search_sessions.push(s);
    // todo: call backend to populate data, call updateMap
    // http://localhost:3000/destinations
    $.get("http://localhost:3000/destinations", function (d) {
      console.log(d);
      app1.mapData = d;
      updateMap(app1.map, app1.mapData, app1)
      // todo: call s.post_api
    }, "json")

  }else {
    searchInput.classList.add('warning-flash')
  }
});

searchInput.addEventListener('animationend', function () {
  this.classList.remove('warning-flash')
});

// press enter triggers submit
$('#search-input').keyup(function (event) {
  if (event.keyCode === 13) {
    $('#search-submit').click()
  }
});