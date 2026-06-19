// Captures microphone input and converts it into a relative "Loudness Index"
// from 0-100. This is NOT a calibrated decibel/SPL reading — phone and laptop
// mics have wildly different gain. Treat it as a signal for comparing
// "louder vs quieter," the same way real crowdsourced-noise research treats
// phone-mic data: good for spotting hotspots, not a lab-grade measurement.

let audioCtx = null;
let analyser = null;
let stream = null;
let intervalId = null;

export async function startMicMonitoring(onReading, intervalMs = 400) {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const buffer = new Uint8Array(analyser.fftSize);

  intervalId = setInterval(() => {
    analyser.getByteTimeDomainData(buffer);

    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      const normalized = (buffer[i] - 128) / 128; // -1..1
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / buffer.length);

    // rms is ~0 (silence) to ~1 (clipping). Shift into a friendlier 0-100 scale.
    const dbfs = rms > 0 ? 20 * Math.log10(rms) : -100;
    const loudnessIndex = Math.max(0, Math.min(100, dbfs + 100));

    onReading(Math.round(loudnessIndex));
  }, intervalMs);
}

export function stopMicMonitoring() {
  if (intervalId) clearInterval(intervalId);
  if (stream) stream.getTracks().forEach((track) => track.stop());
  if (audioCtx) audioCtx.close();
  intervalId = null;
  stream = null;
  audioCtx = null;
  analyser = null;
}

// Relative categories — not tied to legal dB(A) numbers, since this index
// isn't calibrated. Drives marker color and the meter's visual state.
export function categorize(loudnessIndex) {
  if (loudnessIndex < 30) return 'quiet';
  if (loudnessIndex < 60) return 'moderate';
  return 'loud';
}