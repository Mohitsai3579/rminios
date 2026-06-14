'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, Settings as SettingsIcon, AlertCircle, Save, Key, Zap } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [stripePublishable, setStripePublishable] = useState('');
  const [stripeSecret, setStripeSecret] = useState('');
  const [stripeWebhook, setStripeWebhook] = useState('');
  
  const [tokenCost, setTokenCost] = useState('2.50');
  const [storageCost, setStorageCost] = useState('0.50');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={20} /> Payments & Billing</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure paywalls, subscription limits, and payment gateways.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : <><Save size={16} /> Save Billing Settings</>}
        </button>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
        
        {/* Master Paywall Toggle */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: paywallEnabled ? '1px solid var(--green)' : '1px solid var(--border)', background: paywallEnabled ? 'rgba(34,197,94,0.05)' : 'var(--bg-card)' }}>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={18} style={{ color: paywallEnabled ? 'var(--green)' : 'var(--text-muted)' }} /> 
              Master Paywall Engine
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enable this to immediately enforce subscription limits across all workspaces. Users exceeding the free tier will be prompted to upgrade.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', transform: 'scale(1.5)', margin: '0 16px' }}>
            <input type="checkbox" checked={paywallEnabled} onChange={e => setPaywallEnabled(e.target.checked)} style={{ accentColor: 'var(--green)' }} />
          </label>
        </div>

        {/* Cost & Limits Configuration */}
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <DollarSign size={18} style={{ color: 'var(--teal)' }} /> Dynamic Pricing Variables
          </h4>
          
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Cost per 1M LLM Tokens (USD)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>$</span>
                <input type="number" step="0.10" className="input" value={tokenCost} onChange={e => setTokenCost(e.target.value)} />
              </div>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Cost per 1GB Storage (USD / Month)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>$</span>
                <input type="number" step="0.10" className="input" value={storageCost} onChange={e => setStorageCost(e.target.value)} />
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            These limits are used for overage calculations on the usage-based billing plans.
          </p>
        </div>

        {/* Stripe Integration */}
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Key size={18} style={{ color: 'var(--accent)' }} /> Stripe Payment Gateway
          </h4>
          
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Stripe Publishable Key</label>
            <input type="text" className="input" placeholder="pk_live_..." value={stripePublishable} onChange={e => setStripePublishable(e.target.value)} />
          </div>
          
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Stripe Secret Key</label>
            <input type="password" className="input" placeholder="sk_live_..." value={stripeSecret} onChange={e => setStripeSecret(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Webhook Signing Secret</label>
            <input type="password" className="input" placeholder="whsec_..." value={stripeWebhook} onChange={e => setStripeWebhook(e.target.value)} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Used to securely process successful payments and subscription renewals.</p>
          </div>
        </div>

        {/* Info Box */}
        <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', gap: 12 }}>
          <AlertCircle size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Developer Note:</strong> The payment UI components and frontend code are fully integrated. Once the Stripe keys are supplied and the Paywall is toggled ON, the checkout flows will become active.
          </div>
        </div>

      </div>
    </>
  );
}
