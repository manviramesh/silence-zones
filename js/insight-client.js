// Calls the Supabase Edge Function that turns recent readings into a
// plain-language insight using Claude. Your Anthropic API key never touches
// this file or the browser — it lives only as a secret on the edge function.
import { supabase } from './supabase-client.js';

export async function getInsight(readings) {
  const { data, error } = await supabase.functions.invoke('get-insight', {
    body: { readings },
  });

  if (error) throw error;
  return data.insight;
}