mapboxgl.accessToken =
  "pk.eyJ1IjoiMjk1ODI2NWIiLCJhIjoiY2xyNmR3bzl2MGJscjJrcnJndHNtcjhtaCJ9.Cz2paMBmL2TpBeK52l1l9A";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/2958265b/cls60q95o005i01r0ei07dwv1",
  center: [-98, 38.88],
  maxZoom: 15,
  minZoom: 1,
  zoom: 3
});

let igsStations = [];

const popup = new mapboxgl.Popup({
  closeButton: false
});

const filterEl = document.getElementById("feature-filter");
const listingEl = document.getElementById("feature-listing");

function renderListings(features) {
  const empty = document.createElement("div");
  listingEl.innerHTML = "";
  if (features.length) {
    for (const feature of features) {
      const itemLink = document.createElement("a");
      const label = `${feature.properties.sitename}`;
      itemLink.href = "#"; // Add a link here if needed
      itemLink.textContent = label;
      itemLink.addEventListener("click", () => {
        popup
          .setLngLat(feature.geometry.coordinates)
          .setText(
            `Site Name: ${feature.properties.sitename}\nSatellite System: ${feature.properties.satellitesystem}`
          )
          .addTo(map);
      });
      listingEl.appendChild(itemLink);
    }

    filterEl.parentNode.style.display = "block";
  } else if (features.length === 0 && filterEl.value !== "") {
    empty.textContent = "No results found";
    listingEl.appendChild(empty);
  } else {
    empty.textContent = "Drag the map to populate results";
    listingEl.appendChild(empty);

    filterEl.parentNode.style.display = "none";
    map.setFilter("igs", ["has", "sitename"]);
  }
}

// Other code remains the same...

function normalize(string) {
  return string.trim().toLowerCase();
}

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

map.on("load", () => {
  map.addSource("igs-stations", {
    type: "vector",
    url:
      "https://api.mapbox.com/datasets/v1/2958265b/cls7mxvvu06bs1to1ut8b4a5n?access_token=YOUR_MAPBOX_ACCESS_TOKEN"
  });
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

  map.on("movestart", () => {
    map.setFilter("igs", ["has", "sitename"]);
  });

  map.on("moveend", () => {
    const features = map.queryRenderedFeatures({ layers: ["igs"] });

    if (features) {
      const uniqueFeatures = getUniqueFeatures(features, "sitename");
      renderListings(uniqueFeatures);

      filterEl.value = "";

      igsStations = uniqueFeatures;
    }
  });

  map.on("mousemove", "igs", (e) => {
    map.getCanvas().style.cursor = "pointer";

    const feature = e.features[0];
    popup
      .setLngLat(feature.geometry.coordinates)
      .setText(
        `Site Name: ${feature.properties.sitename}\nSatellite System: ${feature.properties.satellitesystem}`
      )
      .addTo(map);
  });

  map.on("mouseleave", "igs", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  filterEl.addEventListener("keyup", (e) => {
    const value = normalize(e.target.value);

    const filtered = [];
    for (const feature of igsStations) {
      const name = normalize(feature.properties.sitename);
      if (name.includes(value)) {
        filtered.push(feature);
      }
    }

    renderListings(filtered);

    if (filtered.length) {
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

  renderListings([]);
});
// Add a scale control to the map
map.addControl(new mapboxgl.ScaleControl());

map.addControl(new mapboxgl.NavigationControl(), "top-left");
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
const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Location search on Earth", // Placeholder text for the search bar
  proximity: {
    longitude: 0,
    latitude: 50
  } // Coordinates of Glasgow center
});

// Home button click event
document.getElementById("home-button").addEventListener("click", () => {
  map.flyTo({
    center: [133.88, -26.7],
    zoom: 3.9
  });
});

map.addControl(geocoder, "top-left");

// Home button click event
document.getElementById("home-button").addEventListener("click", () => {
  map.flyTo({
    center: [10, 40],
    zoom: 2.5
  });
});