let o = require ('./search_session.js'); // probably don't need this

class Map {
  constructor(session, app){
    this.dots_visible = [];
    this.active_session = session;
    this.app = app;
  }

  init_gmap(){
    // only called once in main.js; not called in tests; all google related calls come in here;
    // setup callbacks: drag, zoomin/out

    this.gmap = new google.maps.Map($('#map')[0], {
      // below are init properties that will be updated by bounds later
      zoom: 10,
      center: new google.maps.LatLng(0, 0)
    });

    // drag callback, update dots_visible
    let e = this;

    this.gmap.addListener('dragend', function(){

      let bounds = e.gmap.getBounds();

      function withinBound(dot){
        let l = new google.maps.LatLng(dot.lat, dot.lng);
        return bounds.contains(l);
      }

      // todo: test: should use known_dots instead of dots_visible
      e.dots_visible = Array.from(e.active_session.known_dots.values()).filter(withinBound);

    });
  }

  render(data){
    // used whenever map's markers are redrawn
    redraw(this.gmap, data, this.app);
    this.dots_visible = data.map(d => d['id']);
  }
}

exports.Map = Map;
