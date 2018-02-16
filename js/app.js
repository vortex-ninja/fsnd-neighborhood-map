const initialLocations = [
    {
        title: 'Żoliborska Szkoła Boksu',
        location: {lat: 52.276894, lng: 20.984726},
    },
    {
        title: 'Arena Wspinaczkowa Makak',
        location: {lat: 52.297340, lng: 20.906519},
    },
    {
        title: 'Szkoła Tańca SalsaLibre',
        location: {lat: 52.261050, lng: 20.970574},
    }
];

// Main viewmodel for the screen
function NeighborhoodMapViewModel() {

    // Data

    var self = this;

    // Create a list of locations as observables

    self.locations = [];
    for (i = 0; i < initialLocations.length; i++) {
        var location = initialLocations[i];
        location.visible = true;

        var listLocation = ko.observable(location)
        self.locations.push(ko.observable(listLocation));
    }

    // Current chosen location
    self.chosenLocation = ko.observable(self.locations[0]());


    // Behaviours

    // Change current location
    self.chooseLocation = function(location) {
        self.chosenLocation(location());
    }

    // Filter function

    function filterList() {

    }
}

ko.applyBindings(new NeighborhoodMapViewModel());