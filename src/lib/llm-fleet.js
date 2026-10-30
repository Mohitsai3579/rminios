import { generateText as generateGeminiText } from './gemini.js';
import { createClient } from '@supabase/supabase-js';

// Helper to access admin Supabase safely
const getAdminSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

/**
 * Fetch saved fleet configuration from database
 */
export async function getFleetConfig() {
  try {
    const supabase = getAdminSupabase();
    if (supabase) {
      const { data } = await supabase.from('system_settings').select('value').eq('key', 'fleet_config').single();
      if (data?.value) return data.value;
    }
  } catch (err) {
    console.warn('Could not read fleet_config from DB:', err.message);
  }

  // Fallback default fleet config
  return {
    google: { enabled: true, model: 'gemini-3.5-flash', key: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY },
    openai: { enabled: !!process.env.OPENAI_API_KEY, model: 'gpt-4o', key: process.env.OPENAI_API_KEY || '' },
    anthropic: { enabled: !!process.env.ANTHROPIC_API_KEY, model: 'claude-3-5-sonnet-20241022', key: process.env.ANTHROPIC_API_KEY || '' },
    grok: { enabled: !!process.env.GROK_API_KEY || !!process.env.XAI_API_KEY, model: 'grok-2-latest', key: process.env.GROK_API_KEY || process.env.XAI_API_KEY || '' },
    master_provider: 'google'
  };
}

/**
 * Call OpenAI API directly with fallback to Gemini
 */
async function callOpenAI({ prompt, systemInstruction = '', apiKey, model = 'gpt-4o' }) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OpenAI API key missing');

  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error [${res.status}]: ${err}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

/**
 * Call Anthropic API directly with fallback to Gemini
 */
async function callAnthropic({ prompt, systemInstruction = '', apiKey, model = 'claude-3-5-sonnet-20241022' }) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Anthropic API key missing');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      system: systemInstruction || undefined,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error [${res.status}]: ${err}`);
  }

  const json = await res.json();
  return json.content?.[0]?.text || '';
}

/**
 * Call xAI Grok API directly with fallback to Gemini
 */
async function callGrok({ prompt, systemInstruction = '', apiKey, model = 'grok-2-latest' }) {
  const key = apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!key) throw new Error('xAI Grok API key missing');

  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: model || 'grok-2-latest',
      messages,
      temperature: 0.8
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`xAI Grok API error [${res.status}]: ${err}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

/**
 * Universal Fleet Dispatcher:
 * Calls the targeted provider if key available, or falls back transparently
 * to Gemini 3.5 Flash while maintaining the requested agent persona.
 */
export async function callFleetAgent({
  provider = 'google',
  agentRole = 'General AI',
  prompt,
  systemInstruction = '',
  userKey = '',
  preferredModel = ''
}) {
  const fleet = await getFleetConfig();
  const targetProvider = provider.toLowerCase();
  const effectiveKey = userKey || fleet[targetProvider]?.key;

  const enrichedInstruction = `${systemInstruction}\nYou are acting as specialized agent: "${agentRole}". Embody this role with extreme precision, academic rigor, and depth.`;

  // 1. Try OpenAI if requested
  if (targetProvider === 'openai' && (effectiveKey || process.env.OPENAI_API_KEY)) {
    try {
      const text = await callOpenAI({
        prompt,
        systemInstruction: enrichedInstruction,
        apiKey: effectiveKey,
        model: preferredModel || fleet.openai?.model || 'gpt-4o'
      });
      return { text, providerUsed: 'OpenAI GPT-4o', simulated: false };
    } catch (err) {
      console.warn(`[Fleet] OpenAI failed: ${err.message}. Seamlessly falling back to Gemini engine...`);
    }
  }

  // 2. Try Anthropic if requested
  if (targetProvider === 'anthropic' && (effectiveKey || process.env.ANTHROPIC_API_KEY)) {
    try {
      const text = await callAnthropic({
        prompt,
        systemInstruction: enrichedInstruction,
        apiKey: effectiveKey,
        model: preferredModel || fleet.anthropic?.model || 'claude-3-5-sonnet-20241022'
      });
      return { text, providerUsed: 'Anthropic Claude 3.5', simulated: false };
    } catch (err) {
      console.warn(`[Fleet] Anthropic failed: ${err.message}. Seamlessly falling back to Gemini engine...`);
    }
  }

  // 3. Try xAI Grok if requested
  if (targetProvider === 'grok' && (effectiveKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY)) {
    try {
      const text = await callGrok({
        prompt,
        systemInstruction: enrichedInstruction,
        apiKey: effectiveKey,
        model: preferredModel || fleet.grok?.model || 'grok-2-latest'
      });
      return { text, providerUsed: 'xAI Grok 2', simulated: false };
    } catch (err) {
      console.warn(`[Fleet] Grok failed: ${err.message}. Seamlessly falling back to Gemini engine...`);
    }
  }

  // 4. Fallback / Default: Google Gemini 3.5 Flash (Rock-solid, fast, multi-modal)
  try {
    const text = await generateGeminiText(prompt, enrichedInstruction);
    const label = targetProvider === 'google' 
      ? 'Google Gemini 3.5 Flash' 
      : `Google Gemini 3.5 Flash (Autonomous Failover for ${targetProvider.toUpperCase()})`;
    return { text, providerUsed: label, simulated: targetProvider !== 'google' };
  } catch (err) {
    console.error('[Fleet] Core Gemini dispatch failed:', err.message);
    throw err;
  }
}
