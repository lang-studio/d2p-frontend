let o = require ('./search_session.js'); // probably don't need this

class Map {
  constructor(session, app){
    this.dots_visible = [];
    this.active_session = session;
    this.app = app; // todo: better way?
    // just to test import works
    let d = new o.Dot(0, '', 0, 0);
    console.log(d);
  }

  init_gmap(){
    // only called in main.js; not called in tests; all google related calls come in here;
    // setup callbacks: drag, zoomin/out
    // dummy test to verify calling google api in main.js works
    this.latLng = new google.maps.LatLng(0,0);
    console.log(this.latLng);
  }
}

exports.Map = Map;
