export const displayMap = (locations) => {
  var map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: false,
  }).setView([locations[0].coordinates[1], locations[0].coordinates[0]], 10);

  L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 20,
  }).addTo(map);

  const bounds = L.latLngBounds();
  // ✅ Add Markers from `locations`
  if (locations) {
    const customIcon = L.divIcon({
      className: "marker",
      html: '<div class="marker"></div>',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });

    // ✅ Add Markers with Custom Class
    locations.forEach((loc) => {
      L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `<p class="mapboxgl-popup-content">Day ${loc.day}: ${loc.description}`
        );
      bounds.extend([loc.coordinates[1], loc.coordinates[0]]);
    });
    map.fitBounds(bounds);
  }
};
