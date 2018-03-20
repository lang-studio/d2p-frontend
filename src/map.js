let o = require ('./search_session.js');

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

  _clearMarkers(){
    for (let i = 0; i < this.mapState.markers.length; i++){
      this.mapState.markers[i].setMap(null);
    }
    this.mapState.markers = [];
  }

  render(dots, refit){
    // used whenever map's markers are redrawn
    this._clearMarkers();
    redraw(this.gmap, this.mapState.markers, dots, this.app, refit);
    this.rendered_dots = dots.map(d => d.destination_id);
  }

  canFitMap(dots, bounds){
    // todo: whether it "makes sense" to draw all dots on this bounds; test required
    return true
  }

  canNotFitMap(dots, bounds){
    // only used for zoom out testing
    return false
  }

  _addZoomCallback(){

    let e = this; // because "this" will be replaced in callback

    this.gmap.addListener('zoom_changed', function(){
      let newZoom = this.getZoom();
      if (newZoom > e.mapState.zoomLevel){
        console.log("zoom in");
        // zoom in
        // how many dots can we see now
        let bounds = this.getBounds();

        function withinBounds(dot){
          let l = new google.maps.LatLng(dot.lat, dot.lng);
          return bounds.contains(l);
        }

        let visible_dots = e.rendered_dots.map(i => e.active_session.known_dots.get(i)).filter(withinBounds);
        console.log("visible_dots", visible_dots);

        if (visible_dots.length === 1){
          // only attempt to re-draw if only one dot visible
          let visible_dot = visible_dots[0];
          let child_dots = [];
          // have we fetched its children?
          if (e.active_session.dot_relationships.m.has(visible_dot.destination_id)){
            let child_dot_ids = e.active_session.dot_relationships.m.get(visible_dot.destination_id);
            child_dots = child_dot_ids.map(i => e.active_session.known_dots.get(i));
            // should we draw?
            if (child_dots.length > 0 && e.canFitMap(child_dots, bounds)){
              e.render(child_dots, false); // don't refit
            }
          }else {
            // call api
            let resource = e.app.$resource('http://localhost:3000/search/' + visible_dot.destination_id);

            resource.get().then(response => {
              let d = response.body['children'];
              child_dots = d.map(s => new o.Dot(s.id, s.name, s.lat, s.lng,
                new o.EnrichedDotData(s.thumbnail, s.star_rating, s.description)));
              e.active_session.post_api(visible_dot, child_dots);

              // should we draw? we have to repeat here because this has to be part of callback
              if (child_dots.length > 0 && e.canFitMap(child_dots, bounds)){
                e.render(child_dots, false); // don't refit
              }
            });
          }

        }
      } else {
        // fetch parent of all rendered_dots; if only one unique parent, render this parent + its siblings if possible
        // do nothing if parent is session's top level dot
        console.log("zoom out");
        console.log("rendered dots:", e.rendered_dots);
        let parent_ids = e.rendered_dots.map(i => e.active_session.dot_relationships.get_parent(i));
        let unique_parent_ids = Array.from(new Set(parent_ids));
        console.log("unique parents:", unique_parent_ids);

        if (unique_parent_ids.length === 1){
          let unique_parent_id = unique_parent_ids[0];
          if (!(unique_parent_id === e.active_session.destination_id)){
            // should we re-render? (child_dots是不是都挤到一块儿了？) todo: this should be toplevel
            let bounds = this.getBounds();
            if (!(e.canNotFitMap(e.rendered_dots, bounds))){
              // fetch siblings
              let siblings = e.active_session.dot_relationships.get_siblings(unique_parent_id); // this includes itself
              let sibling_dots = siblings.map(i => e.active_session.known_dots.get(i));
              e.render(sibling_dots, false);
            } else {
              // no need to re-render
              console.log("map still suitable to render current dots");
            }

          } else {
            // common parent is session; do nothing
            console.log("common parent is session");
          }
        }

      }

      // update mapState
      e.mapState.zoomLevel = newZoom;

      // draggable
      this.setOptions({
        draggable: true
      });

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

  }
}

exports.Map = Map;
