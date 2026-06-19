# Silence Zones

A crowd-measured loudness map: tap to measure, log a reading, watch it appear live on a community map, and get an AI-written summary of what's going on.

## Stack
Plain HTML/CSS/JS (no build step, hosts on GitHub Pages) + Supabase (Postgres + Realtime, free tier) + Claude API via a Supabase Edge Function.

## 1. Set up Supabase
1. Create a free project at supabase.com.
2. Open SQL Editor and run all of `supabase/schema.sql`.
3. Go to Project Settings → API, copy your **Project URL** and **anon public key**.
4. Paste both into the placeholders in `js/supabase-client.js`.

## 2. Deploy the AI insight function
Install the [Supabase CLI](https://supabase.com/docs/guides/cli) first, then:
```bash
supabase login
supabase init
supabase link --project-ref your-project-ref
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
supabase functions deploy get-insight
```
Get a key at console.anthropic.com — a hackathon's worth of Haiku calls costs a few cents.

## 3. Run it locally
Microphone access needs a secure context, so don't just double-click `index.html`. Run a local server:
```bash
npx serve .
```
Open the `localhost` URL it prints and allow microphone + location access.

## 4. Push to GitHub and turn on Pages
```bash
git init
git add .
git commit -m "Silence Zones MVP"
git branch -M main
git remote add origin https://github.com/your-username/silence-zones.git
git push -u origin main
```
On GitHub: Settings → Pages → Source → branch `main` → Save. Live in a minute or two at `https://your-username.github.io/silence-zones/` (auto-https, so mic/location work fine).

## Notes for the pitch
- Readings are a relative Loudness Index (0-100), not calibrated decibels — frame as "hotspots," not lab-grade measurement.
- The open insert policy means anyone can write — fine for a demo, but call out rate limiting / anonymous auth as future work if a judge asks.