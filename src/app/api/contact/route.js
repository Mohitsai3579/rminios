import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please provide name, email, and message.' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Try storing message in Supabase if contact_messages or feedback table exists
    try {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from('contact_messages').insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject || 'General Inquiry',
          message: message.trim(),
          created_at: new Date().toISOString()
        }).catch(err => {
          console.warn('Contact message db insert note (non-fatal):', err.message);
        });
      }
    } catch (dbErr) {
      console.warn('Database logging skipped:', dbErr.message);
    }

    // Log securely server-side
    console.log(`[Contact Form Submission] From: ${name} <${email}> | Topic: ${subject}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received, and our team will get back to you shortly.'
    }, { status: 200 });

  } catch (error) {
    console.error('Contact Form Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while sending your message. Please try again.' }, { status: 500 });
  }
}
