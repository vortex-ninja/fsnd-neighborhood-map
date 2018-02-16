const locations = [
    {
        title: 'Żoliborska Szkoła Boksu',
        location: {lat: 52.276894, lng: 20.984726}
    },
    {
        title: 'Arena Wspinaczkowa Makak',
        location: {lat: 52.297340, lng: 20.906519}
    },
    {
        title: 'Szkoła Tańca SalsaLibre',
        location: {lat: 52.261050, lng: 20.970574}
    }
];

// Main viewmodel for the screen
function NeighborhoodMapViewModel() {

    // Data

    var self = this;
    self.locations = locations;
    self.chosenLocation = ko.observable();

    // Behaviours
    self.chooseLocation = function(location) {
        self.chosenLocation(location);
        console.log(location);
    }
    self.chosenLocation(self.locations[0]);
}

ko.applyBindings(new NeighborhoodMapViewModel());