# 🔇 Silence Zones

**Map the noise around you.**

A crowd-measured loudness map built for campus life — find a quiet spot to study, and flag silence-zone violations near hospitals and schools, all from a browser tab.

🔗 **Live demo:** https://manviramesh.github.io/silence-zones/

---

## The problem

India's CPCB Noise Pollution Rules legally cap noise within 100m of hospitals, schools, and courts at 50 dB by day and 40 dB by night — but these "silence zones" are routinely violated, and there's no easy way for ordinary people to flag it or even know it's happening. Meanwhile, students hunting for a quiet corner to study have no way to check before they walk there.

Existing noise-mapping tools are either old academic side-projects or built for entire cities, not a campus. Nothing lets a regular person open a page, tap a button, and contribute a real reading in 10 seconds.

## The idea

Silence Zones turns any phone or laptop browser into a noise sensor:

1. **Tap to measure** — uses the device microphone to read ambient loudness in real time (no app install).
2. **Log a reading** — geotags it and drops a colored dot on a live community map.
3. **Mark silence zones** — flag a spot as near a hospital/school so violations stand out in red.
4. **Get an AI insight** — one tap summarizes recent readings in plain language, calling out violations against the legal CPCB limit.

Every reading from every visitor appears on everyone else's map in real time.

## Features

- 🎙️ Live mic-based loudness meter (Web Audio API, with auto-gain/noise-suppression disabled for an unprocessed signal)
- 🗺️ Real-time community map (Leaflet + OpenStreetMap)
- 🚨 Automatic violation flagging for silence-zone readings
- 🤖 AI-generated insights via the Claude API
- 📱 Works on any phone browser — no install, no login

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | Plain HTML / CSS / JS (no build step) |
| Map | Leaflet.js + OpenStreetMap |
| Database & realtime | Supabase (Postgres) |
| AI insights | Claude API via Supabase Edge Function |
| Hosting | GitHub Pages |

## Important caveat

Readings are a **relative Loudness Index (0–100)**, not a calibrated decibel/SPL measurement — phone and laptop mics vary too much in gain for that. Treat the map as a hotspot indicator, not lab-grade data. This mirrors how real crowdsourced-noise research projects frame phone-mic data: useful for spotting patterns official monitoring misses, not a replacement for calibrated sensors.

## Run it locally

```bash
git clone https://github.com/manviramesh/silence-zones.git
cd silence-zones
npx serve .
```
Open the printed `localhost` URL and allow microphone + location access. (Has to be served, not opened as a file directly — browsers block mic access otherwise.)

Full backend setup (Supabase + Edge Function) is in `SETUP.md`.

## What's next

- Anonymous rate-limiting so one person can't spam fake readings
- Time-of-day overlays (day vs night legal limits)
- Push alerts when a tracked location crosses into violation territory

## Built by

Manvi R