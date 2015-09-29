// Map Properties
var mapProp = {
  center:new google.maps.LatLng(37.362128,-121.910308),
  zoom:12,
  mapTypeId:google.maps.MapTypeId.ROADMAP

};

// Render Map with properties
var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

//Initial Map Locations
var initialLocation = [
  {title: '24 Hour Fitness', position:{lat: 37.371392, lng: -121.911432}},
  {title: 'San Jose Flea Market',position:{lat: 37.370132, lng: -121.877108}},
  {title: 'California\'s Great America',position:{lat: 37.397946, lng: -121.974294}},
  {title: 'Great Mall',position:{lat: 37.416385, lng: -121.897841}},
  {title: 'West Field Valley Fair Mall',position:{lat: 37.325327, lng: -121.94538}}
];

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
   setTimeout(function(){ marker.setAnimation(null); }, 1500);
 }
}

var Location = function(data){
  var self = this;
  this.title = ko.observable(data.title);
  this.marker = new google.maps.Marker({
    position: data.position,
    animation: google.maps.Animation.DROP,
    map: map,
    title: data.title,
    info: new google.maps.InfoWindow({
      content: infoWindowTemplate.valueOf().replace('%heading%',data.title)
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
  initialLocation.forEach(function(locationItem){
    self.locationList.push(new Location(locationItem));
  });

  this.activateLocation = function(location){
    location.marker.info.open(map,location.marker);
    toggleBounce(location.marker);
  };

  self.filterPins = ko.computed(function(){
    var search = self.query().toLowerCase();

    return ko.utils.arrayFilter(self.locationList(), function(location){
        var contains = location.title().toLowerCase().indexOf(search) >= 0;
        location.isVisible(contains);
        return contains;
    });
  });
};

ko.applyBindings(new ViewModel());
