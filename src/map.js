let o = require ('./search_session.js'); // probably don't need this

class MapState {
  constructor(zoomLevel){
    this.markers = [];
    this.zoomLevel = zoomLevel;
  }
}

class Map {
  constructor(session, app){
    this.rendered_dots = []; // only update after redraw
    this.active_session = session;
    this.app = app;
  }

  canFitMap(dots, bounds){
    // whether it "makes sense" to draw all dots on this bounds; test required
    return true
  }

  _addZoomCallback(){

    let e = this;

    this.gmap.addListener('zoom_changed', function(){
      let newZoom = this.getZoom();
      if (newZoom > e.mapState.zoomLevel){
        // zoom in
        // how many dots can we see now
        let bounds = this.getBounds();

        function withinBounds(dot){
          let l = new google.maps.LatLng(dot.lat, dot.lng);
          return bounds.contains(l);
        }

        let visible_dots = e.rendered_dots.map(i => e.active_session.known_dots.get(i)).filter(withinBounds);

        if (visible_dots.length === 1){
          // have we fetched its children?
          let visible_dot = visible_dots[0];
          let child_dots = [];
          if (e.active_session.dot_relationships.m.has(visible_dot.destination_id)){
            let child_dot_ids = e.active_session.dot_relationships.m.get(visible_dot.destination_id);
            child_dots = child_dot_ids.map(i => e.active_session.known_dots.get(i));
          }else {
            // call api
            let resource = e.app.$resource('http://localhost:3000/search/' + visible_dot.destination_id);

            resource.get().then(response => {
              let d = response.body['children'];
              child_dots = d.map(s => new o.Dot(s.id, s.name, s.lat, s.lng));
              e.active_session.post_api(visible_dot, child_dots);
            });
          }

          // should we draw?
          if (child_dots.length > 0 && e.canFitMap(child_dots, bounds)){

          }

        } else {
          // do nothing
        }

        console.log("zoom in");
        console.log(visible_dots.length);

      } else {
        // zoom out, maybe render parent instead of children dots
      }

      // update mapState
      e.mapState.zoomLevel = newZoom;

    })
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
    this.mapState = new MapState(this.gmap.getZoom());

    this._addZoomCallback();

  }



  _clearMarkers(){
    for (let i = 0; i < this.mapState.markers.length; i++){
      this.mapState.markers[i].setMap(null);
    }
    this.mapState.markers = [];
  }

  render(dots){
    // used whenever map's markers are redrawn
    this._clearMarkers();
    redraw(this.gmap, this.mapState.markers, dots, this.app);
    this.rendered_dots = dots.map(d => d.destination_id);
  }
}

exports.Map = Map;
