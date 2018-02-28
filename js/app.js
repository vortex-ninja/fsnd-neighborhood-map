// Model - hardcoded initial locations

const initialLocations = [
    {
        title: 'Żoliborska Szkoła Boksu',
        location: { lat: 52.276426, lng: 20.986392 },
    },
    {
        title: 'Arena wspinaczkowa Makak',
        location: { lat: 52.297392, lng: 20.906519 },
    },
    {
        title: 'Park Kępa Potocka',
        location: { lat: 52.277089, lng: 20.991247 },
    },
    {
        title: 'Park Sady Żoliborskie',
        location: { lat: 52.267361, lng: 20.972407 },
    },
    {
        title: 'Bar Mleczny Sady',
        location: { lat: 52.264999, lng: 20.971255 },
    },
    {
        title: 'Buenos Nachos',
        location: { lat: 52.270794, lng: 20.950631 },
    },
    {
        title: 'Burgerownia',
        location: { lat: 52.266171, lng: 20.974487 },
    },
    {
        title: 'Smaki Warszawy',
        location: { lat: 52.267704, lng: 20.984851 },
    },
    {
        title: 'Kino Wisła',
        location: { lat: 52.269683, lng: 20.986667 }
    },
    {
        title: 'Legia - Sekcja Bokserska',
        location: { lat: 52.257571, lng: 20.946168 }
    }
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

    // KO observable for value of the filterField

    self.filterField = ko.observable('');

    // KO observable for current chosen location

    self.chosenLocation = ko.observable(null);


    // BEHAVIOURS

    // Set active location

    self.setLocation = function(locationOrMarker) {

        let id = locationOrMarker.id;
        let loc = self.locations[id]();

        if (self.chosenLocation() === loc) {
            self.chooseLocation(null);
            self.infowindow.close();

        } else {
            self.chooseLocation(loc);

            // Temporary content for the info window while waiting for ajax response

            self.infowindow.setContent('Loading');

            // Get info window content if there is none
            // or content older than one day
            // otherwise just render the info window

            let day = 1000 * 60 * 60 * 24; // one day in miliseconds

            if (!loc.fsData || (loc.fsData && (loc.fsData.dateRetrieved < (Date.now() - day))))    {
                self.getDataInfoWindow(loc);
            } else {
                self.populateInfoWindow(loc);
            }

            self.animateMarker(self.markers[id]);
            self.infowindow.open(self.map, self.markers[id]);
        }
    };


    // Populate info window

    self.populateInfoWindow = function(location) {

        let contentStr = '';
        contentStr += '<div>' + location.title + '</div>';

        if (location.fsData.error) {
            contentStr += '<div>' + location.fsData.error + '</div>';
        } else {
            if (location.fsData.category) {
                contentStr += '<div>category: '+ location.fsData.category + '</div>';

            }
            if (location.fsData.bestPhoto) {
                contentStr += '<img src="' + location.fsData.bestPhoto + '"/>';
            }
        }

        self.infowindow.setContent(contentStr);
        self.infowindow.open(self.map, self.markers[location.id]);
    };


    // Get data from Foursquare API

    self.getDataInfoWindow = function(location) {

        // Callback functions

        function ajaxSearch(xhttp, status, location) {
            let search = JSON.parse(xhttp);
            let fsID = '';

            let venues;

            if (search.response.venues.length > 0) {
                venues = search.response.venues;
            }

            for (let i = 0; i < venues.length; i++) {
                if (location.title === venues[i].name) {
                    fsID = venues[i].id;
                }
            }

            // When search is done execute AJAX request for venue info
            baseUrl = 'https://api.foursquare.com/v2/venues/';
            authInfo = '?client_id=JH0BOK53EGVERUOLWKVWE40BISUW4LHJPXJXED5GRKQATPUB&client_secret=VPLKEXZJ5TIACWS1OCM5J3MKU2YS35YWPMYNNY5QECMRDXXX&v=20180218';


            location.fsID = fsID;
            url = baseUrl + fsID + authInfo;
            self.ajaxRequest(url, ajaxVenue, location);


        }

        function ajaxVenue(xhttp, status, location) {
            let venue = JSON.parse(xhttp).response.venue;

            // Build fsData object with data from Foursquare API

            let fsData = {};

            if (status !== 200) {
                fsData.error = "Error: couldn't load place's details.";
            } else {

                if (venue.name) {
                    fsData.name = venue.name;
                }

                if (venue.categories.length > 0) {
                    if (venue.categories[0].name) {
                        fsData.category = venue.categories[0].name;
                    }
                }

                if (venue.bestPhoto) {
                    fsData.bestPhoto = venue.bestPhoto.prefix + 'cap300' + venue.bestPhoto.suffix;
                }
            }

            fsData.dateRetrieved = Date.now();

            location.fsData = fsData;
            self.locations[location.id](location);
            self.populateInfoWindow(location);
        }

        // Prepare search request

        let baseUrl = 'https://api.foursquare.com/v2/venues/search';
        let authInfo = '?client_id=JH0BOK53EGVERUOLWKVWE40BISUW4LHJPXJXED5GRKQATPUB&client_secret=VPLKEXZJ5TIACWS1OCM5J3MKU2YS35YWPMYNNY5QECMRDXXX&v=20180218';
        let ll = '&ll=' + location.location.lat + ',' + location.location.lng;

        let url = baseUrl + authInfo + ll;

        // Execute search request and get Foursquare ID

        self.ajaxRequest(url, ajaxSearch, location);
    };

    // Change current list location

    self.chooseLocation = function(location) {
        self.chosenLocation(location);
    };

    // Filter function

    self.filterList = function() {
        let filter = self.filterField().toUpperCase();

        self.chosenLocation(null);

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
    };

    // MAP SECTION

    // Initializes map

    self.initMap = function() {
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 52.267417, lng: 20.981296}
        });

        // Create a global info window, only one will be open at any given time

        self.infowindow = new google.maps.InfoWindow();

        // Set up bounds and markers for the map

        self.getMapBounds();
        self.createMarkers();

        self.map.fitBounds(self.bounds);
    };

    // Center map
    // If there's a location chosen this function centers map on this location
    // otherwise it centers on all the markers visible

    self.centerMap = function() {

        if (!self.chosenLocation()) {
             self.getMapBounds();

             // If there's only one location in bounds center on it

             if ((self.bounds.getNorthEast().lat() === self.bounds.getSouthWest().lat()) &&
                (self.bounds.getNorthEast().lng() === self.bounds.getSouthWest().lng())) {
                self.map.panTo(self.bounds.getCenter());
             } else {
                self.map.fitBounds(self.bounds);
            }

        } else {
            self.map.setCenter(self.chosenLocation().location);
            self.infowindow.close();
            self.infowindow.open(self.map, self.markers[self.chosenLocation().id]);
        }
    };

    // Reset map

    self.resetMap = function() {

        self.chosenLocation(null);
        self.infowindow.close();
        self.filterField('');
        self.filterChange();
        self.centerMap();
    };

    // Get bounds for visible markers

    self.getMapBounds = function() {

            self.bounds = new google.maps.LatLngBounds();

            for (let i = 0; i < self.locations.length; i++) {
                let loc = self.locations[i]();
                if (loc.visible) {
                    self.bounds.extend(loc.location);
                }
            }
    };

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
        });
        return marker;
    };


    // Hide all markers

    self.hideAllMarkers = function() {
        for (let i = 0; i < self.markers.length; i++) {
            self.markers[i].setMap(null);
        }
    };

    // Animate marker

    self.animateMarker = function(marker) {

        self.map.setCenter(marker.position);

        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { marker.setAnimation(null); }, 2000);
    };

    // Fill in marker's array and set bounds

    self.createMarkers = function() {
        for (let i = 0; i < self.locations.length; i++) {
            self.markers.push(self.addMarker(self.locations[i](), i));
        }
    };

    // Show visible markers

    self.showMarkers = function() {
        for (let i = 0; i < self.locations.length; i++) {
            if (self.locations[i]().visible) {
                self.markers[i].setMap(self.map);
            } else {
                self.markers[i].setMap(null);
            }
        }
    };


    // AJAX API REQUESTS

    // I know jQuery is already loaded and I could use to it to make ajax requests
    // but I wanted to see how it's done in vanilla js

    self.ajaxRequest = function(url, callback, location) {

        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {

            if (this.readyState == 4) {
                callback(this.responseText, this.status, location);
            }
        };

        xhttp.open('GET', url, true);
        xhttp.send();
    };

}

VM = new NeighborhoodMapViewModel();
ko.applyBindings(VM);

function googleCallback() {
    VM.initMap();
}
