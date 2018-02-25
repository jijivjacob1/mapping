// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";



var colorLkUpLst = [
  {
    
    limits: "0-1",
    color: "yellow"
  },
  {
    
    limits: "1-2",
    color: "lightgreen"
  },
  {
   
    limits: "2-3",
    color: "green"
  },
  {
    
    limits: "3-4",
    color: "pink"
  },
  {
   
    limits: "4-5",
    color: "orange"
  },
  {
    
    limits: "5-6",
    color: "red"
  },
  {
    
    limits: "6-7",
    color: "darkred"
  },
  {
    
    limits: "7+",
    color: "maroon"
  }

]


function getColor(mag){

    var chk_mag = Math.round(mag) - 1;
    var colorLkUp = colorLkUpLst[chk_mag];
    if(colorLkUp != undefined){
        return colorLkUp.color;
    } 
    else {
        return "crimson";
    }
    


};

plates_url = "https://embed.github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  
});





function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<hr><p>Magnitude=>" + feature.properties.mag + "</p>");
    
    
  }
  

  function pointToLayer(feature, latlng) {
   
    return L.circleMarker(latlng, {
                                    radius: feature.properties.mag,
                                    fillColor: getColor(feature.properties.mag),
                                    color: "#000",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
    });
    
  }

  

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer  });


    var platesData = "";

    d3.json("http://localhost:8000/PB2002_boundaries.json", function(data) {
      // Once we get a response, send the data.features object to the createFeatures function
      platesData = L.geoJSON(data);
      
      // console.log(platesData);
      // console.log(earthquakes);
      // Sending our earthquakes layer to the createMap function
      createMap(earthquakes,platesData);
    });


  

  

  
}

function createMap(earthquakes,platesData) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Street Map": streetmap,
    "Dark Map": darkmap
    
  };

  

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": platesData
  };

 


  

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -15.71
    ],
    zoom: 2,
    layers: [satellite, earthquakes,platesData]
  });

  
 

  // console.log(platesData);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  

/// Add legend 
var legend = L.control({ position: 'bottomright' })
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend')

  var labels = []


  // Add min & max
  div.innerHTML = '<div class="labels"><div class="min"></div> \
    <div class="max"></div></div>'

  colorLkUpLst.forEach(function (data, index) {
    labels.push('<li style="background-color: ' + data.color + '"></li><span align="center">&nbsp;&nbsp;'+ data.limits+'</span> </BR>')
  })

  div.innerHTML += '<ul>' + labels.join('') + '</ul>'
  return div
}
legend.addTo(myMap)
}

