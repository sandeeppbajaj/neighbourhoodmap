
// Variable to hold map object
var map;

// Map center latitude and longitude
var mapCenterLat = 37.362128,
    mapCenterLng = -121.910308;

// Initialization to setup map
function init(){
  // Map Properties (In future, properties can be made dynamic with user inputs)
  var mapProp = {
      center: new google.maps.LatLng(mapCenterLat, mapCenterLng),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
  };

  // Render Map with properties
  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

// InfoWindow Template
var infoWindowTemplate = '<div class="infoWindow">' +
    '<h3 class="heading">%heading%</h3>' +
    '<div class="details">' +
    '<div>%address1%</div>' +
    '<div>%address2%</div>' +
    '<div>%phone%</div>' +
    '<div><a target="_blank" href="%website%">%website%</a></div>' +
    '<div>Rating: %rating%</div>' +
    '</div>' +
    '</div>';

// Bounce animation on and off for markers
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

// Using location as Model
var Location = function(name, lat, lng, info) {
    var self = this;

    // Using title as name for the location
    this.title = ko.observable(name);

    //Creating map marker
    this.marker = new google.maps.Marker({
        position: {
            lat: lat,
            lng: lng
        },
        animation: google.maps.Animation.DROP,
        map: map,
        title: name,
        info: new google.maps.InfoWindow({
            content: info
        })
    });

    // Used to decide visibility of location
    this.isVisible = ko.observable(true);

    // Based on isVisible value show and hide location marker and close infowindow
    this.isVisible.subscribe(function(currentState) {
        if (currentState) {
            self.marker.setVisible(true);
            self.statusCss('');
        } else {
            self.marker.setVisible(false);
            self.marker.info.close();
            self.statusCss('filtered');
        }
    });

    // Css class for location list item, if filtered then CSS hides it in the list
    this.statusCss = ko.observable('');
};

var ViewModel = function() {
    var self = this;

    // Search text
    this.query = ko.observable('');

    // List of locations to be displayed as markers and list items
    this.locationList = ko.observableArray([]);

    // Selected location object. Holds a dummy string to start with
    this.selectedLocation = ko.observable('Dummy');

    // Preparing url for ajax call to four square API
    // Improvements needed to hide client id and client secret
    var foursquareBaseURL = 'https://api.foursquare.com/v2/venues/explore?v=20150929';
    var clientId = 'client_id=YBFLZVYWIMZXWHCS2JYTH1BJ1Z31VKNUN5HVXGBB5KJFIDFI';
    var clientSecret = 'client_secret=KKCUUPPCYDW3ABQDTKGKBHWZ2OIYGLDKO0FNBNMPSP5RNCAM';
    var latlng = 'll=' + mapCenterLat + ',' +  mapCenterLng;
    var requestUrl = foursquareBaseURL + '&' + clientId + '&' + clientSecret + '&' + latlng;

    // Call to get dynamic location/venues using four square API
    $.ajax({
        url: requestUrl,
        success: function(data) {
            var items = data.response.groups[0].items;
            items.forEach(function(item) {
                var venue = item.venue;

                // Preparing template for marker info window
                var info = infoWindowTemplate.valueOf()
                    .replace('%heading%', venue.name)
                    .replace('%phone%', venue.contact.formattedPhone || '')
                    .replace('%address1%', venue.location.formattedAddress[0] || '')
                    .replace('%address2%', venue.location.formattedAddress[1] || '')
                    .replace('%website%', venue.url || '#')
                    .replace('%website%', venue.url || '')
                    .replace('%rating%', venue.rating || '');

                // Creating location object
                var location = new Location(venue.name, venue.location.lat, venue.location.lng, info);

                // Adding click event for location marker
                google.maps.event.addListener(location.marker, 'click', function() {
                    self.selectLocation(location);
                }.bind(location));

                // Add location to main location list
                self.locationList.push(location);
            });
        },
        error: function() {
            alert('Failed to get locations for the neighbourhood');
        }
    });

    // Selecting location and stopping animation for the previous location.
    this.selectLocation = function(location) {
        if (self.selectedLocation() != 'Dummy' && self.selectedLocation() != location) {
            toggleBounce(self.selectedLocation().marker);
            self.selectedLocation().marker.info.close();
        }
        location.marker.info.open(map, location.marker);
        if (self.selectedLocation() != location)
            toggleBounce(location.marker);
        self.selectedLocation(location);
    };

    // Filtering location list and markers based on user inputs in search box
    self.filterLocations = ko.computed(function() {
        var search = self.query().toLowerCase();

        return ko.utils.arrayFilter(self.locationList(), function(location) {
            var contains = location.title().toLowerCase().indexOf(search) >= 0;
            location.isVisible(contains);
            return contains;
        });
    });
};

init();
ko.applyBindings(new ViewModel());
