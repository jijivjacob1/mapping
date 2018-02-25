// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

var earthquakeMag = [];

var earthquakedat = "";

var colorLkUp = {
  1: "yellow",
  2: "lightgreen",
  3: "green",
  4: "orange",
  5: "pink",
  6: "red",
  7: "blue"

}
function getColor(mag){

var v2 = colorLkUp[Math.round(mag)];
if(v2 != undefined){
    return v2;
}
else {
    return "black";
}

}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  // function pointToLayer(feature, latlng) {
   
  //   return L.circleMarker(latlng, {
  //                                   radius: feature.properties.mag,
                                    
  //                                   weight: 0,
  //                                   opacity: 0,
  //                                   fillOpacity: 0.8
  //   });
    
  // }

  // var earthquakes =    L.choropleth(data, {
  //   valueProperty: "mag",
  //   scale: ["#ffffb2", "#b10026"],
  //   steps: 5,
  //   mode: 'q',
  //   style: {
  //     color: '#fff',
  //     weight: 2,
  //     fillOpacity: 0.8
  //   },
  //   onEachFeature: function (feature, layer) {
  //     layer.bindPopup("<h3>" + feature.properties.place +
  //   "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  //   },
  //   pointToLayer: pointToLayer 
    
  // });

  // createMap(earthquakes);
  earthquakedat = data;
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    earthquakeMag.push(feature.properties.mag);
    
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


  

  console.log(earthquakeMag);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -15.71
    ],
    zoom: 2,
    layers: [streetmap, earthquakes]
  });

  // L.geoJson(earthquakedat,{
  //   pointToLayer: function(feature,latlng){
  //     var marker = L.circleMarker(latlng, {
  //       radius: feature.properties.mag,
  //       fillColor:  "#000",
  //       color: "#000",
  //       weight: 1,
  //       opacity: 1,
  //       fillOpacity: 0.8
  //     });
  //     return marker;
  //   }
  // }).addTo(myMap);

  

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  

/// Add legend (don't forget to add the CSS from index.html)
var legend = L.control({ position: 'bottomright' })
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend')
  var limits = [0,1,2,3,4,5,6,7]
  var colors = colorLkUp
  var labels = []

  console.log(limits);
  console.log(colors);

  // Add min & max
  div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
    <div class="max">' + limits[limits.length - 1] + '</div></div>'

  limits.forEach(function (limit, index) {
    labels.push('<li style="background-color: ' + colors[index] + '"></li>')
  })

  div.innerHTML += '<ul>' + labels.join('') + '</ul>'
  return div
}
legend.addTo(myMap)
}
