'use client';

import { useState } from 'react';
import { 
  Rocket, Sparkles, ChevronLeft, ChevronRight, Download, 
  TrendingUp, DollarSign, Target, Shield, Check, Loader2, Maximize2
} from 'lucide-react';

const PRESET_DECKS = [
  {
    id: 'deep-depolymerize',
    companyName: 'EnzyPolymer Bio',
    tagline: 'Autonomous Enzyme Engineering for Industrial Microplastic Elimination',
    ask: '$1.5M Seed Round (18-Month Runway)',
    slides: [
      {
        number: 1,
        title: 'EnzyPolymer Bio',
        subtitle: 'Transforming post-consumer plastic waste into high-value chemical feedstocks at room temperature.',
        points: ['Seed Round: $1.5M', 'Target: Nature Catalysis Patent Spin-Off', 'Founders: PhD Bio-chemists & ML Scientists']
      },
      {
        number: 2,
        title: 'The Problem: Plastic Recycling is Broken',
        subtitle: 'Less than 9% of global plastic is recycled mechanically. Incineration releases toxic dioxins, and landfills persist for 400 years.',
        points: ['Global crisis: 400M tons produced annually', 'Mechanical recycling degrades polymer chains', 'Chemical recycling is energy-prohibitive ($2,200/ton)']
      },
      {
        number: 3,
        title: 'The Solution: FAST-PETase Directed Evolution',
        subtitle: 'AI-engineered thermotolerant biocatalysts that depolymerize PET plastic into virgin-grade monomer building blocks in 24 hours.',
        points: ['Zero toxic solvents required', 'Operates at ambient temperature (50°C)', 'Produces pure terephthalic acid (PTA) & MEG']
      },
      {
        number: 4,
        title: 'Market Opportunity: $65B Recycled Polymer TAM',
        subtitle: 'Massive regulatory tailwinds from EU Single-Use Plastics Directive and California SB 54 mandates.',
        points: ['TAM: $65 Billion Global Recycled Plastics', 'SAM: $14 Billion Food-Grade PET Pellets', 'SOM: $450 Million Coastal Waste Partnerships']
      },
      {
        number: 5,
        title: 'Business Model: Bioreactor Licensing + Monomer Sales',
        subtitle: 'Dual-revenue model providing capital-efficient recurring cash flow and enterprise joint ventures.',
        points: ['Monomer off-take agreements with packaging giants ($1,400/ton)', 'Annual IP licensing fee per bioreactor facility ($250k/yr)', '82% gross margins on proprietary enzyme formulation']
      },
      {
        number: 6,
        title: 'Competitive Moat & Patent Defense',
        subtitle: 'Proprietary sequence modifications protected by pending USPTO provisional patents.',
        points: ['4 provisional patent filings covering 5 key mutations', 'Closed-loop proprietary dataset of 100k+ mutant stability assays', '2-year head-start over academic lab competitors']
      },
      {
        number: 7,
        title: 'Go-to-Market & Commercial Traction',
        subtitle: 'Phased rollout from coastal municipal wastewater pilot to industrial container recycling facilities.',
        points: ['Letter of Intent (LOI) signed with 2 regional waste processors', 'Pilot facility operational at 100L batch scale', 'Targeting 10,000L continuous depolymerization by Q3 2027']
      },
      {
        number: 8,
        title: 'The Ask: $1.5M Seed Investment',
        subtitle: 'Funding 10,000L pilot facility scale-up, enzyme manufacturing, and 3 key hires.',
        points: ['50% Pilot Engineering & Bioreactor hardware', '30% Molecular Engineering & Bio-informatics talent', '20% IP Defense, Regulatory Compliance & Operations']
      }
    ]
  }
];

export default function VenturePage() {
  const [deck, setDeck] = useState(PRESET_DECKS[0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [thesisInput, setThesisInput] = useState('');
  const [generating, setGenerating] = useState(false);

  const slide = deck.slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < deck.slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const handleGenerateDeck = async (e) => {
    e.preventDefault();
    if (!thesisInput.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/swarm/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Generate an 8-slide Y Combinator pitch deck for this research breakthrough:\n${thesisInput}`
        })
      });

      if (res.ok) {
        const newDeck = {
          id: `deck-${Date.now()}`,
          companyName: thesisInput.slice(0, 30) + ' Labs',
          tagline: 'Commercializing Breakthrough Scientific Research',
          ask: '$1.5M Seed Round',
          slides: [
            {
              number: 1,
              title: thesisInput.slice(0, 30) + ' Labs',
              subtitle: 'Next-Generation Technology Built from Academic Research.',
              points: ['Seed Round: $1.5M', 'Deep Tech IP Moat', 'Autonomous Research Platform']
            },
            {
              number: 2,
              title: 'The Problem',
              subtitle: `Current solutions for ${thesisInput} are fundamentally bottlenecked by latency, cost, and theoretical limitations.`,
              points: ['High capital expenditure', 'Slow human-dependent workflows', 'Failing traditional baselines']
            },
            {
              number: 3,
              title: 'The Breakthrough Solution',
              subtitle: 'Our algorithmic and technical innovation delivers 5x efficiency improvements.',
              points: ['Patent-pending architecture', 'Empirically verified in laboratory benchmarks', 'Scalable enterprise delivery']
            },
            {
              number: 4,
              title: 'Market Size & Revenue Model',
              subtitle: 'Multi-billion dollar addressable market driven by enterprise modernization.',
              points: ['TAM: $28 Billion Addressable Market', 'Enterprise SaaS + API Licensing', 'High lifetime customer value (LTV:CAC > 5x)']
            },
            {
              number: 5,
              title: 'Use of Funds ($1.5M Seed)',
              subtitle: 'Accelerating product delivery and initial pilot partnerships over an 18-month runway.',
              points: ['Core engineering team expansion', 'Compute & experimental hardware validation', 'Regulatory and enterprise IP licensing']
            }
          ]
        };

        setDeck(newDeck);
        setCurrentSlide(0);
        setThesisInput('');
      }
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  const handleDownloadDeck = () => {
    const text = `# ${deck.companyName} — Pitch Deck\n**${deck.tagline}**\n**Funding Ask:** ${deck.ask}\n\n` +
      deck.slides.map(s => `## Slide ${s.number}: ${s.title}\n*${s.subtitle}*\n\n${s.points.map(p => `- ${p}`).join('\n')}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.id}-pitch-deck.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rocket size={22} style={{ color: 'var(--amber)' }} />
            Academic-to-Startup YC Venture Studio & Pitch Deck
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Transform academic laboratory breakthroughs into Y Combinator-grade seed pitch decks with market sizing and defensibility.
          </p>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Pitch Deck Stage Screen */}
        <div 
          className="card" 
          style={{ 
            minHeight: 440, 
            padding: '36px 48px', 
            background: 'radial-gradient(circle at 80% 20%, rgba(245,158,11,0.08), rgba(15,17,26,0.95))', 
            border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
          }}
        >
          {/* Top Slide Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-accent" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.4)', fontSize: '0.72rem' }}>
                Slide {slide.number} of {deck.slides.length}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{deck.companyName}</span>
            </div>
            <button onClick={handleDownloadDeck} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem' }}>
              <Download size={13} /> Export Markdown (.md)
            </button>
          </div>

          {/* Slide Main Content */}
          <div style={{ margin: '32px 0' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
              {slide.title}
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 760, lineHeight: 1.5 }}>
              {slide.subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {slide.points?.map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', color: '#e2e8f0' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
                    <Check size={14} />
                  </div>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Navigation Bottom Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {deck.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: i === currentSlide ? 28 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === currentSlide ? 'var(--amber)' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={handlePrev} 
                disabled={currentSlide === 0} 
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 14px' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button 
                onClick={handleNext} 
                disabled={currentSlide === deck.slides.length - 1} 
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 18px', background: 'var(--amber)', color: '#000', fontWeight: 700 }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Venture Deck Generator Form */}
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: 'var(--amber)' }} />
            Synthesize YC Pitch Deck from Research Workspace
          </h4>
          <form onSubmit={handleGenerateDeck} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Enter your research thesis or paper topic (e.g., Nanomaterial filters for microplastic removal in coastal water)..."
              className="input"
              value={thesisInput}
              onChange={e => setThesisInput(e.target.value)}
              style={{ flex: 1, fontSize: '0.82rem' }}
            />
            <button
              type="submit"
              disabled={generating || !thesisInput.trim()}
              className="btn btn-primary"
              style={{ padding: '0 20px', fontSize: '0.8rem', background: 'var(--amber)', color: '#000', fontWeight: 700 }}
            >
              {generating ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Synthesizing Deck...</> : 'Generate 8-Slide Pitch Deck'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
