let o = require ('./search_session.js'); // probably don't need this

class Map {
  constructor(session, app){
    this.rendered_dots = []; // only update after redraw
    this.active_session = session;
    this.app = app;
  }

  init_gmap(){
    // only called once in main.js; not called in tests; all google related calls come in here;
    // setup callbacks: zoomin/out

    this.gmap = new google.maps.Map($('#map')[0], {
      // below are init properties that will be updated by bounds later
      zoom: 10,
      center: new google.maps.LatLng(0, 0)
    });

    // init markers
    this.gmap_markers = [];

  }

  render(data){
    // used whenever map's markers are redrawn
    // remove previously drawn markers
    for (let i = 0; i < this.gmap_markers.length; i++){
      this.gmap_markers[i].setMap(null);
    }
    this.gmap_markers = [];

    redraw(this.gmap, this.gmap_markers, data, this.app);
    this.rendered_dots = data.map(d => d['id']);
  }
}

exports.Map = Map;
