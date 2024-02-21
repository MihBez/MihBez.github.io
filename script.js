// Setting up Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiMjk1ODI2NWIiLCJhIjoiY2xyNmR3bzl2MGJscjJrcnJndHNtcjhtaCJ9.Cz2paMBmL2TpBeK52l1l9A";

// Creating a new Mapbox map instance
const map = new mapboxgl.Map({
  container: "map", // HTML element with id="map" to hold the map
  style: "mapbox://styles/2958265b/cls60q95o005i01r0ei07dwv1", // Map style URL
  center: [-98, 38.88], // Initial center coordinates [longitude, latitude]
  maxZoom: 15, // Maximum zoom level
  minZoom: 1, // Minimum zoom level
  zoom: 3 // Initial zoom level
});

// Array to store information about IGS stations
let igsStations = [];

// Creating a popup for displaying information on map features
const popup = new mapboxgl.Popup({
  closeButton: false // Hide close button on popup
});

// Getting DOM elements for filter input and feature listing
const filterEl = document.getElementById("feature-filter");
const listingEl = document.getElementById("feature-listing");

// Function to render feature listings based on input features
function renderListings(features) {
  const empty = document.createElement("div");
  listingEl.innerHTML = "";
  if (features.length) {
    // If features exist, render them as links
    for (const feature of features) {
      const itemLink = document.createElement("a");
      const label = `${feature.properties.sitename}`;
      itemLink.href = "#"; // Placeholder link
      itemLink.textContent = label;
      // Add click event listener to display popup with feature info
      itemLink.addEventListener("click", () => {
        popup
          .setLngLat(feature.geometry.coordinates)
          .setHTML(
            `
        <h3>${feature.properties.sitename}</h3>
        <p><strong>Satellite System:</strong> ${feature.properties.satellitesystem}</p>
        <p><strong>Antenna:</strong> ${feature.properties.Antenna}</p>
        <p><strong>Receiver:</strong> ${feature.properties.Receiver}</p>
        <p><strong>Country:</strong> ${feature.properties.country}</p>
        <p><strong>Agencies:</strong> ${feature.properties.Agencies}</p>
      `
          )
          .addTo(map);
      });
      listingEl.appendChild(itemLink);
    }
    // Display filter input if there are features
    filterEl.parentNode.style.display = "block";
  } else if (features.length === 0 && filterEl.value !== "") {
    // If no features match the filter, display no results message
    empty.textContent = "No results found";
    listingEl.appendChild(empty);
  } else {
    // If no features, display message to drag the map to populate results
    empty.textContent = "Drag the map to populate results";
    listingEl.appendChild(empty);
    filterEl.parentNode.style.display = "none"; // Hide filter input
    map.setFilter("igs", ["has", "sitename"]); // Show all features on map
  }
}

// Function to normalize string for case-insensitive comparison
function normalize(string) {
  return string.trim().toLowerCase();
}

// Function to get unique features based on a property
function getUniqueFeatures(features, comparatorProperty) {
  const uniqueIds = new Set();
  const uniqueFeatures = [];
  for (const feature of features) {
    const id = feature.properties[comparatorProperty];
    if (!uniqueIds.has(id)) {
      uniqueIds.add(id);
      uniqueFeatures.push(feature);
    }
  }
  return uniqueFeatures;
}

// Event listener when map is loaded
map.on("load", () => {
  // Add a vector source for IGS stations data
  map.addSource("igs-stations", {
    type: "vector",
    url:
      "https://api.mapbox.com/datasets/v1/2958265b/cls7mxvvu06bs1to1ut8b4a5n?access_token=pk.eyJ1IjoiMjk1ODI2NWIiLCJhIjoiY2xyNmR3bzl2MGJscjJrcnJndHNtcjhtaCJ9.Cz2paMBmL2TpBeK52l1l9A"
  });
  // Add a layer to display IGS stations as circles on the map
  map.addLayer({
    id: "igs",
    source: "igs-stations",
    "source-layer": "igs",
    type: "circle",
    paint: {
      "circle-color": "#4264fb",
      "circle-radius": 4,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });

  // Event listener for map movestart event
  map.on("movestart", () => {
    map.setFilter("igs", ["has", "sitename"]); // Show all features on map
  });

  // Event listener for map moveend event
  map.on("moveend", () => {
    const features = map.queryRenderedFeatures({ layers: ["igs"] });
    if (features) {
      const uniqueFeatures = getUniqueFeatures(features, "sitename");
      renderListings(uniqueFeatures); // Render feature listings
      filterEl.value = ""; // Clear filter input value
      igsStations = uniqueFeatures; // Update array of IGS stations
    }
  });

  // Event listener for mousemove event on IGS stations layer
  map.on("mousemove", "igs", (e) => {
    map.getCanvas().style.cursor = "pointer"; // Change cursor to pointer
    const feature = e.features[0];
    popup
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `
        <h3>${feature.properties.sitename}</h3>
        <p><strong>Satellite System:</strong> ${feature.properties.satellitesystem}</p>
        <p><strong>Antenna:</strong> ${feature.properties.Antenna}</p>
        <p><strong>Receiver:</strong> ${feature.properties.Receiver}</p>
        <p><strong>Country:</strong> ${feature.properties.country}</p>
        <p><strong>Agencies:</strong> ${feature.properties.Agencies}</p>
      `
      )
      .addTo(map);
  });

  // Event listener for mouseleave event on IGS stations layer
  map.on("mouseleave", "igs", () => {
    map.getCanvas().style.cursor = ""; // Reset cursor
    popup.remove(); // Remove popup
  });

  // Event listener for keyup event on filter input
  filterEl.addEventListener("keyup", (e) => {
    const value = normalize(e.target.value);
    const filtered = [];
    for (const feature of igsStations) {
      const name = normalize(feature.properties.sitename);
      if (name.includes(value)) {
        filtered.push(feature);
      }
    }
    renderListings(filtered); // Render filtered feature listings
    if (filtered.length) {
      // If filtered features exist, update map filter
      map.setFilter("igs", [
        "match",
        ["get", "sitename"],
        filtered.map((feature) => {
          return feature.properties.sitename;
        }),
        true,
        false
      ]);
    }
  });

  renderListings([]); // Render initial feature listings
});

// Add a scale control to the map
map.addControl(new mapboxgl.ScaleControl());

// Add navigation control to the map
map.addControl(new mapboxgl.NavigationControl(), "top-left");

// Add geolocate control to the map
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-left"
);

// Initialize Mapbox geocoder control
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, // Set access token
  mapboxgl: mapboxgl, // Set mapbox-gl instance
  marker: false, // Disable default marker style
  placeholder: "Location search on Earth", // Placeholder text for search bar
  proximity: {
    longitude: 0,
    latitude: 50
  } // Coordinates of Glasgow center
});

// Event listener for home button click
document.getElementById("home-button").addEventListener("click", () => {
  // Fly to specified coordinates and zoom level
  map.flyTo({
    center: [133.88, -26.7],
    zoom: 3.9
  });
});

// Add geocoder control to the map
map.addControl(geocoder, "top-left");

// Event listener for home button click
document.getElementById("home-button").addEventListener("click", () => {
  // Fly to specified coordinates and zoom level
  map.flyTo({
    center: [10, 40],
    zoom: 2.5
  });
});