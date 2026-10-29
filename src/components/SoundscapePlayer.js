'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Headphones, Play, Pause, Volume2, Radio, Sparkles, Clock, 
  RotateCcw, X, ExternalLink, Music2, LogIn, CheckCircle2, 
  ChevronDown, ChevronUp, AlertCircle, RefreshCw 
} from 'lucide-react';

const SPOTIFY_PLAYLISTS = [
  { 
    name: 'Lo-Fi Chill & Code', 
    id: '37i9dQZF1DWWQRwui0ExPn', 
    type: 'playlist', 
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
    desc: 'Deep focus lofi beats for programming'
  },
  { 
    name: 'Deep Focus Ambient', 
    id: '37i9dQZF1DWZeKCadgRdKQ', 
    type: 'playlist', 
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    desc: 'Atmospheric post-rock & ambient flow'
  },
  { 
    name: 'Peaceful Piano Concentration', 
    id: '37i9dQZF1DX4sWSpwq3LiO', 
    type: 'playlist', 
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    desc: 'Calm acoustic piano melodies'
  },
  { 
    name: 'Brain Food (Neuro Beats)', 
    id: '37i9dQZF1DX3qCx52SuA2W', 
    type: 'playlist', 
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3qCx52SuA2W?utm_source=generator&theme=0',
    desc: 'Hypnotic electronic focus rhythms'
  },
  { 
    name: 'Synthwave Chill / Space', 
    id: '37i9dQZF1DXdLEN7aqioXM', 
    type: 'playlist', 
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    desc: 'Retro synthwave and cosmic focus'
  }
];

export default function SoundscapePlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('spotify'); // 'spotify' | 'ambient' | 'pomodoro'
  const [selectedPlaylist, setSelectedPlaylist] = useState(SPOTIFY_PLAYLISTS[0]);
  const [customSpotifyUrl, setCustomSpotifyUrl] = useState('');
  const [urlStatus, setUrlStatus] = useState({ type: '', msg: '' });
  const [playerHeight, setPlayerHeight] = useState('compact'); // 'compact' (152) | 'expanded' (352)
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

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

  // Load Spotify login state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spotify_connected');
      if (stored === 'true') {
        setIsSpotifyConnected(true);
      }
    } catch (e) {}
  }, []);

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
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);

        oscLeft.frequency.value = 200; // Base carrier 200Hz
        oscRight.frequency.value = 240; // 40Hz Gamma focus delta

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(masterGain);

        oscLeft.start();
        oscRight.start();
        osc1Ref.current = oscLeft;
        osc2Ref.current = oscRight;

      } else if (type === 'waves') {
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
        lfo.frequency.value = 0.12; // slow ocean swell
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

  // Launch Spotify login popup
  const handleSpotifyLogin = () => {
    const width = 560;
    const height = 700;
    const left = typeof window !== 'undefined' ? window.screen.width / 2 - width / 2 : 100;
    const top = typeof window !== 'undefined' ? window.screen.height / 2 - height / 2 : 100;
    const loginUrl = 'https://accounts.spotify.com/en/login?continue=https%3A%2F%2Fopen.spotify.com';
    
    window.open(
      loginUrl,
      'SpotifyLoginPopup',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
    setIsSpotifyConnected(true);
    try {
      localStorage.setItem('spotify_connected', 'true');
    } catch (e) {}
  };

  // Open active playlist in native app or open.spotify.com
  const handleOpenInSpotify = () => {
    let target = `https://open.spotify.com/playlist/${selectedPlaylist.id}`;
    if (selectedPlaylist.rawUrl) {
      target = selectedPlaylist.rawUrl;
    } else if (selectedPlaylist.type && selectedPlaylist.id) {
      target = `https://open.spotify.com/${selectedPlaylist.type}/${selectedPlaylist.id}`;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  // Smart parser for Spotify URLs and URIs
  const handleCustomSpotify = (e) => {
    e.preventDefault();
    if (!customSpotifyUrl.trim()) return;
    const str = customSpotifyUrl.trim();

    // Check Spotify URI format: spotify:track:id or spotify:playlist:id
    const uriMatch = str.match(/spotify:(playlist|track|album|artist|episode):([a-zA-Z0-9]+)/i);
    if (uriMatch) {
      const type = uriMatch[1].toLowerCase();
      const id = uriMatch[2];
      setSelectedPlaylist({
        name: `Custom ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        id,
        type,
        rawUrl: `https://open.spotify.com/${type}/${id}`,
        uri: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
        desc: `Loaded via URI (${id})`
      });
      setUrlStatus({ type: 'success', msg: `Successfully loaded custom ${type}!` });
      return;
    }

    // Check Spotify Web URL: https://open.spotify.com/(intl-xx/)?(playlist|track|album)/id
    const urlMatch = str.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(playlist|track|album|artist|episode)\/([a-zA-Z0-9]+)/i);
    if (urlMatch) {
      const type = urlMatch[1].toLowerCase();
      const id = urlMatch[2];
      setSelectedPlaylist({
        name: `Custom ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        id,
        type,
        rawUrl: `https://open.spotify.com/${type}/${id}`,
        uri: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
        desc: `Loaded from Spotify web link`
      });
      setUrlStatus({ type: 'success', msg: `Successfully loaded custom ${type}!` });
      return;
    }

    setUrlStatus({ type: 'error', msg: 'Invalid link. Please paste a Spotify playlist, track, or album URL.' });
  };

  return (
    <>
      {/* Floating Focus & Music Dock Button (Separated cleanly from Sara AI Assistant) */}
      <div className="soundscape-trigger-dock">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn"
          style={{
            borderRadius: '50px',
            padding: '9px 16px',
            background: 'linear-gradient(135deg, rgba(30, 215, 96, 0.22), rgba(99, 102, 241, 0.28))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(30, 215, 96, 0.45)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45), 0 0 16px rgba(30, 215, 96, 0.2)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          title="Open Focus Audio & Spotify Player"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Headphones size={17} style={{ color: '#1ed760' }} />
            {isPlayingAmbient && (
              <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
                <span className="sound-bar" style={{ height: 10, width: 2, background: '#1ed760', animation: 'soundPulse 0.8s infinite ease-in-out' }} />
                <span className="sound-bar" style={{ height: 14, width: 2, background: '#1ed760', animation: 'soundPulse 0.6s infinite ease-in-out' }} />
                <span className="sound-bar" style={{ height: 8, width: 2, background: '#1ed760', animation: 'soundPulse 0.9s infinite ease-in-out' }} />
              </span>
            )}
          </div>
          <span className="deep-work-label" style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: 0.2 }}>
            Deep Work Audio
          </span>
          {timerRunning && (
            <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>
              {formatTime(timeLeft)}
            </span>
          )}
        </button>
      </div>

      {/* Floating Soundscape & Spotify Glass Panel */}
      {isOpen && (
        <div className="soundscape-panel-dock">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, rgba(30,215,96,0.08), rgba(99,102,241,0.05))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(30, 215, 96, 0.2)', border: '1px solid rgba(30, 215, 96, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music2 size={16} style={{ color: '#1ed760' }} />
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', display: 'block', lineHeight: 1.2 }}>
                  Deep Work Audio Suite
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Spotify & Generative Soundscapes
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="btn btn-icon btn-ghost btn-sm" 
              style={{ color: 'var(--text-muted)', width: 28, height: 28, padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Mode Pills */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.35)', padding: 4, margin: '10px 14px 6px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { id: 'spotify', label: 'Spotify Focus', icon: <Radio size={13} /> },
              { id: 'ambient', label: 'Binaural & Rain', icon: <Sparkles size={13} /> },
              { id: 'pomodoro', label: 'Sprint Timer', icon: <Clock size={13} /> }
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
                  borderRadius: 7,
                  fontSize: '0.76rem',
                  fontWeight: activeMode === m.id ? 600 : 500,
                  background: activeMode === m.id ? (m.id === 'spotify' ? 'rgba(30, 215, 96, 0.18)' : 'rgba(99, 102, 241, 0.25)') : 'transparent',
                  color: activeMode === m.id ? (m.id === 'spotify' ? '#1ed760' : '#fff') : 'var(--text-muted)',
                  border: activeMode === m.id ? (m.id === 'spotify' ? '1px solid rgba(30,215,96,0.35)' : '1px solid rgba(99,102,241,0.35)') : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div style={{ padding: '8px 14px 14px' }}>

            {/* MODE 1: SPOTIFY EMBED WITH LOGIN & APP HANDOFF */}
            {activeMode === 'spotify' && (
              <div>
                {/* Spotify Authentication & Connect Banner */}
                <div style={{
                  background: isSpotifyConnected ? 'rgba(30, 215, 96, 0.1)' : 'rgba(30, 215, 96, 0.07)',
                  border: isSpotifyConnected ? '1px solid rgba(30, 215, 96, 0.3)' : '1px dashed rgba(30, 215, 96, 0.35)',
                  borderRadius: 10,
                  padding: '9px 12px',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isSpotifyConnected ? (
                      <CheckCircle2 size={16} style={{ color: '#1ed760', flexShrink: 0 }} />
                    ) : (
                      <LogIn size={16} style={{ color: '#1ed760', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#fff' }}>
                        {isSpotifyConnected ? 'Spotify Session Connected' : 'Connect Spotify Account'}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                        {isSpotifyConnected 
                          ? 'Full track playback enabled in browser' 
                          : 'Log in to unlock full tracks without 30s preview limit'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={handleSpotifyLogin}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.68rem',
                        padding: '4px 9px',
                        borderRadius: 6,
                        background: '#1ed760',
                        color: '#000',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Log into Spotify to authenticate playback"
                    >
                      <LogIn size={12} />
                      {isSpotifyConnected ? 'Switch' : 'Log In'}
                    </button>

                    <button
                      onClick={handleOpenInSpotify}
                      className="btn btn-ghost btn-sm"
                      style={{
                        fontSize: '0.68rem',
                        padding: '4px 8px',
                        borderRadius: 6,
                        color: '#1ed760',
                        border: '1px solid rgba(30, 215, 96, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Open current playlist in Spotify App or Web Player"
                    >
                      <ExternalLink size={12} />
                      Open App
                    </button>
                  </div>
                </div>

                {/* Playlist Selector Pills */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 8, scrollbarWidth: 'thin' }}>
                  {SPOTIFY_PLAYLISTS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPlaylist(p); setUrlStatus({ type: '', msg: '' }); }}
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: '0.7rem',
                        padding: '4px 10px',
                        borderRadius: 16,
                        background: selectedPlaylist.id === p.id ? 'rgba(30, 215, 96, 0.22)' : 'rgba(255,255,255,0.04)',
                        border: selectedPlaylist.id === p.id ? '1px solid #1ed760' : '1px solid rgba(255,255,255,0.07)',
                        color: selectedPlaylist.id === p.id ? '#1ed760' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Spotify Iframe Player with Size Toggle */}
                <div style={{ 
                  borderRadius: 12, 
                  overflow: 'hidden', 
                  height: playerHeight === 'compact' ? 152 : 352, 
                  background: '#000', 
                  marginBottom: 8,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  transition: 'height 0.25s ease'
                }}>
                  <iframe
                    key={selectedPlaylist.uri}
                    src={selectedPlaylist.uri}
                    width="100%"
                    height={playerHeight === 'compact' ? "152" : "352"}
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ borderRadius: 12, display: 'block' }}
                  />
                </div>

                {/* Player Controls & Custom Input Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Playing: <strong style={{ color: '#fff' }}>{selectedPlaylist.name}</strong>
                  </span>
                  <button
                    onClick={() => setPlayerHeight(prev => prev === 'compact' ? 'expanded' : 'compact')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-light)',
                      fontSize: '0.68rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {playerHeight === 'compact' ? <><ChevronDown size={13} /> Full Tracklist</> : <><ChevronUp size={13} /> Compact View</>}
                  </button>
                </div>

                {/* Custom Spotify URL Loader */}
                <form onSubmit={handleCustomSpotify} style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Paste Spotify playlist, track, or album URL..."
                    className="input"
                    value={customSpotifyUrl}
                    onChange={e => { setCustomSpotifyUrl(e.target.value); setUrlStatus({ type: '', msg: '' }); }}
                    style={{ fontSize: '0.73rem', padding: '6px 10px', height: 32, flex: 1 }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0 12px', height: 32, fontSize: '0.72rem' }}>
                    Load
                  </button>
                </form>

                {urlStatus.msg && (
                  <div style={{
                    marginTop: 6,
                    fontSize: '0.68rem',
                    color: urlStatus.type === 'success' ? '#1ed760' : '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    {urlStatus.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {urlStatus.msg}
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: GENERATIVE AMBIENT / BINAURAL (Web Audio Native) */}
            {activeMode === 'ambient' && (
              <div>
                <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.3 }}>
                  Zero-login procedural sound synthesis running directly in Web Audio for instant cognitive immersion.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { id: 'rain', label: '🌧️ Gentle Rain', desc: 'Pink Noise Lowpass' },
                    { id: 'binaural', label: '🧘 40Hz Gamma', desc: 'Stereo Focus Waves' },
                    { id: 'waves', label: '🌊 Ocean Swell', desc: 'LFO Sine Filter' },
                    { id: 'whitenoise', label: '☕ White Noise', desc: 'Broadband Acoustic Mask' }
                  ].map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setAmbientType(a.id); startAmbient(a.id); }}
                      style={{
                        padding: '9px 11px',
                        borderRadius: 10,
                        textAlign: 'left',
                        background: ambientType === a.id && isPlayingAmbient ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                        border: ambientType === a.id && isPlayingAmbient ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>{a.label}</div>
                      <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.desc}</div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => isPlayingAmbient ? stopAmbient() : startAmbient(ambientType)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 32, fontSize: '0.75rem' }}
                  >
                    {isPlayingAmbient ? <><Pause size={13} /> Stop Soundscape</> : <><Play size={13} /> Start {ambientType}</>}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Volume2 size={15} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambientVolume}
                      onChange={e => setAmbientVolume(parseFloat(e.target.value))}
                      style={{ width: 75, accentColor: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODE 3: POMODORO DEEP WORK SPRINT TIMER */}
            {activeMode === 'pomodoro' && (
              <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: 2, fontFamily: 'monospace', color: '#fff', marginBottom: 6 }}>
                  {formatTime(timeLeft)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                  Completed Deep Work Sprints: <strong style={{ color: 'var(--accent)' }}>{sessionsCompleted}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
                  >
                    {timerRunning ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Start Sprint</>}
                  </button>
                  <button
                    onClick={() => { setTimerRunning(false); setTimeLeft(25 * 60); }}
                    className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
                  >
                    <RotateCcw size={13} /> Reset
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
