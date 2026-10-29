'use client';

import SwarmTab from '@/app/dashboard/workspace/[id]/SwarmTab';
import { Bot, Sparkles, ShieldCheck } from 'lucide-react';

export default function GlobalSwarmPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} style={{ color: 'var(--green)' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Global AI Swarm Arena</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Heterogeneous Multi-Agent Orchestration Hub • Google Gemini • OpenAI GPT-4o • Anthropic Claude • xAI Grok
            </p>
          </div>
        </div>
      </div>

      <SwarmTab workspaceId="global" />
    </div>
  );
}
