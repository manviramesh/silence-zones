// Deploy with: supabase functions deploy get-insight
// Set the secret first: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// This is the ONLY place the Anthropic API key should ever live. Never put
// it in client-side JS or commit it to GitHub — anyone viewing your repo's
// source could copy it and run up charges on your account.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Provide a minimal declaration for the Deno global so the TypeScript
// checker used in the editor/build doesn't complain. The actual runtime
// is Deno when deployed to Supabase functions.
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { readings } = await req.json();

    const summary = (readings || [])
      .slice(0, 30)
      .map((r: any) => {
        const time = new Date(r.created_at).toLocaleTimeString();
        const zone = r.is_silence_zone ? "silence zone" : r.category;
        return `- ${zone}, loudness index ${r.loudness_index}/100, at ${time}`;
      })
      .join("\n");

    const prompt = `You're writing a one or two sentence insight for a student civic-tech dashboard called Silence Zones, which crowd-sources noise readings (a 0-100 relative loudness index, not calibrated decibels).

Recent readings:
${summary || "No readings yet."}

Write a short, plain-language insight. If any silence-zone reading has a loudness index above 60, mention it specifically and note that India's CPCB rules cap silence zones (within 100m of hospitals/schools) at 50 dB by day and 40 dB by night. Otherwise, just describe the overall pattern (quiet, mixed, busy). Keep it factual, no more than 2 sentences, no exclamation marks.`;

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on this function.");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic API error: ${await response.text()}`);

    const data = await response.json();
    const insight = data.content?.[0]?.text?.trim() || "No insight available yet.";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});