// Eslint configuration for editor.
/* globals google */
/* eslint-env browser */
/* eslint quotes: ["warn", "single"]
*/
//Creates a map centered on New York City at zoom level 11. 

const map_style = [
  {
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#ebe3cd'
      }
    ]
  },
  {
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#523735'
      }
    ]
  },
  {
    'elementType': 'labels.text.stroke',
    'stylers': [
      {
        'color': '#f5f1e6'
      }
    ]
  },
  {
    'featureType': 'administrative',
    'elementType': 'geometry.stroke',
    'stylers': [
      {
        'color': '#c9b2a6'
      }
    ]
  },
  {
    'featureType': 'administrative.land_parcel',
    'elementType': 'geometry.stroke',
    'stylers': [
      {
        'color': '#dcd2be'
      }
    ]
  },
  {
    'featureType': 'administrative.land_parcel',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#ae9e90'
      }
    ]
  },
  {
    'featureType': 'landscape.natural',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#dfd2ae'
      }
    ]
  },
  {
    'featureType': 'poi',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#dfd2ae'
      }
    ]
  },
  {
    'featureType': 'poi',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#93817c'
      }
    ]
  },
  {
    'featureType': 'poi.park',
    'elementType': 'geometry.fill',
    'stylers': [
      {
        'color': '#a5b076'
      }
    ]
  },
  {
    'featureType': 'poi.park',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#447530'
      }
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#f5f1e6'
      }
    ]
  },
  {
    'featureType': 'road.arterial',
    'stylers': [
      {
        'visibility': 'off'
      }
    ]
  },
  {
    'featureType': 'road.arterial',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#fdfcf8'
      }
    ]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#f8c967'
      }
    ]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry.stroke',
    'stylers': [
      {
        'color': '#e9bc62'
      }
    ]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'labels',
    'stylers': [
      {
        'visibility': 'off'
      }
    ]
  },
  {
    'featureType': 'road.highway.controlled_access',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#e98d58'
      }
    ]
  },
  {
    'featureType': 'road.highway.controlled_access',
    'elementType': 'geometry.stroke',
    'stylers': [
      {
        'color': '#db8555'
      }
    ]
  },
  {
    'featureType': 'road.local',
    'stylers': [
      {
        'visibility': 'off'
      }
    ]
  },
  {
    'featureType': 'road.local',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#806b63'
      }
    ]
  },
  {
    'featureType': 'transit.line',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#dfd2ae'
      }
    ]
  },
  {
    'featureType': 'transit.line',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#8f7d77'
      }
    ]
  },
  {
    'featureType': 'transit.line',
    'elementType': 'labels.text.stroke',
    'stylers': [
      {
        'color': '#ebe3cd'
      }
    ]
  },
  {
    'featureType': 'transit.station',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#dfd2ae'
      }
    ]
  },
  {
    'featureType': 'water',
    'elementType': 'geometry.fill',
    'stylers': [
      {
        'color': '#b9d3c2'
      }
    ]
  },
  {
    'featureType': 'water',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#92998d'
      }
    ]
  }
];


function initMap() {
	
  var pos;
  const map = new google.maps.Map(document.querySelector('#map'), {
    zoom: 18,
    center: {
      // New York City
      lat: 40.7305,
      lng: -73.9091
    },
    styles: map_style
    
  });
  	
     
 	if(navigator.geolocation) { // test for presence of location feature
  navigator.geolocation.getCurrentPosition(function(position) {
    pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    map.setCenter(pos);
  });
}
 
  	const infoWindow = new google.maps.InfoWindow();
    let hotspotDataFeatures = [];
    
    //Load GeoJSON data for our hotspots. 
    
    map.data.loadGeoJson('/data/wifi-hotspots');
  // Styling our map to customize what we see by feature. If the item is indoor, it is green. Otherwise, it is red.
  map.data.setStyle(feature => {
    const inOut = feature.getProperty('location_t');
    
    if (inOut === 'Indoor') {
      return {
          fillColor: '#59EC60',
          strokeColor: '#59EC60',
          fillOpacity: 1.0,  
      };
    }
	
	else if(inOut === 'Outdoor')
    return {
      fillColor: '#EC7D59',
      strokeColor: '#EC7D59',
      fillOpacity: 1.0,
    };
  });
  
  map.data.addListener('click', ev => {
    const f = ev.feature;
    const hotspotName = f.getProperty('ssid');
    const hotspotProvider = f.getProperty('provider');
    const hotspotLoc = f.getProperty('location');
    
    
    
    infoWindow.setContent(`<b> SSID: ${hotspotName} </b><br/>
    <b> Location: ${hotspotLoc} </b> Provider: ${hotspotProvider}`);
    infoWindow.setPosition(f.getGeometry().get());
    infoWindow.setOptions({
      pixelOffset: new google.maps.Size(0, -30)
    });
    infoWindow.open(map);
  });
  
  
  google.maps.event.addListener(map, 'idle', () => {
    const sw = map.getBounds().getSouthWest();
    const ne = map.getBounds().getNorthEast();
    const zm = map.getZoom();
    map.data.loadGeoJson(
      `/data/wifi-hotspots?viewport=${sw.lat()},${sw.lng()}|${ne.lat()},${ne.lng()}&zoom=${zm}`,
      null,
      features => {
        hotspotDataFeatures.forEach(dataFeature => {
          map.data.remove(dataFeature);
        });
        hotspotDataFeatures = features;
      }
    );
  });
  

}