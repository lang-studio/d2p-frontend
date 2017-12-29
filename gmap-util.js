// InfoWindow is a `Overlay` object, see https://developers.google.com/maps/documentation/javascript/customoverlays
InfoWindow.prototype = new google.maps.OverlayView();

function InfoWindow(anchor, d, map) {
    this.anchor_ = anchor;
    this.image_ = d['thumbnail'];
    this.name_ = d['name'];
    this.starRating_ = d['star_rating'];

    this.div_ = null;

    this.setMap(map);
}

function initMap(data) {

    const overlays = [];
    const markers = [];

    // server side return

    const map = new google.maps.Map($('#map')[0], {
        zoom: 10,
        center: new google.maps.LatLng(0, 0)
    });
    // add markers and center map
    let bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const latLng = new google.maps.LatLng(d['lat'], d['lng']);

        // prepare popup on mouseover
        overlays.push(new InfoWindow(latLng, d, map));

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = '<div class="gmarker"></div>';

        markers.push(new RichMarker({
            map: map,
            position: latLng,
            draggable: false,
            flat: true,
            content: contentDiv,
            id: i
        }));

        markers[i].addListener('mouseover', function (e) {
            overlays[this.id].show();
            // disable map draggling
            map.setOptions({
                draggable: false
            });
        });

        markers[i].addListener('mouseout', function () {
            overlays[this.id].hide();
            // enable map draggling
            map.setOptions({
                draggable: true
            })
        });

        markers[i].addListener('click', function () {
            // todo: if left-pane blocks the marker, re-center the map
            // hide overlay
            overlays[this.id].hide();
            // enable the left pane toggler
            $(".left-pane-toggle-button-container").show();
            // update left info pane values
            $("#left-pane-card-title").text(data[i]['name']);
            $("#left-pane-card-text").text(data[i]['description']);
            $("#left-pane-card-img").attr('src', data[i]['thumbnail']);
            // show left info pane
            const e = $("#left-info-pane");
            if (e.hasClass('left-pane-collapsed')) {
                // already collapsed, show again
                e.removeClass('left-pane-collapsed');
            }

        });

        bounds = bounds.extend(latLng);
    }
    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());

    setMarkerDraggable(markers);

}

InfoWindow.prototype.onAdd = function () {
    const div = document.createElement('div');
    div.setAttribute('class', 'hover-card');

    // below constructs the html for hover card, see mock-html/hover-card.html

    // Create the img element and attach it to the div.
    const img = document.createElement('img');
    img.setAttribute('class', 'hover-card-thumbnail');
    img.src = this.image_;
    div.appendChild(img);

    // content div
    const contentWrapperDiv = document.createElement('div');
    contentWrapperDiv.setAttribute('class', 'hover-card-content-wrapper');

    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('class', 'hover-card-content');
    contentDiv.innerText = this.name_;
    contentWrapperDiv.appendChild(contentDiv);

    // todo: half stars, with rating number
    const starRatingDiv = document.createElement('div');
    starRatingDiv.setAttribute('class', 'hover-card-star');
    starRatingDiv.innerText = this.starRating_ + '   ' + '★'.repeat(Math.round(this.starRating_));
    contentWrapperDiv.appendChild(starRatingDiv);

    div.appendChild(contentWrapperDiv);

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    const panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};

InfoWindow.prototype.draw = function () {
    const overlayProjection = this.getProjection();
    const anchor = overlayProjection.fromLatLngToDivPixel(this.anchor_);

    const div = this.div_;
    // todo: auto calculate offset according to screen boundary and left pane
    div.style.left = anchor.x + 'px';
    div.style.top = anchor.y + 'px';
    div.style.visibility = 'hidden';
};

InfoWindow.prototype.hide = function () {
    if (this.div_) {
        this.div_.style.visibility = 'hidden';
    }
};

InfoWindow.prototype.show = function () {
    if (this.div_) {
        this.div_.style.visibility = 'visible';
    }
};

function setMarkerDraggable(markers) {
    $(markers).each(function () {
        const markerInDOM = this.getContent();
        $(markerInDOM).attr("destination-id", this.id);
        $(markerInDOM).addClass('marker-draggable');
        $(markerInDOM).draggable({
            zIndex: 2,
            appendTo: 'body',
            helper: 'clone',
            containment: 'body'
        });
    });
}

// hide toggle button (we don't have data to render on load)
$('.left-pane-toggle-button-container').hide();

// left pane toggle button
$(".left-pane-toggle-button").click(function () {
    const e = $("#left-info-pane");
    if (e.hasClass('left-pane-collapsed')) {
        // already collapsed, show again
        e.removeClass('left-pane-collapsed');
    } else {
        // collapse
        e.addClass('left-pane-collapsed');
    }
});
