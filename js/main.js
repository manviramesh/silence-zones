// Wires the UI together: mic monitoring -> meter display, geolocation,
// saving readings to Supabase, live map updates, and the AI insight button.
import { startMicMonitoring, stopMicMonitoring, categorize } from './audio.js';
import { initMap, renderReadings, addReadingMarker } from './map.js';
import { insertReading, fetchRecentReadings, subscribeToNewReadings } from './supabase-client.js';
import { getInsight } from './insight-client.js';

const rippleMeter = document.getElementById('rippleMeter');
const readingValue = document.getElementById('readingValue');
const readingLabel = document.getElementById('readingLabel');
const toggleBtn = document.getElementById('toggleBtn');
const logBtn = document.getElementById('logBtn');
const silenceZoneCheck = document.getElementById('silenceZoneCheck');
const categorySelect = document.getElementById('categorySelect');
const statusMsg = document.getElementById('statusMsg');
const insightBtn = document.getElementById('insightBtn');
const insightText = document.getElementById('insightText');

let isMonitoring = false;
let currentLoudness = 0;
let currentCategory = 'quiet';
let currentPosition = null;

initMap('map');

async function loadExisting() {
  try {
    const readings = await fetchRecentReadings(200);
    renderReadings(readings, categorize);
  } catch (err) {
    console.error('Could not load existing readings:', err);
    statusMsg.textContent = 'Could not load existing readings — check your Supabase config.';
  }
}

function updateMeterDisplay(loudness) {
  currentLoudness = loudness;
  currentCategory = categorize(loudness);

  readingValue.textContent = loudness;
  readingLabel.textContent =
    currentCategory === 'quiet' ? 'Quiet' : currentCategory === 'moderate' ? 'Moderate' : 'Loud';

  rippleMeter.style.setProperty('--level', String(loudness / 100));

  const isViolation = silenceZoneCheck.checked && currentCategory === 'loud';
  rippleMeter.dataset.state = isViolation ? 'violation' : currentCategory;
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

toggleBtn.addEventListener('click', async () => {
  if (!isMonitoring) {
    try {
      statusMsg.textContent = 'Requesting microphone access…';
      await startMicMonitoring(updateMeterDisplay);
      currentPosition = await getLocation().catch(() => null);
      isMonitoring = true;
      toggleBtn.textContent = 'Stop measuring';
      logBtn.disabled = false;
      statusMsg.textContent = currentPosition
        ? 'Measuring — log a reading whenever you like.'
        : 'Measuring — location unavailable, readings will save without a position.';
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Microphone access denied or unavailable.';
    }
  } else {
    stopMicMonitoring();
    isMonitoring = false;
    toggleBtn.textContent = 'Start measuring';
    logBtn.disabled = true;
    statusMsg.textContent = '';
  }
});

logBtn.addEventListener('click', async () => {
  if (!currentPosition) currentPosition = await getLocation().catch(() => null);
  if (!currentPosition) {
    statusMsg.textContent = 'Need your location to log a reading — allow location access and try again.';
    return;
  }

  const reading = {
    latitude: currentPosition.latitude,
    longitude: currentPosition.longitude,
    loudness_index: currentLoudness,
    category: categorySelect.value,
    is_silence_zone: silenceZoneCheck.checked,
  };

  try {
    logBtn.disabled = true;
    const saved = await insertReading(reading);
    addReadingMarker(saved, categorize(saved.loudness_index));
    statusMsg.textContent = 'Reading logged — thanks!';
  } catch (err) {
    console.error(err);
    statusMsg.textContent = 'Could not save that reading. Check your Supabase config.';
  } finally {
    logBtn.disabled = false;
  }
});

insightBtn.addEventListener('click', async () => {
  insightBtn.disabled = true;
  insightText.textContent = 'Thinking…';
  try {
    const readings = await fetchRecentReadings(30);
    insightText.textContent = await getInsight(readings);
  } catch (err) {
    console.error(err);
    insightText.textContent = 'Could not get an insight right now — check your edge function deployment.';
  } finally {
    insightBtn.disabled = false;
  }
});

subscribeToNewReadings((newReading) => {
  addReadingMarker(newReading, categorize(newReading.loudness_index));
});

loadExisting();