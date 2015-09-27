function initialize() {
  var mapProp = {
    center:new google.maps.LatLng(37.362128,-121.910308),
    zoom:12,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

  // InfoWindow
  var contentString = '<div class="infoWindow">'+
                        '<h1 class="heading">%heading%</h1>'+
                      '</div>';

  // Markers
  var marker1 = new google.maps.Marker({
    position:{ lat: 37.371392, lng: -121.911432},
    animation: google.maps.Animation.DROP,
    map: map,
    title: '24 Hour Fitness',
    info: new google.maps.InfoWindow({
      content: ''
    })
  });
  var marker2 = new google.maps.Marker({
    position:{ lat: 37.370132, lng: -121.877108},
    animation: google.maps.Animation.DROP,
    map: map,
    title: 'San Jose Flea Market',
    info: new google.maps.InfoWindow({
      content: ''
    })
  });

  // Marker click event listeners
  marker1.addListener('click', markerClickHandler);
  marker2.addListener('click', markerClickHandler);

  // Marker Click Handler
  function markerClickHandler(){
    this.info.setContent(contentString.valueOf().replace('%heading%', this.title));
    this.info.open(map,this);
    toggleBounce(this);
  };

  // Bounce animation on and off for markers
  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){ marker.setAnimation(null); }, 1500);
    }
  }
}

google.maps.event.addDomListener(window, 'load', initialize);
