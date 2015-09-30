// Map Properties
var mapProp = {
  center:new google.maps.LatLng(37.362128,-121.910308),
  zoom:12,
  mapTypeId:google.maps.MapTypeId.ROADMAP

};

// Render Map with properties
var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

// InfoWindow Template
var infoWindowTemplate = '<div class="infoWindow">'+
                          '<h3 class="heading">%heading%</h3>'+
                         '</div>';

// Bounce animation on and off for markers
function toggleBounce(marker) {
 if (marker.getAnimation() !== null) {
   marker.setAnimation(null);
 } else {
   marker.setAnimation(google.maps.Animation.BOUNCE);
 }
}

var Location = function(name,lat,lng){
  var self = this;
  this.title = ko.observable(name);
  this.marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    animation: google.maps.Animation.DROP,
    map: map,
    title: name,
    info: new google.maps.InfoWindow({
      content: infoWindowTemplate.valueOf().replace('%heading%',name)
    })
  });
  this.isVisible = ko.observable(false);

  this.isVisible.subscribe(function(currentState){
      if (currentState){
        self.marker.setVisible(true);
      } else {
        self.marker.setVisible(false);
        self.marker.info.close();
      }
  });

  google.maps.event.addListener(this.marker, 'click', function() {
      this.marker.info.open(map,this.marker);
      toggleBounce(this.marker);
  }.bind(this));

  this.isVisible(true);

  this.statusCss = ko.computed(function(){
      if(!self.isVisible()){
        return 'filtered';
      }else{
        return '';
      }
  });
};

var ViewModel = function(){
  var self = this;

  this.query = ko.observable('');

  this.locationList = ko.observableArray([]);
  this.selectedLocation = ko.observable('Dummy');
  var foursquareBaseURL = 'https://api.foursquare.com/v2/venues/explore?v=20150929';
	var clientId = 'client_id=YBFLZVYWIMZXWHCS2JYTH1BJ1Z31VKNUN5HVXGBB5KJFIDFI'
  var clientSecret= 'client_secret=KKCUUPPCYDW3ABQDTKGKBHWZ2OIYGLDKO0FNBNMPSP5RNCAM';
	var latlng = 'll=37.362128,-121.910308';
  var requestUrl = foursquareBaseURL + '&' + clientId + '&' + clientSecret + '&' + latlng;
  $.ajax({
    url: requestUrl,
    success: function(data){
      var items = data.response.groups[0].items;
      items.forEach(function(item){
        var venue = item.venue;
        self.locationList.push(new Location(venue.name, venue.location.lat, venue.location.lng));
      });
    },
    error: function(){
      alert('Failed to get locations for the neighbourhood');
    }
  });

  this.activateLocation = function(location){
    var currentLocation = self.selectedLocation();
    if(currentLocation != 'Dummy'){
      currentLocation.marker.setAnimation(null);
      currentLocation.marker.info.close();
    }
    self.selectedLocation(location);
    location.marker.info.open(map,location.marker);
    toggleBounce(location.marker);
  };

  self.filterLocations = ko.computed(function(){
    var search = self.query().toLowerCase();

    return ko.utils.arrayFilter(self.locationList(), function(location){
        var contains = location.title().toLowerCase().indexOf(search) >= 0;
        location.isVisible(contains);
        return contains;
    });
  });
};

ko.applyBindings(new ViewModel());
