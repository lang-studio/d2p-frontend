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
    this.gmap = new google.maps.Map($('#map')[0], {
      // below are init properties that will be updated by bounds later
      zoom: 10,
      center: new google.maps.LatLng(0, 0)
    });
  }

  render_first_search(data){
    redraw(this.gmap, data, this.app);
    this.dots_visible = data.map(d => d['id']);
  }
}

exports.Map = Map;
