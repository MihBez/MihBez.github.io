// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoiMjk1ODI2NWIiLCJhIjoiY2xyNmR3bzl2MGJscjJrcnJndHNtcjhtaCJ9.Cz2paMBmL2TpBeK52l1l9A";
//Before map
const beforeMap = new mapboxgl.Map({
  container: "before",
  style: "mapbox://styles/2958265b/clrgdz4zx00i501r20j99hdbb",
  center: [-1.183, 54.058], // change to your centre
  zoom: 7
});

//After map
const afterMap = new mapboxgl.Map({
  container: "after",
  style: "mapbox://styles/2958265b/clrqfbuwt00cy01qyebox2m2v",
  center: [-1.183, 54.058], // change to your centre
  zoom: 7
});
const container = "#comparison-container";
const map = new mapboxgl.Compare(beforeMap, afterMap, container, {});