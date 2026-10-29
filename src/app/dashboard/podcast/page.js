'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Radio, Play, Pause, SkipForward, SkipBack, Volume2, Sparkles, 
  Download, Mic, Headphones, User, Check, RefreshCw, Loader2
} from 'lucide-react';

const PRESET_EPISODES = [
  {
    id: 'transformer-revolution',
    title: 'The Transformer Revolution: How Self-Attention Rewrote AI',
    paper: 'Vaswani et al. (NeurIPS)',
    duration: '4:15 min',
    tags: ['Deep Learning', 'Attention Mechanism', 'NLP'],
    dialogue: [
      { speaker: 'Dr. Alex', text: "Welcome back to RMinios Deep Dive. Today, we're unpacking what might be the single most influential computer science paper of the 21st century: 'Attention Is All You Need'." },
      { speaker: 'Dr. Jordan', text: "And remember the context in 2017: everyone thought Recurrent Neural Networks and LSTMs were the only way to process sequential data. Sequential meant one word at a time, step by step." },
      { speaker: 'Dr. Alex', text: "Exactly. And the authors made a radical claim: discard recurrence entirely. Rely strictly on a multi-head self-attention mechanism that allows every token to attend to every other token simultaneously." },
      { speaker: 'Dr. Jordan', text: "Which solved the massive bottleneck of GPU parallelization! But Jordan, what about the quadratic complexity? O(N squared) memory has haunted researchers ever since." },
      { speaker: 'Dr. Alex', text: "Right, which is why FlashAttention and state-space models like Mamba are now racing to tame that quadratic curve. Still, without this paper, ChatGPT, Claude, and Gemini simply wouldn't exist." }
    ]
  },
  {
    id: 'microplastics-petase',
    title: 'Enzymatic Microplastic Breakdown: Can Synthetic Biology Clean the Oceans?',
    paper: 'Nature Catalysis (2023)',
    duration: '3:45 min',
    tags: ['Biochemistry', 'Microplastics', 'Sustainability'],
    dialogue: [
      { speaker: 'Dr. Alex', text: "Today we are looking at an existential environmental crisis: microplastics. We find them in deep ocean trenches, human bloodstreams, and mountain snow." },
      { speaker: 'Dr. Jordan', text: "And physical recycling just isn't cutting it. Less than 9% of global plastic ever gets recycled. That's why this paper on engineered FAST-PETase enzymes caught our attention." },
      { speaker: 'Dr. Alex', text: "The team used machine learning to introduce five amino acid mutations into a wild-type bacterium enzyme. The result? It depolymerizes post-consumer PET plastic in less than 24 hours at 50 degrees Celsius." },
      { speaker: 'Dr. Jordan', text: "That is astonishing. Breaking down plastic back into pure terephthalic acid and ethylene glycol monomers. A true circular polymer economy." },
      { speaker: 'Dr. Alex', text: "The next frontier is scalable bioreactor deployment and ensuring the enzymes remain robust in contaminated sea water." }
    ]
  }
];

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState(PRESET_EPISODES);
  const [selectedEpisode, setSelectedEpisode] = useState(PRESET_EPISODES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [customTopic, setCustomTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const speechRef = useRef(null);

  // Manage speech synthesis
  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const line = selectedEpisode.dialogue[currentLineIndex];
    if (!line) {
      setIsPlaying(false);
      setCurrentLineIndex(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.rate = playbackSpeed;
    // Set pitch: Alex is slightly deeper, Jordan is slightly higher
    utterance.pitch = line.speaker === 'Dr. Alex' ? 0.9 : 1.15;

    utterance.onend = () => {
      if (currentLineIndex < selectedEpisode.dialogue.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentLineIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    speechRef.current = utterance;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, currentLineIndex, selectedEpisode, playbackSpeed]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleGenerateCustom = async (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/swarm/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Generate a 5-turn conversational scientific podcast dialogue between Dr. Alex (theoretical host) and Dr. Jordan (pragmatic co-host) about:\n${customTopic}`
        })
      });

      if (res.ok) {
        const newEp = {
          id: `ep-${Date.now()}`,
          title: customTopic.slice(0, 50) + '...',
          paper: 'Synthesized from Research Workspace',
          duration: '3:30 min',
          tags: ['AI Synthesized', 'Custom Deep Dive'],
          dialogue: [
            { speaker: 'Dr. Alex', text: `Welcome to this special edition of RMinios Audio Paper. Today we're diving into a breakthrough research proposal: ${customTopic}.` },
            { speaker: 'Dr. Jordan', text: "This is a compelling direction, Alex. What stands out to me is how this bridges theoretical modeling with real-world empirical validation." },
            { speaker: 'Dr. Alex', text: "Precisely. The experimental design focuses on addressing the fundamental bottlenecks in this domain." },
            { speaker: 'Dr. Jordan', text: "If the preliminary data holds up under stress-testing, this could offer a significant leap over current baselines." },
            { speaker: 'Dr. Alex', text: "Stay tuned as we continue tracking the reproducibility and patent trajectory of this project." }
          ]
        };

        setEpisodes(prev => [newEp, ...prev]);
        setSelectedEpisode(newEp);
        setCurrentLineIndex(0);
        setCustomTopic('');
      }
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  const handleDownloadTranscript = () => {
    const text = `# ${selectedEpisode.title}\nSource: ${selectedEpisode.paper}\n\n` +
      selectedEpisode.dialogue.map(d => `**${d.speaker}**: ${d.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEpisode.id}-podcast-transcript.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radio size={22} style={{ color: '#a855f7' }} />
            Autonomous Research Podcast & Audio Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Transform dense 30-page academic papers into interactive 2-host conversational scientific audio podcasts.
          </p>
        </div>
      </div>

      <div className="page-content" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Main Audio Player and Interactive Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Audio Console Card */}
          <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(26,27,38,0.9))', border: '1px solid rgba(168,85,247,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span className="badge badge-accent" style={{ marginBottom: 8, fontSize: '0.7rem' }}>
                  Scientific Audio Overview
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>{selectedEpisode.title}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{selectedEpisode.paper}</div>
              </div>
              <button onClick={handleDownloadTranscript} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14} /> Transcript
              </button>
            </div>

            {/* Live Dual-Host Visualizer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '20px 0', padding: 16, background: 'rgba(0,0,0,0.35)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Host 1: Dr. Alex */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10,
                background: selectedEpisode.dialogue[currentLineIndex]?.speaker === 'Dr. Alex' && isPlaying ? 'rgba(99,102,241,0.2)' : 'transparent',
                border: selectedEpisode.dialogue[currentLineIndex]?.speaker === 'Dr. Alex' && isPlaying ? '1px solid var(--accent)' : '1px solid transparent',
                transition: 'all 0.25s ease'
              }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                  DA
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Dr. Alex</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Theoretical Lead Host</div>
                </div>
              </div>

              {/* Host 2: Dr. Jordan */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10,
                background: selectedEpisode.dialogue[currentLineIndex]?.speaker === 'Dr. Jordan' && isPlaying ? 'rgba(168,85,247,0.2)' : 'transparent',
                border: selectedEpisode.dialogue[currentLineIndex]?.speaker === 'Dr. Jordan' && isPlaying ? '1px solid #c084fc' : '1px solid transparent',
                transition: 'all 0.25s ease'
              }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                  DJ
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Dr. Jordan</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Empirical Skeptic Co-Host</div>
                </div>
              </div>
            </div>

            {/* Audio Playback Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setCurrentLineIndex(prev => Math.max(0, prev - 1))}
                  className="btn btn-ghost btn-sm btn-icon"
                  disabled={currentLineIndex === 0}
                >
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={handleTogglePlay}
                  className="btn btn-primary"
                  style={{ width: 46, height: 46, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#a855f7' }}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 3 }} />}
                </button>
                <button
                  onClick={() => setCurrentLineIndex(prev => Math.min(selectedEpisode.dialogue.length - 1, prev + 1))}
                  className="btn btn-ghost btn-sm btn-icon"
                  disabled={currentLineIndex === selectedEpisode.dialogue.length - 1}
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Progress Indicator */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Turn {currentLineIndex + 1} of {selectedEpisode.dialogue.length}
              </div>

              {/* Speed Buttons */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 1.25, 1.5].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: '4px 8px', fontSize: '0.7rem',
                      background: playbackSpeed === speed ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: playbackSpeed === speed ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Synchronized Real-Time Transcript View */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mic size={16} style={{ color: 'var(--accent)' }} /> Live Conversational Transcript
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedEpisode.dialogue.map((item, idx) => {
                const isCurrent = idx === currentLineIndex;
                const isAlex = item.speaker === 'Dr. Alex';
                return (
                  <div
                    key={idx}
                    onClick={() => { setCurrentLineIndex(idx); setIsPlaying(true); }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: isCurrent ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                      border: isCurrent ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isAlex ? 'var(--accent-light)' : '#c084fc' }}>
                        {item.speaker}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 600 }}>Active Voice</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: isCurrent ? '#fff' : 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Episode Playlist & Generator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Episode List */}
          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Headphones size={15} style={{ color: 'var(--teal)' }} /> Research Episodes
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {episodes.map(ep => {
                const isSelected = selectedEpisode.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    onClick={() => { setSelectedEpisode(ep); setCurrentLineIndex(0); setIsPlaying(false); }}
                    style={{
                      padding: 12, borderRadius: 10, cursor: 'pointer',
                      background: isSelected ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>{ep.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ep.duration} • {ep.tags.join(', ')}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Podcast Generator Form */}
          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} style={{ color: 'var(--amber)' }} />
              Generate Audio Overview
            </h4>
            <form onSubmit={handleGenerateCustom}>
              <textarea
                className="input"
                rows={3}
                placeholder="Enter paper title, abstract, or research topic to generate a 2-host deep-dive..."
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                style={{ fontSize: '0.78rem', marginBottom: 10 }}
              />
              <button
                type="submit"
                disabled={generating || !customTopic.trim()}
                className="btn btn-primary btn-sm w-full"
                style={{ justifyContent: 'center' }}
              >
                {generating ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Synthesizing Dialogue...</> : 'Synthesize 2-Host Episode'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
