// Sets up the Leaflet map and renders readings as colored circle markers.
// Plain Leaflet circles only — no extra heatmap plugin to manage.

const CATEGORY_COLORS = {
  quiet: '#2d6b66',
  moderate: '#e8c46a',
  loud: '#e8954a',
};
const VIOLATION_COLOR = '#e15a4a';

let map = null;
const markersById = new Map();

export function initMap(elementId, center = [12.9716, 77.5946], zoom = 13) {
  // Default center is Bengaluru — change to your own campus coordinates.
  map = L.map(elementId).setView(center, zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  return map;
}

export function addReadingMarker(reading, category) {
  const isViolation = reading.is_silence_zone && category === 'loud';
  const color = isViolation ? VIOLATION_COLOR : (CATEGORY_COLORS[category] || CATEGORY_COLORS.quiet);

  const marker = L.circleMarker([reading.latitude, reading.longitude], {
    radius: 9,
    color,
    fillColor: color,
    fillOpacity: 0.55,
    weight: 1.5,
  }).addTo(map);

  const when = new Date(reading.created_at).toLocaleString();
  marker.bindPopup(
    `<strong>${isViolation ? 'Possible silence-zone violation' : reading.category}</strong><br/>` +
    `Loudness index: ${reading.loudness_index}/100<br/>${when}`
  );

  markersById.set(reading.id, marker);
  return marker;
}

export function renderReadings(readings, categorizeFn) {
  readings.forEach((r) => {
    if (!markersById.has(r.id)) addReadingMarker(r, categorizeFn(r.loudness_index));
  });
}