import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Replace these with your project's values from Supabase dashboard > Settings > API.
// The anon key is SAFE to expose here — it's designed for client-side use and is
// restricted by the Row Level Security policies in supabase/schema.sql.
// Never put your Anthropic API key here — see js/insight-client.js for why.
const SUPABASE_URL = 'https://uvomacuvastzjsvlclpl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hi0T1So52g36Bn9u3VLabA_9v4iF9yA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function insertReading(reading) {
  const { data, error } = await supabase
    .from('noise_readings')
    .insert([reading])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRecentReadings(limit = 200) {
  const { data, error } = await supabase
    .from('noise_readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export function subscribeToNewReadings(onInsert) {
  return supabase
    .channel('noise_readings_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'noise_readings' },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
}