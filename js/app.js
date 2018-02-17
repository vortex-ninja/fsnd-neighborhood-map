// Hardcoded initial locations



const initialLocations = [
    {
        title: 'Żoliborska Szkoła Boksu',
        location: { lat: 52.276894, lng: 20.984726 },
    },
    {
        title: 'Arena Wspinaczkowa Makak',
        location: { lat: 52.297340, lng: 20.906519 },
    },
    {
        title: 'Szkoła Tańca SalsaLibre',
        location: { lat: 52.261050, lng: 20.970574 },
    },
    {
        title: 'Park Kępa Potocka',
        location: { lat: 52.289618, lng: 20.979612 },
    },
    {
        title: 'Park Sady Żoliborskie',
        location: { lat: 52.267361, lng: 20.972407 },
    },
    {
        title: 'Milk Bar "Sady"',
        location: { lat: 52.264999, lng: 20.971255 },
    },
];

// Main viewmodel for the screen
function NeighborhoodMapViewModel() {

    // Data

    var self = this;
    self.markers = [];

    // Create a list of locations as observables

    self.locations = [];
    for (let i = 0; i < initialLocations.length; i++) {
        var location = initialLocations[i];
        location.visible = true;

        var listLocation = ko.observable(location);
        self.locations.push(listLocation);
    }

    self.filterField = ko.observable('');
    self.testField = ko.observable('test123');

    // Current chosen location
    self.chosenLocation = ko.observable(self.locations[0]());


    // Behaviours

    // Change current location
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

    // Map section

    // Initializes map

    self.initMap = function() {
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 52.267417, lng: 20.981296},
            zoom: 12
        });

        self.createMarkers();

    }

    // MARKER FUNCTIONS

    // Create marker

    self.addMarker = function(data) {
        let marker = new google.maps.Marker({
            position: data.location,
            title: data.title,
            map: self.map,
        });
        return marker;
    }

    // Animate marker

    self.animateMarker = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { marker.setAnimation(null) }, 2000)
    }

    // Fill in marker's array

    self.createMarkers = function() {
        for (let i = 0; i < self.locations.length; i++) {
            self.markers.push(self.addMarker(self.locations[i]()))
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


};



VM = new NeighborhoodMapViewModel()

ko.applyBindings(VM);



function googleCallback() {
    VM.initMap();
}
