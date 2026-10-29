'use client';
import { useState, useEffect, useRef } from 'react';
import { Headphones, Play, Pause, Volume2, VolumeX, Radio, Sparkles, Clock, RotateCcw, X, ExternalLink, Music2 } from 'lucide-react';

const SPOTIFY_PLAYLISTS = [
  { name: 'Lo-Fi Chill & Code', id: '0vvXsW14Kd3bCuOp41F9K3', uri: 'https://open.spotify.com/embed/playlist/0vvXsW14Kd3bCuOp41F9K3?utm_source=generator&theme=0' },
  { name: 'Deep Focus Ambient', id: '37i9dQZF1DWZeKCadgRdKQ', uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0' },
  { name: 'Classical Brain Power', id: '37i9dQZF1DWVfe3v7R0Z0n', uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVfe3v7R0Z0n?utm_source=generator&theme=0' },
  { name: 'Synthwave Chill / Retrowave', id: '37i9dQZF1DXdLEN7aqioXM', uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0' }
];

export default function SoundscapePlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('spotify'); // 'spotify' | 'ambient' | 'pomodoro'
  const [selectedPlaylist, setSelectedPlaylist] = useState(SPOTIFY_PLAYLISTS[0]);
  const [customSpotifyUrl, setCustomSpotifyUrl] = useState('');

  // Web Audio Native Generator state
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false);
  const [ambientType, setAmbientType] = useState('rain'); // 'rain' | 'binaural' | 'waves' | 'whitenoise'
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);

  // Pomodoro timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Handle Pomodoro timer
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      setSessionsCompleted(prev => prev + 1);
      // Play soft completion chime
      playBeep();
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  const stopAmbient = () => {
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (osc1Ref.current) {
      try { osc1Ref.current.stop(); } catch (e) {}
      osc1Ref.current = null;
    }
    if (osc2Ref.current) {
      try { osc2Ref.current.stop(); } catch (e) {}
      osc2Ref.current = null;
    }
    setIsPlayingAmbient(false);
  };

  const startAmbient = (type = ambientType) => {
    stopAmbient();

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (type === 'rain' || type === 'whitenoise') {
        // Pink / White noise procedural synthesis
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
          } else {
            output[i] = white * 0.05;
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        if (type === 'rain') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 850;
          whiteNoise.connect(filter);
          filter.connect(masterGain);
        } else {
          whiteNoise.connect(masterGain);
        }

        whiteNoise.start();
        noiseSourceRef.current = whiteNoise;

      } else if (type === 'binaural') {
        // 40Hz Gamma Focus Binaural Frequency
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);

        oscLeft.frequency.value = 200; // Base carrier 200Hz
        oscRight.frequency.value = 240; // 40Hz Gamma delta

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(masterGain);

        oscLeft.start();
        oscRight.start();
        osc1Ref.current = oscLeft;
        osc2Ref.current = oscRight;

      } else if (type === 'waves') {
        // Oscillating ocean swell simulation
        const bufferSize = ctx.sampleRate * 3;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 1.2;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12; // slow swell
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 300;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(masterGain);

        noise.start();
        lfo.start();
        noiseSourceRef.current = noise;
        osc1Ref.current = lfo;
      }

      setIsPlayingAmbient(true);
    } catch (err) {
      console.warn('Web Audio error:', err);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
    }
  }, [ambientVolume]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCustomSpotify = (e) => {
    e.preventDefault();
    if (!customSpotifyUrl.trim()) return;
    let url = customSpotifyUrl.trim();
    if (url.includes('spotify.com')) {
      if (!url.includes('/embed/')) {
        url = url.replace('spotify.com/', 'spotify.com/embed/');
      }
      setSelectedPlaylist({ name: 'Custom Playlist', id: 'custom', uri: url });
    }
  };

  return (
    <>
      {/* Floating Focus & Music Dock Button */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn"
          style={{
            borderRadius: '50px',
            padding: '10px 18px',
            background: 'linear-gradient(135deg, rgba(30, 215, 96, 0.2), rgba(99, 102, 241, 0.3))',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(30, 215, 96, 0.4)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          title="Open Focus Music & Soundscape"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Headphones size={18} style={{ color: '#1ed760' }} />
            {isPlayingAmbient && (
              <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
                <span className="sound-bar" style={{ height: 10, width: 2, background: '#1ed760', animation: 'soundPulse 0.8s infinite ease-in-out' }} />
                <span className="sound-bar" style={{ height: 14, width: 2, background: '#1ed760', animation: 'soundPulse 0.6s infinite ease-in-out' }} />
                <span className="sound-bar" style={{ height: 8, width: 2, background: '#1ed760', animation: 'soundPulse 0.9s infinite ease-in-out' }} />
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Deep Work Audio</span>
          {timerRunning && (
            <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              {formatTime(timeLeft)}
            </span>
          )}
        </button>
      </div>

      {/* Floating Soundscape & Spotify Glass Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 74,
            right: 20,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            background: 'rgba(15, 17, 26, 0.92)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 18,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(30, 215, 96, 0.15)',
            zIndex: 10000,
            overflow: 'hidden',
            animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Music2 size={18} style={{ color: '#1ed760' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Research Soundscape & Focus</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn btn-icon btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Navigation Pills */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 4, margin: '12px 16px', borderRadius: 10 }}>
            {[
              { id: 'spotify', label: 'Spotify', icon: <Radio size={14} /> },
              { id: 'ambient', label: 'Binaural/Rain', icon: <Sparkles size={14} /> },
              { id: 'pomodoro', label: 'Pomodoro', icon: <Clock size={14} /> }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 0',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: activeMode === m.id ? 600 : 500,
                  background: activeMode === m.id ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeMode === m.id ? '#fff' : 'var(--text-muted)',
                  border: activeMode === m.id ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div style={{ padding: '0 16px 16px' }}>

            {/* MODE 1: SPOTIFY EMBED */}
            {activeMode === 'spotify' && (
              <div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 10 }}>
                  {SPOTIFY_PLAYLISTS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlaylist(p)}
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: '0.72rem',
                        padding: '5px 10px',
                        borderRadius: 20,
                        background: selectedPlaylist.id === p.id ? 'rgba(30, 215, 96, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: selectedPlaylist.id === p.id ? '1px solid #1ed760' : '1px solid rgba(255,255,255,0.08)',
                        color: selectedPlaylist.id === p.id ? '#1ed760' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div style={{ borderRadius: 12, overflow: 'hidden', height: 152, background: '#000', marginBottom: 12 }}>
                  <iframe
                    src={selectedPlaylist.uri}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>

                <form onSubmit={handleCustomSpotify} style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Paste Spotify playlist/track URL..."
                    className="input"
                    value={customSpotifyUrl}
                    onChange={e => setCustomSpotifyUrl(e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '6px 10px', height: 32 }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0 10px', height: 32 }}>
                    Load
                  </button>
                </form>
              </div>
            )}

            {/* MODE 2: GENERATIVE AMBIENT / BINAURAL (Web Audio Native) */}
            {activeMode === 'ambient' && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Zero-login procedural sound engine synthesized directly in your browser for deep cognitive flow.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { id: 'rain', label: '🌧️ Gentle Rain', desc: 'Pink Noise Filter' },
                    { id: 'binaural', label: '🧘 40Hz Gamma', desc: 'Focus Binaural' },
                    { id: 'waves', label: '🌊 Ocean Swell', desc: 'LFO Sine Swell' },
                    { id: 'whitenoise', label: '☕ White Noise', desc: 'Broadband Mask' }
                  ].map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setAmbientType(a.id); startAmbient(a.id); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'left',
                        background: ambientType === a.id && isPlayingAmbient ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                        border: ambientType === a.id && isPlayingAmbient ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{a.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.desc}</div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <button
                    onClick={() => isPlayingAmbient ? stopAmbient() : startAmbient(ambientType)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {isPlayingAmbient ? <><Pause size={14} /> Stop Ambient</> : <><Play size={14} /> Play {ambientType}</>}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambientVolume}
                      onChange={e => setAmbientVolume(parseFloat(e.target.value))}
                      style={{ width: 80, accentColor: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODE 3: POMODORO DEEP WORK TIMER */}
            {activeMode === 'pomodoro' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: 2, fontFamily: 'monospace', color: '#fff', marginBottom: 8 }}>
                  {formatTime(timeLeft)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Completed Deep Work Sprints: <strong style={{ color: 'var(--accent)' }}>{sessionsCompleted}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start Sprint</>}
                  </button>
                  <button
                    onClick={() => { setTimerRunning(false); setTimeLeft(25 * 60); }}
                    className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes soundPulse {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
