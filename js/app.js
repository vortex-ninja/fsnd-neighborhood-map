// Model - hardcoded initial locations

const initialLocations = [
    {
        title: 'Żoliborska Szkoła Boksu',
        location: { lat: 52.276426, lng: 20.986392 },
        fsID: '560bfc15498e007382ba701f'
    },
    {
        title: 'Arena Wspinaczkowa Makak',
        location: { lat: 52.297392, lng: 20.906519 },
        fsID: '539d649f498e08a9ddc49efc'
    },
    {
        title: 'Park Kępa Potocka',
        location: { lat: 52.277089, lng: 20.991247 },
        fsID: '4b8a6ae2f964a520fe6b32e3'
    },
    {
        title: 'Park Sady Żoliborskie',
        location: { lat: 52.267361, lng: 20.972407 },
        fsID: '4bb87e27cf2fc9b644929f02'
    },
    {
        title: 'Milk Bar "Sady"',
        location: { lat: 52.264999, lng: 20.971255 },
        fsID: '4c80be43309aef3bc718b781'
    },
];

// Main viewmodel for the screen
function NeighborhoodMapViewModel() {

    // DATA

    var self = this;
    self.markers = [];

    // Create a list of locations as observables

    self.locations = [];
    for (let i = 0; i < initialLocations.length; i++) {
        var location = initialLocations[i];
        location.visible = true;
        location.id = i;

        var listLocation = ko.observable(location);
        self.locations.push(listLocation);
    }

    // KO observable fot value of the filterField

    self.filterField = ko.observable('');

    // KO observable for current chosen location

    self.chosenLocation = ko.observable(null);


    // BEHAVIOURS

    // Set active location

    self.setLocation = function(locationOrMarker) {

        let id = locationOrMarker.id;

        if (self.chosenLocation() === self.locations[id]()) {
            self.chooseLocation(null);
            self.infowindow.close()

        } else {
            self.chooseLocation(self.locations[id]());

            // Temporary content for the info window while waiting for ajax response

            self.infowindow.setContent('Loading')

            self.animateMarker(self.markers[id]);
            self.populateInfowindow(self.locations[id]())
            self.infowindow.open(self.map, self.markers[id]);
        }
    }


    // Populate info window

    self.populateInfowindow = function(location) {

        // Prepare AJAX request

        let baseUrl = 'https://api.foursquare.com/v2/venues/'
        let authInfo = '?client_id=JH0BOK53EGVERUOLWKVWE40BISUW4LHJPXJXED5GRKQATPUB&client_secret=VPLKEXZJ5TIACWS1OCM5J3MKU2YS35YWPMYNNY5QECMRDXXX&v=20180218'
        let fsID = location.fsID;

        let url = baseUrl + fsID + authInfo;

        function ajaxVenue(xhttp, status) {
            let venue = JSON.parse(xhttp).response.venue;

            // Build content string for the info window

            let contentStr = '';

            if (status !== 200) {
                contentStr = "Error: couldn't load place's details.";
            } else {

                if (venue.name) {
                    contentStr += '<div>name: ' + venue.name + '</div>'
                }

                if (venue.categories.length > 0) {
                    if (venue.categories[0].name) {
                        contentStr += '<div>category: ' + venue.categories[0].name + '</div>'
                    }
                }

                if (venue.bestPhoto) {
                    contentStr += '<img src="' + venue.bestPhoto.prefix + 'cap300' + venue.bestPhoto.suffix + '">';
                }
            }

            self.infowindow.setContent(contentStr);

        }

        // Execure AJAX request for venue info

        self.ajaxRequest(url, ajaxVenue);
    }

    // Change current list location

    self.chooseLocation = function(location) {
        self.chosenLocation(location);
    };

    // Filter function

    self.filterList = function() {
        let filter = self.filterField().toUpperCase();

        for (let i = 0; i < self.locations.length; i++) {
            let input = self.locations[i]().title.toUpperCase();
            let listElem = self.locations[i]();
            if (input.indexOf(filter) > -1) {
                listElem.visible = true;
            } else {
                listElem.visible = false;
            }
            self.locations[i](listElem);
        }
    };

    // Functions to run when filterField changes

    self.filterChange= function() {
        self.filterList();
        self.showMarkers();
    }

    // MAP SECTION

    // Initializes map

    self.initMap = function() {
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 52.267417, lng: 20.981296},
            zoom: 12
        });

        self.infowindow = new google.maps.InfoWindow();
        self.createMarkers();
    }

    // MARKER FUNCTIONS

    // Create marker

    self.addMarker = function(data, id) {
        let marker = new google.maps.Marker({
            position: data.location,
            title: data.title,
            map: self.map,
            id: id
        });
        marker.addListener('click', function() {
            self.setLocation(this);
        })
        return marker;
    }

    // Show marker

    self.showMarker = function(marker) {
        self.hideAllMarkers();
        marker.setMap(self.map);
        console.log(self.map.getCenter());
        self.map.setCenter(marker.position);
        console.log(self.map.getCenter());
        self.animateMarker(marker);
    }

    // Hide all markers

    self.hideAllMarkers = function() {
        for (let i = 0; i < self.markers.length; i++) {
            self.markers[i].setMap(null);
        }
    }

    // Animate marker

    self.animateMarker = function(marker) {

        // Center on a marker leaving room for an infowindow

        self.map.panTo(marker.position);

        let ll = self.map.getBounds();
        let ne = ll.getNorthEast();
        let sw = ll.getSouthWest();

        let centerPoint = { lat: sw.lat() + (ne.lat()-sw.lat()) * 0.75, lng: (ne.lng() + sw.lng()) / 2 }

        self.map.panTo(centerPoint);

        // Animate the marker

        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { marker.setAnimation(null) }, 2000)
    }

    // Fill in marker's array

    self.createMarkers = function() {
        for (let i = 0; i < self.locations.length; i++) {
            self.markers.push(self.addMarker(self.locations[i](), i))
        }
    }

    // Show visible markers

    self.showMarkers = function() {
        for (let i = 0; i < self.locations.length; i++) {
            if (self.locations[i]().visible) {
                self.markers[i].setMap(self.map);
            } else {
                self.markers[i].setMap(null);
            }
        }
    }


    // AJAX API REQUESTS

    // I know jQuery is already loaded and I could use to it to make ajax requests
    // but I wanted to see how it's done in vanilla js

    self.ajaxRequest = function(url, callback) {

        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {

            if (this.readyState == 4) {
                callback(this.responseText, this.status)
            }
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    }
};

VM = new NeighborhoodMapViewModel()
ko.applyBindings(VM);

function googleCallback() {
    VM.initMap();
}
