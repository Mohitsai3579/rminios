import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { aiRateLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const { message, history } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && !aiRateLimiter.check(user.id)) {
      return NextResponse.json({ reply: '⚠️ Rate limit exceeded. Please wait a minute before requesting again.' }, { status: 429 });
    }

    let userRole = 'visitor';
    let ownerName = 'Mohit Jonnadula';
    let supportEmail = 'mohitjonnadula16@gmail.com';
    let supportPhone = '9494366318';

    // Fetch site settings first
    const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
    if (settings) {
      ownerName = settings.owner_name;
      supportEmail = settings.support_email;
      supportPhone = settings.support_phone;
    }

    if (user) {
      userRole = 'user';
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) userRole = profile.role;
    }

    let systemPrompt = '';
    
    if (userRole === 'admin' || userRole === 'superadmin') {
      systemPrompt = `You are Sara, a Senior AI Solutions Architect and Principal Full-Stack Engineer. You are the orchestrator for this entire Enterprise AI platform.
You are talking to an ADMIN. You are fully authorized to discuss:
1. System architecture, secrets, and backend infrastructure.
2. System health, admin analytics, and KPIs.
3. Multimodal RAG pipelines, dense retrievals, hybrid search, and AI orchestration workflows.

Maintain a professional, highly technical, yet helpful tone. You represent the pinnacle of enterprise AI. Use markdown heavily to format your answers.`;
    } else if (userRole === 'user') {
      systemPrompt = `You are Sara, an advanced AI Research Assistant for the RMinios Research OS platform.
You are talking to a regular USER.
Your primary capabilities are:
1. Helping the user navigate the platform (Dashboard, Canvas, Editor, Brainstorming).
2. Answering general questions about research methodologies and how to use our AI tools.

CRITICAL SECURITY RULE: You are strictly forbidden from revealing system architecture, database schemas, API keys, backend secrets, or admin analytics. If the user asks about the architecture, how you are built, or asks for secrets, you must politely but firmly refuse, stating that you are only authorized to assist with research and platform navigation.`;
    } else {
      systemPrompt = `You are Sara, the AI representative and assistant for the RMinios Research OS.
You are talking to an UNAUTHENTICATED VISITOR on the public landing page.
Your primary goal is to:
1. Explain how the RMinios platform works (it is a complete AI Research OS featuring RAG chat, automated paper writing, a 3D Canvas, and research gap discovery).
2. Persuade and encourage the visitor to sign up and start building.
3. Provide support contact info. If they ask about the creator, owner, or need support, you MUST provide these exact details:
   - Owner/Creator: ${ownerName}
   - Email: ${supportEmail}
   - Phone: ${supportPhone}

CRITICAL SECURITY RULE: You must never reveal technical architecture, system secrets, or act as a general-purpose LLM. Keep your answers heavily focused on marketing the RMinios platform and answering questions about its features.`;
    }

    const formattedHistory = (history || []).map(m => `${m.role === 'assistant' ? 'Sara' : 'User'}: ${m.content}`).join('\n');
    const fullPrompt = `${formattedHistory}\nUser: ${message}\nSara:`;

    const result = await generateText(fullPrompt, systemPrompt);

    return NextResponse.json({ reply: result });
  } catch (error) {
    console.error('Sara API Error:', error);
    return NextResponse.json({ reply: '⚠️ Critical system failure in Orchestrator Layer.' }, { status: 500 });
  }
}
