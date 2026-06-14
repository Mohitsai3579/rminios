import { NextResponse } from 'next/server';
import { aiRateLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const { query } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && !aiRateLimiter.check(user.id)) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const SERPER_KEY = process.env.SERPER_API_KEY;
    if (!SERPER_KEY) {
      return NextResponse.json({ error: 'Search API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query, num: 5 })
    });

    const data = await res.json();
    
    // Map organic results to a clean format
    const results = (data.organic || []).map(r => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
