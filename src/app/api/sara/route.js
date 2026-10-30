import { NextResponse } from 'next/server';
import { callFleetAgent } from '@/lib/llm-fleet';
import { aiRateLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const { 
      message, 
      history, 
      clientTime, 
      clientTimezone, 
      clientFormattedDate, 
      clientTimeStr,
      provider = 'google',
      preferredModel = '',
      userKeys = {}
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: 'Please provide a valid prompt or question.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && !aiRateLimiter.check(user.id)) {
      return NextResponse.json({ 
        reply: '⚠️ Rate limit exceeded. Please wait a minute before requesting again.',
        providerUsed: 'Rate Limiter'
      }, { status: 429 });
    }

    let userRole = 'visitor';
    let ownerName = 'Mohit Jonnadula';
    let supportEmail = 'mohitjonnadula16@gmail.com';
    let supportPhone = '9494366318';

    // Fetch site settings from database
    try {
      const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
      if (settings) {
        ownerName = settings.owner_name || ownerName;
        supportEmail = settings.support_email || supportEmail;
        supportPhone = settings.support_phone || supportPhone;
      }
    } catch (e) {
      console.warn('Could not fetch site_settings in Sara API:', e.message);
    }

    if (user) {
      userRole = 'user';
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role) userRole = profile.role;
      } catch (e) {
        console.warn('Could not fetch profile in Sara API:', e.message);
      }
    }

    // Resolve real-time temporal anchor (Exact Date, Day of Week, Time, Timezone)
    const userTz = clientTimezone || 'Asia/Kolkata';
    const now = clientTime ? new Date(Number(clientTime) || clientTime) : new Date();

    let fullDateStr = clientFormattedDate;
    let dayOfWeek = '';
    let timeStr = clientTimeStr;

    try {
      if (!fullDateStr) {
        fullDateStr = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: userTz
        }).format(now);
      }
      dayOfWeek = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: userTz
      }).format(now);
      if (!timeStr) {
        timeStr = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short',
          timeZone: userTz
        }).format(now);
      }
    } catch (e) {
      fullDateStr = now.toDateString();
      dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
      timeStr = now.toLocaleTimeString();
    }

    // Build comprehensive system prompt with live temporal anchor and deep intelligence
    const temporalContext = `
================================================================================
CRITICAL REAL-TIME CLOCK & TEMPORAL CONTEXT:
- Exact Today's Date: ${fullDateStr}
- Current Day of the Week: ${dayOfWeek}
- Current Local Time: ${timeStr}
- Local Timezone: ${userTz}
- ISO UTC Timestamp: ${now.toISOString()}

TEMPORAL DIRECTIVE:
You have native, real-time temporal awareness. When asked about:
1. Today's date, day of the week, month, year, or current time: Answer directly, accurately, and naturally based on the data above.
2. Relative dates (yesterday, tomorrow, next week, current quarter, upcoming deadlines): Compute them accurately relative to today (${dayOfWeek}, ${fullDateStr}).
3. Current year: The current year is ${now.getFullYear()}.
NEVER state that you lack real-time access or cannot know the current date and day.
================================================================================
`;

    const platformCapabilitiesContext = `
================================================================================
RMINIOS PLATFORM KNOWLEDGE BASE & FEATURE NAVIGATION:
You are the central orchestrator for RMinios (Research Operating System), an advanced multi-agent scientific discovery platform with 52 production routes. When users ask for guidance, you can provide direct links and actionable instructions:

1. 🌌 3D Citation Constellation & Knowledge Galaxy (/dashboard/galaxy):
   WebGL 3D celestial force-directed physics graph connecting landmark papers and automatically pinpointing unexplored interdisciplinary "white spaces".
2. 🧪 In-Browser Python Experiment Sandbox (/dashboard/sandbox):
   Runs Python 3.11 in-browser via Pyodide WebAssembly with zero server execution latency. Validates Attention mechanisms O(N²), DDPM diffusion noise schedules, and enzyme kinetics with empirical validation match scores.
3. 🎙️ Autonomous Research Podcast & Audio Studio (/dashboard/podcast):
   NotebookLM-style dual-host conversational scientific dialogue (Dr. Alex & Dr. Jordan) with live speech synthesis and synchronized transcript highlighting.
4. ⚖️ Multi-Agent Adversarial Peer Review Committee (/dashboard/peer-review):
   3 specialized adversarial reviewers (Prof. Sterling for Theory, Dr. Vance for Systems/Hardware, Dr. Lin for Reproducibility/Ethics) + Senior Area Chair meta-verdicts and author rebuttal generator.
5. 🚀 Academic-to-Startup Venture Studio & Pitch Deck Generator (/dashboard/venture):
   Transforms academic research into commercial deep-tech startups. Computes TAM/SAM/SOM market sizing, defensible moats, unit economics, and 10-slide VC pitch decks with interactive presentation mode.
6. 🛡️ Scientific Integrity Shield & Citation Authenticator (/dashboard/integrity):
   Scans papers for retracted citations, DOI verification, hallucinated references, and conflict-of-interest disclosures.
7. 🎯 Autonomous Grant Intelligence & Funding Radar (/dashboard/grants):
   AI-powered radar cross-matching research proposals with $500M+ funding calls from NSF, NIH, DARPA, and Horizon Europe.
8. 🐝 Multi-Agent Swarm Arena (/dashboard/swarm):
   Collaborative multi-LLM debate orchestrating OpenAI GPT-4o, Anthropic Claude 3.5, and xAI Grok.
9. 🎨 Generative Architecture Canvas (/dashboard/workspace/[id]?tab=canvas):
   Generative AI scientific diagramming, neural schematics, and bio-molecular flowcharts.
10. 📝 LaTeX Paper Editor & Semantic Search (/dashboard/workspace/[id]?tab=editor):
    Real-time collaborative LaTeX authoring with automated literature search and citation formatting.
11. 🎧 Deep Work Soundscape Studio:
    Integrates Spotify Web Playback SDK and generative binaural beats (Alpha/Gamma/Theta) for uninterrupted deep focus.
12. 📊 Admin Mission Control (/admin/settings, /admin/rag, /admin/users):
    Real-time fleet telemetry, database health, vector search tuning, and site configuration.
================================================================================
`;

    let roleSpecificPrompt = '';

    if (userRole === 'admin' || userRole === 'superadmin') {
      roleSpecificPrompt = `
You are talking to an authenticated SYSTEM ADMINISTRATOR.
You are fully authorized to:
1. Discuss system architecture, database models (Supabase PostgreSQL), telemetry, and LLM fleet health.
2. Review API usage, RAG hybrid search indexing (gemini-embedding-001), vector embeddings, and site settings.
3. Help inspect and debug platform features, multi-agent pipelines, and server configurations.
Tone: Highly technical, authoritative, precise, and proactive. Use markdown tables, code snippets, and structural breakdowns.`;
    } else if (userRole === 'user') {
      roleSpecificPrompt = `
You are talking to an authenticated RESEARCHER / SCIENTIST.
Your role:
1. Act as an elite Principal Research Scientist, AI Engineer, and Co-author.
2. Assist with literature reviews, mathematical equations (render using LaTeX notation), experimental design, and code generation (Python, PyTorch, SQL, React).
3. Guide the researcher through RMinios tools (Galaxy 3D, Sandbox, Peer Review, Podcast Studio, Venture Studio) to accelerate their papers and discoveries.
4. Answer general scientific, coding, math, and real-world queries with deep intellectual rigor.
SECURITY BOUNDARY: Do not reveal backend environment secrets or private service-role keys.`;
    } else {
      roleSpecificPrompt = `
You are talking to a VISITOR exploring the RMinios platform.
Your role:
1. Welcome the visitor with enthusiasm, warmth, and intellectual brilliance.
2. Answer any question they have intelligently—whether about research, coding, algorithms, science, or the current date and day.
3. Showcase what RMinios can do (the 3D Knowledge Galaxy, Pyodide Sandbox, Multi-Agent Peer Review, Venture Pitch Generator, and Swarm Intelligence).
4. Guide them to sign up at /signup to start building their research projects.
5. If they ask about the owner or support contacts, provide:
   - Creator/Owner: ${ownerName}
   - Email: ${supportEmail}
   - Phone: ${supportPhone}
SECURITY BOUNDARY: Do not reveal backend environment secrets or private service-role keys.`;
    }

    const systemPrompt = `You are Sara, the Principal AI Solutions Architect & Autonomous Research Copilot for the RMinios Research Operating System.

${temporalContext}

${platformCapabilitiesContext}

${roleSpecificPrompt}

GENERAL INTELLIGENCE INSTRUCTIONS:
- You are a true high-intelligence frontier LLM copilot. Do not behave like a rigid or robotic script.
- Answer user questions thoroughly, creatively, and accurately.
- When writing code or equations, provide clean syntax-highlighted code blocks with explanations.
- When referencing RMinios features, guide the user with clear instructions and markdown links.
- Maintain an encouraging, sophisticated, and deeply capable demeanor.
`;

    // Format conversation history (take up to the last 15 messages for optimal context)
    const recentHistory = (history || []).slice(-15);
    const formattedHistory = recentHistory
      .filter(m => m && m.content)
      .map(m => `${m.role === 'assistant' ? 'Sara' : 'User'}: ${m.content}`)
      .join('\n\n');

    const fullPrompt = formattedHistory
      ? `${formattedHistory}\n\nUser: ${message}\nSara:`
      : `User: ${message}\nSara:`;

    // Call fleet agent with selected provider or Gemini fallback
    const fleetResult = await callFleetAgent({
      provider: provider || 'google',
      agentRole: 'Sara - Autonomous Principal AI Orchestrator & Research Copilot',
      prompt: fullPrompt,
      systemInstruction: systemPrompt,
      userKey: userKeys?.[provider] || '',
      preferredModel: preferredModel || ''
    });

    return NextResponse.json({
      reply: fleetResult.text,
      providerUsed: fleetResult.providerUsed,
      simulated: fleetResult.simulated || false,
      timestamp: now.toISOString(),
      date: fullDateStr,
      day: dayOfWeek,
      time: timeStr
    });
  } catch (error) {
    console.error('Sara API Error:', error);
    return NextResponse.json({ 
      reply: '⚠️ The Sara Orchestrator encountered an unexpected exception. Please check your network or try again in a few moments.',
      providerUsed: 'Error Fallback'
    }, { status: 500 });
  }
}
