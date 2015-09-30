
// Map Properties (In future, properties can be made dynamic with user inputs)
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

var Location = function(name,lat,lng,info){
    var self = this;
    this.title = ko.observable(name);
    this.marker = new google.maps.Marker({
      position: {lat: lat, lng: lng},
      animation: google.maps.Animation.DROP,
      map: map,
      title: name,
      info: new google.maps.InfoWindow({
        content: info
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
          var info = infoWindowTemplate.valueOf()
                    .replace('%heading%', venue.name)
                    .replace('%phone%', venue.contact.formattedPhone || '')
                    .replace('%address1%', venue.location.formattedAddress[0] || '')
                    .replace('%address2%', venue.location.formattedAddress[1] || '')
                    .replace('%website%', venue.url)
                    .replace('%website%', venue.url)
                    .replace('%rating%', venue.rating || '');

          var location = new Location(venue.name, venue.location.lat, venue.location.lng, info);
          google.maps.event.addListener(location.marker, 'click', function() {
              self.selectLocation(location);
          }.bind(location));

          self.locationList.push(location);
        });
      },
      error: function(){
        alert('Failed to get locations for the neighbourhood');
      }
    });

    this.selectLocation = function(location){
      if(self.selectedLocation() != 'Dummy' && self.selectedLocation() != location){
        toggleBounce(self.selectedLocation().marker);
        self.selectedLocation().marker.info.close();
      }
      location.marker.info.open(map,location.marker);
      if(self.selectedLocation() != location)
        toggleBounce(location.marker);
      self.selectedLocation(location);
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
