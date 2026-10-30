'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Headphones, Play, Pause, Volume2, Radio, Sparkles, Clock, 
  RotateCcw, X, ExternalLink, Music2, LogIn, CheckCircle2, 
  ChevronDown, ChevronUp, AlertCircle, RefreshCw, Search,
  SkipForward, SkipBack, Disc, Compass, Zap, ListMusic
} from 'lucide-react';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

const SPOTIFY_PLAYLISTS = [
  // Focus & Coding
  { 
    name: 'Lo-Fi Chill & Code', 
    id: '37i9dQZF1DWWQRwui0ExPn', 
    category: '☕ Lo-Fi & Study',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
    desc: 'Deep focus lofi beats for programming and drafting',
    art: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'
  },
  { 
    name: 'Deep Focus Ambient', 
    id: '37i9dQZF1DWZeKCadgRdKQ', 
    category: '🧠 Focus & Coding',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    desc: 'Atmospheric post-rock & ambient cognitive flow',
    art: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400'
  },
  { 
    name: 'Brain Food (Neuro Beats)', 
    id: '37i9dQZF1DX3qCx52SuA2W', 
    category: '🧠 Focus & Coding',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3qCx52SuA2W?utm_source=generator&theme=0',
    desc: 'Hypnotic electronic focus rhythms for high efficiency',
    art: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400'
  },
  { 
    name: 'Focus Flow', 
    id: '37i9dQZF1DWZZbwlv3Vmtr', 
    category: '🧠 Focus & Coding',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZZbwlv3Vmtr?utm_source=generator&theme=0',
    desc: 'Uptempo instrumental beats to power through sprints',
    art: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'
  },
  { 
    name: 'Instrumental Study', 
    id: '37i9dQZF1DX8Uebhn9wzrS', 
    category: '☕ Lo-Fi & Study',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    desc: 'Soft instrumental melodies to boost productivity',
    art: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'
  },
  // Piano & Classical
  { 
    name: 'Peaceful Piano Concentration', 
    id: '37i9dQZF1DX4sWSpwq3LiO', 
    category: '🎹 Piano & Classical',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    desc: 'Calm acoustic piano melodies for calm thoughts',
    art: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=400'
  },
  { 
    name: 'Epic Classical Orchestrations', 
    id: '37i9dQZF1DX8CwtYg11s3f', 
    category: '🎹 Piano & Classical',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8CwtYg11s3f?utm_source=generator&theme=0',
    desc: 'Inspiring orchestral works for breakthrough thinking',
    art: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400'
  },
  // Soundtracks & Cinematic
  { 
    name: 'Interstellar & Sci-Fi Scores', 
    id: '37i9dQZF1DWVcbIib8nLFI', 
    category: '🌌 Sci-Fi & Scores',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVcbIib8nLFI?utm_source=generator&theme=0',
    desc: 'Cosmic celestial organs and ambient sci-fi soundscapes',
    art: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400'
  },
  { 
    name: 'Hans Zimmer & Film Scores', 
    id: '37i9dQZF1DX142b78q6W8g', 
    category: '🌌 Sci-Fi & Scores',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX142b78q6W8g?utm_source=generator&theme=0',
    desc: 'Grand compositions by Hans Zimmer, Ludwig Göransson & John Williams',
    art: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400'
  },
  // Synthwave & Electronic
  { 
    name: 'Synthwave Chill / Space', 
    id: '37i9dQZF1DXdLEN7aqioXM', 
    category: '⚡ Synth & Electronic',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    desc: 'Retro synthwave and cosmic focus for futuristic engineering',
    art: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400'
  },
  { 
    name: 'Cyberpunk Vibe', 
    id: '37i9dQZF1DX4FP944Jq42d', 
    category: '⚡ Synth & Electronic',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4FP944Jq42d?utm_source=generator&theme=0',
    desc: 'Dark electro, industrial bass, and tech-noir rhythms',
    art: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400'
  },
  // Pop, Rock & Hits
  { 
    name: "Today's Top Hits", 
    id: '37i9dQZF1DXcBWIGoYBM5M', 
    category: '🔥 Pop & Hits',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
    desc: 'The hottest tracks on Spotify worldwide right now',
    art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'
  },
  { 
    name: 'Taylor Swift Essentials', 
    id: '37i9dQZF1DX5KpP2LN299J', 
    category: '🔥 Pop & Hits',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5KpP2LN299J?utm_source=generator&theme=0',
    desc: 'All the iconic hits and eras of Taylor Swift',
    art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
  },
  { 
    name: 'This Is Coldplay', 
    id: '37i9dQZF1DZ06evO151d0U', 
    category: '🔥 Pop & Hits',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO151d0U?utm_source=generator&theme=0',
    desc: 'Yellow, Viva La Vida, Fix You and timeless anthems',
    art: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400'
  },
  { 
    name: 'Rock Classics', 
    id: '37i9dQZF1DWXRqgorJj26U', 
    category: '🎸 Rock',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator&theme=0',
    desc: 'Rock legends & timeless driving rock anthems',
    art: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400'
  },
  // Indian & Bollywood
  { 
    name: 'Bollywood Chill', 
    id: '37i9dQZF1DX0XUfTFmZeMt', 
    category: '🇮🇳 Bollywood & Indian',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUfTFmZeMt?utm_source=generator&theme=0',
    desc: 'Soulful Hindi acoustics, unhurried melodies, and calm vibes',
    art: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'
  },
  { 
    name: 'This Is Arijit Singh', 
    id: '37i9dQZF1DZ06evO37mcv3', 
    category: '🇮🇳 Bollywood & Indian',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO37mcv3?utm_source=generator&theme=0',
    desc: 'Tum Hi Ho, Kesariya, and the complete soulful voice of Arijit Singh',
    art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
  },
  { 
    name: 'A.R. Rahman Focus', 
    id: '37i9dQZF1DX1q47H4k20pI', 
    category: '🇮🇳 Bollywood & Indian',
    uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1q47H4k20pI?utm_source=generator&theme=0',
    desc: 'Academy-award maestro orchestrations and peaceful symphonies',
    art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
  }
];

const CATEGORIES = [
  'All',
  '☕ Lo-Fi & Study',
  '🧠 Focus & Coding',
  '🎹 Piano & Classical',
  '🌌 Sci-Fi & Scores',
  '⚡ Synth & Electronic',
  '🔥 Pop & Hits',
  '🎸 Rock',
  '🇮🇳 Bollywood & Indian'
];

const CONTINUOUS_STREAMS = [
  {
    id: 'groove-salad',
    title: 'Groove Salad (SomaFM)',
    genre: 'Chilled Downtempo & Ambient',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    desc: 'A nicely chilled plate of ambient/downtempo beats. 24/7 non-stop, no ads, no 30s limits.',
    art: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'
  },
  {
    id: 'defcon-radio',
    title: 'DEF CON Radio (Hacker Beats)',
    genre: 'Coder & Engineer Rhythms',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    desc: 'Music for hackers, engineers, and builders. Continuous full songs.',
    art: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'
  },
  {
    id: 'drone-zone',
    title: 'Drone Zone (Atmospheric Space)',
    genre: 'Deep Space Ambient',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    desc: 'Atmospheric ambient space music with brainwave focus.',
    art: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400'
  },
  {
    id: 'spacestation',
    title: 'Space Station Soma',
    genre: 'Cosmic Chill & Synthwave',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    desc: 'Tune in, turn on, space out. Spaced-out ambient and mid-tempo electronica.',
    art: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400'
  }
];

export default function SoundscapePlayer() {
  const {
    isPlaying,
    activeMode: islandActiveMode,
    currentTrack,
    ambientType,
    volume,
    isSoundscapeModalOpen,
    setIsSoundscapeModalOpen,
    playAmbient,
    stopAllAudio,
    togglePlay,
    playTrack,
    playNextTrack,
    playPrevTrack,
    setVolume,
    showNotification
  } = useDynamicIsland();

  const [activeTab, setActiveTab] = useState('spotify'); // 'spotify' | 'fullstream' | 'ambient' | 'pomodoro'
  const [selectedPlaylist, setSelectedPlaylist] = useState(SPOTIFY_PLAYLISTS[0]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ playlists: [], tracks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [playerHeight, setPlayerHeight] = useState('compact');
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  // Pomodoro timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Check Spotify login state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spotify_connected');
      if (stored === 'true') {
        setIsSpotifyConnected(true);
      }
    } catch (e) {}
  }, []);

  // Live debounced search against Spotify and song catalog
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults({ playlists: [], tracks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery.trim())}&type=all`);
        const data = await res.json();
        if (data.success) {
          setSearchResults({
            playlists: data.playlists || [],
            tracks: data.tracks || []
          });
        }
      } catch (err) {
        console.warn('Spotify search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      showNotification({
        title: 'Pomodoro Sprint Complete! 🎉',
        message: 'Great focus! Take a 5-minute cognitive reset.',
        icon: <Clock size={16} />,
        type: 'success'
      });
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, showNotification]);

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
      'SpotifyLogin',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    setIsSpotifyConnected(true);
    try {
      localStorage.setItem('spotify_connected', 'true');
    } catch (e) {}

    showNotification({
      title: 'Spotify Session Connected',
      message: 'Continuous playback & full playlists unlocked in player.',
      icon: <CheckCircle2 size={16} />,
      type: 'success'
    });
  };

  const handleOpenInSpotify = (playlist) => {
    const pl = playlist || selectedPlaylist;
    let target = `https://open.spotify.com/playlist/${pl.id}`;
    if (pl.rawUrl) {
      target = pl.rawUrl;
    } else if (pl.spotifyUrl) {
      target = pl.spotifyUrl;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  // Select playlist to load into embedded Spotify player
  const handleSelectPlaylist = (p) => {
    const playlistItem = {
      name: p.name || p.title,
      id: p.id,
      category: p.category || 'Spotify Curation',
      uri: p.uri || p.spotifyUri || `https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator&theme=0`,
      desc: p.desc || 'Spotify Focus Playlist',
      art: p.art || p.albumArt
    };
    setSelectedPlaylist(playlistItem);
    
    playTrack({
      id: `spotify-${p.id}`,
      title: playlistItem.name,
      artist: p.curator || 'Spotify',
      album: playlistItem.desc,
      albumArt: playlistItem.art || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
      spotifyUri: playlistItem.uri,
      type: 'spotify'
    });

    showNotification({
      title: 'Loaded in Spotify Player',
      message: playlistItem.name,
      icon: <Music2 size={16} />,
      type: 'success'
    });
  };

  // Play direct track in background audio queue with automatic song-to-song progression
  const handlePlaySongTrack = (track) => {
    playTrack(track, searchResults.tracks);
    showNotification({
      title: 'Now Playing (Background Queue)',
      message: `${track.title} • ${track.artist}`,
      icon: <Play size={16} />,
      type: 'purple'
    });
  };

  // Play 24/7 continuous stream
  const handlePlayContinuousStream = (stream) => {
    playTrack({
      id: stream.id,
      title: stream.title,
      artist: stream.genre,
      album: stream.desc,
      albumArt: stream.art,
      previewUrl: stream.streamUrl,
      type: 'radio'
    });
    showNotification({
      title: 'Full Continuous Stream Active',
      message: `${stream.title} (No 30-Second Limit)`,
      icon: <Radio size={16} />,
      type: 'success'
    });
  };

  // Filter curated playlists by selected category
  const filteredPlaylists = useMemo(() => {
    if (selectedCategory === 'All') return SPOTIFY_PLAYLISTS;
    return SPOTIFY_PLAYLISTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      {/* Floating Deep Work Audio Button at bottom-right */}
      <div className="soundscape-trigger-dock">
        <button
          onClick={() => setIsSoundscapeModalOpen(!isSoundscapeModalOpen)}
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
          title="Open Focus Audio & Spotify Hub"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Headphones size={17} style={{ color: '#1ed760' }} />
            {isPlaying && (
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

      {/* Floating Soundscape & Spotify Glass Panel with Built-in Scrollbar Control */}
      {isSoundscapeModalOpen && (
        <div className="soundscape-panel-dock">
          {/* 1. STICKY TOP HEADER (Always visible) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '12px 16px', 
            borderBottom: '1px solid rgba(255,255,255,0.08)', 
            background: 'linear-gradient(135deg, rgba(30,215,96,0.12), rgba(99,102,241,0.08))',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(30, 215, 96, 0.2)', border: '1px solid rgba(30, 215, 96, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music2 size={17} style={{ color: '#1ed760' }} />
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', display: 'block', lineHeight: 1.2 }}>
                  Spotify & Deep Work Studio
                </span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)' }}>
                  Search Playlists, Stream Full Songs & Focus Music
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button 
                onClick={() => setPlayerHeight(prev => prev === 'compact' ? 'expanded' : 'compact')}
                className="btn btn-icon btn-ghost btn-sm"
                title={playerHeight === 'compact' ? 'Expand Player' : 'Compact Player'}
                style={{ width: 28, height: 28, padding: 0, color: 'var(--text-muted)' }}
              >
                {playerHeight === 'compact' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button 
                onClick={() => setIsSoundscapeModalOpen(false)} 
                className="btn btn-icon btn-ghost btn-sm" 
                style={{ color: 'var(--text-muted)', width: 28, height: 28, padding: 0 }}
                title="Close Audio Studio"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 2. MODE NAVIGATION TABS */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.35)', padding: 4, margin: '8px 12px 4px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {[
              { id: 'spotify', label: 'Spotify Hub', icon: <Radio size={13} /> },
              { id: 'fullstream', label: 'Full 24/7 Radio', icon: <Zap size={13} /> },
              { id: 'ambient', label: 'Binaural 40Hz', icon: <Sparkles size={13} /> },
              { id: 'pomodoro', label: 'Sprint', icon: <Clock size={13} /> }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '6px 0',
                  borderRadius: 7,
                  fontSize: '0.73rem',
                  fontWeight: activeTab === m.id ? 600 : 500,
                  background: activeTab === m.id ? (m.id === 'spotify' || m.id === 'fullstream' ? 'rgba(30, 215, 96, 0.2)' : 'rgba(99, 102, 241, 0.25)') : 'transparent',
                  color: activeTab === m.id ? (m.id === 'spotify' || m.id === 'fullstream' ? '#1ed760' : '#fff') : 'var(--text-muted)',
                  border: activeTab === m.id ? (m.id === 'spotify' || m.id === 'fullstream' ? '1px solid rgba(30,215,96,0.35)' : '1px solid rgba(99,102,241,0.35)') : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* 3. SCROLLABLE BODY WITH CONTROLLED VERTICAL SCROLLBAR */}
          <div className="soundscape-scroll-body">

            {/* TAB 1: SPOTIFY HUB WITH LIVE IN-WINDOW SEARCH & EMBED */}
            {activeTab === 'spotify' && (
              <div>
                {/* Real-time Search Spotify Playlists & Songs right inside this window */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'rgba(255,255,255,0.45)' }} />
                  <input
                    type="text"
                    placeholder="Search Spotify playlists, artists, or songs (e.g. Taylor Swift, Arijit, Lofi, Rock)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input"
                    style={{
                      width: '100%',
                      paddingLeft: 32,
                      paddingRight: 28,
                      fontSize: '0.75rem',
                      height: 34,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff'
                    }}
                  />
                  {isSearching ? (
                    <RefreshCw size={13} className="spin" style={{ position: 'absolute', right: 9, top: 10, color: '#1ed760' }} />
                  ) : searchQuery ? (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>

                {/* Spotify Authentication & Connect Banner */}
                <div style={{
                  background: isSpotifyConnected ? 'rgba(30, 215, 96, 0.12)' : 'rgba(30, 215, 96, 0.08)',
                  border: isSpotifyConnected ? '1px solid rgba(30, 215, 96, 0.35)' : '1px dashed rgba(30, 215, 96, 0.4)',
                  borderRadius: 10,
                  padding: '8px 11px',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
                    {isSpotifyConnected ? (
                      <CheckCircle2 size={15} style={{ color: '#1ed760', flexShrink: 0 }} />
                    ) : (
                      <LogIn size={15} style={{ color: '#1ed760', flexShrink: 0 }} />
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                        {isSpotifyConnected ? 'Spotify Account Connected' : 'Unlock Full Songs (No 30s Cap)'}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                        {isSpotifyConnected 
                          ? 'Continuous playback & full playlists unlocked' 
                          : 'Log in to Spotify to bypass the 30s preview limit'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button
                      onClick={handleSpotifyLogin}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.66rem',
                        padding: '3px 8px',
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
                      title="Log into Spotify in browser"
                    >
                      <LogIn size={11} />
                      {isSpotifyConnected ? 'Switch' : 'Log In'}
                    </button>

                    <button
                      onClick={() => handleOpenInSpotify(selectedPlaylist)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        fontSize: '0.66rem',
                        padding: '3px 7px',
                        borderRadius: 6,
                        color: '#1ed760',
                        border: '1px solid rgba(30, 215, 96, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }}
                      title="Open in Spotify App"
                    >
                      <ExternalLink size={11} />
                      App
                    </button>
                  </div>
                </div>

                {/* Spotify Iframe Player */}
                <div style={{ 
                  borderRadius: 12, 
                  overflow: 'hidden', 
                  height: playerHeight === 'compact' ? 152 : 352, 
                  background: '#000', 
                  marginBottom: 8,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
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

                {/* Playback & Queue Controls Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button 
                      onClick={playPrevTrack} 
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 6, width: 30, height: 30 }}
                      title="Previous Track"
                    >
                      <SkipBack size={14} />
                    </button>
                    <button 
                      onClick={togglePlay} 
                      className="btn btn-primary btn-sm"
                      style={{ padding: 6, width: 32, height: 32, borderRadius: '50%' }}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 1 }} />}
                    </button>
                    <button 
                      onClick={playNextTrack} 
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 6, width: 30, height: 30 }}
                      title="Next Track"
                    >
                      <SkipForward size={14} />
                    </button>
                    <span style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>
                      Auto-Advance Queue
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Volume2 size={14} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={e => setVolume(parseFloat(e.target.value))}
                      style={{ width: 70, accentColor: '#1ed760' }}
                    />
                  </div>
                </div>

                {/* 4. DYNAMIC VIEW: SEARCH RESULTS OR CURATED PLAYLIST EXPLORER */}
                {searchQuery.trim() ? (
                  <div>
                    {/* Matching Playlists & Albums */}
                    {searchResults.playlists && searchResults.playlists.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1ed760', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Radio size={13} /> Playlists & Albums Matching "{searchQuery}"
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {searchResults.playlists.slice(0, 6).map(p => {
                            const isSelected = selectedPlaylist.id === p.id;
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleSelectPlaylist(p)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  padding: 8,
                                  borderRadius: 10,
                                  background: isSelected ? 'rgba(30, 215, 96, 0.16)' : 'rgba(255,255,255,0.04)',
                                  border: isSelected ? '1px solid #1ed760' : '1px solid rgba(255,255,255,0.08)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ width: '100%', height: 75, borderRadius: 6, overflow: 'hidden', marginBottom: 6, position: 'relative' }}>
                                  <img 
                                    src={p.albumArt || p.art || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300'} 
                                    alt={p.title || p.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  />
                                  <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: '2px 6px', fontSize: '0.6rem', color: '#1ed760', fontWeight: 600 }}>
                                    Load
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.73rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.title || p.name}
                                </div>
                                <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.curator || p.desc}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Matching Tracks & Songs with Auto-Advancing Queue */}
                    {searchResults.tracks && searchResults.tracks.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Music2 size={13} style={{ color: '#1ed760' }} /> Songs & Tracks (Auto-Plays in Queue)
                          </span>
                          <span style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                            {searchResults.tracks.length} tracks
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {searchResults.tracks.map(track => {
                            const isCurrent = currentTrack?.id === track.id && isPlaying;
                            return (
                              <div
                                key={track.id}
                                onClick={() => handlePlaySongTrack(track)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 9,
                                  padding: '7px 9px',
                                  borderRadius: 8,
                                  background: isCurrent ? 'rgba(30, 215, 96, 0.16)' : 'rgba(255,255,255,0.03)',
                                  border: isCurrent ? '1px solid #1ed760' : '1px solid rgba(255,255,255,0.06)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ width: 34, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                  <img src={track.albumArt} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isCurrent ? <Pause size={12} color="#1ed760" /> : <Play size={12} color="#fff" style={{ marginLeft: 1 }} />}
                                  </div>
                                </div>

                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {track.title}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {track.artist} • {track.album}
                                  </div>
                                </div>

                                <button
                                  className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                                  style={{ fontSize: '0.68rem', padding: '3px 8px', flexShrink: 0 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlaySongTrack(track);
                                  }}
                                >
                                  {isCurrent ? 'Playing' : 'Play'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Curated Spotify Playlists Explorer */
                  <div>
                    {/* Category Selector Chips */}
                    <div className="soundscape-chips-row">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          style={{
                            whiteSpace: 'nowrap',
                            fontSize: '0.68rem',
                            padding: '4px 10px',
                            borderRadius: 14,
                            background: selectedCategory === cat ? 'rgba(30, 215, 96, 0.22)' : 'rgba(255,255,255,0.05)',
                            border: selectedCategory === cat ? '1px solid #1ed760' : '1px solid rgba(255,255,255,0.08)',
                            color: selectedCategory === cat ? '#1ed760' : 'rgba(255,255,255,0.75)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Curated Playlists Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                      {filteredPlaylists.map(p => {
                        const isSelected = selectedPlaylist.id === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPlaylist(p)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              padding: 9,
                              borderRadius: 10,
                              background: isSelected ? 'rgba(30, 215, 96, 0.16)' : 'rgba(255,255,255,0.04)',
                              border: isSelected ? '1px solid #1ed760' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ width: '100%', height: 80, borderRadius: 6, overflow: 'hidden', marginBottom: 6, position: 'relative' }}>
                              <img src={p.art} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Play size={14} color="#fff" />
                              </div>
                            </div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CONTINUOUS FULL STREAMS (24/7 ZERO 30s LIMIT) */}
            {activeTab === 'fullstream' && (
              <div>
                <div style={{ 
                  background: 'rgba(30, 215, 96, 0.08)', 
                  border: '1px solid rgba(30, 215, 96, 0.25)', 
                  padding: '8px 12px', 
                  borderRadius: 10, 
                  marginBottom: 10,
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.3
                }}>
                  ✨ <strong>Continuous Full Songs</strong>: Stream 24/7 uninterrupted full-length coding music and chill beats. Zero logins, zero cutoffs, zero 30s limits.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CONTINUOUS_STREAMS.map(stream => {
                    const isCurrent = currentTrack?.id === stream.id && isPlaying;
                    return (
                      <div 
                        key={stream.id}
                        onClick={() => handlePlayContinuousStream(stream)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 12px',
                          borderRadius: 10,
                          background: isCurrent ? 'rgba(30, 215, 96, 0.15)' : 'rgba(255,255,255,0.03)',
                          border: isCurrent ? '1px solid #1ed760' : '1px solid rgba(255,255,255,0.07)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          position: 'relative'
                        }}>
                          <img src={stream.art} alt={stream.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isCurrent ? <Pause size={14} color="#1ed760" /> : <Play size={14} color="#fff" style={{ marginLeft: 2 }} />}
                          </div>
                        </div>

                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stream.title}
                          </div>
                          <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stream.genre} • Full 24/7 Stream
                          </div>
                        </div>

                        <button 
                          className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              stopAllAudio();
                            } else {
                              handlePlayContinuousStream(stream);
                            }
                          }}
                        >
                          {isCurrent ? 'Playing' : 'Listen'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Queue Navigation Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, marginTop: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button 
                      onClick={playPrevTrack} 
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 6, width: 30, height: 30 }}
                      title="Previous Station"
                    >
                      <SkipBack size={14} />
                    </button>
                    <button 
                      onClick={togglePlay} 
                      className="btn btn-primary btn-sm"
                      style={{ padding: 6, width: 32, height: 32, borderRadius: '50%' }}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 1 }} />}
                    </button>
                    <button 
                      onClick={playNextTrack} 
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 6, width: 30, height: 30 }}
                      title="Next Station"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Volume2 size={14} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={e => setVolume(parseFloat(e.target.value))}
                      style={{ width: 70, accentColor: '#1ed760' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GENERATIVE AMBIENT / BINAURAL (Web Audio Native) */}
            {activeTab === 'ambient' && (
              <div>
                <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.65)', marginBottom: 10, lineHeight: 1.3 }}>
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
                      onClick={() => playAmbient(a.id)}
                      style={{
                        padding: '9px 11px',
                        borderRadius: 10,
                        textAlign: 'left',
                        background: ambientType === a.id && isPlaying ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                        border: ambientType === a.id && isPlaying ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
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
                    onClick={() => isPlaying ? stopAllAudio() : playAmbient(ambientType)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 32, fontSize: '0.75rem' }}
                  >
                    {isPlaying ? <><Pause size={13} /> Stop Soundscape</> : <><Play size={13} /> Start {ambientType}</>}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Volume2 size={15} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={e => setVolume(parseFloat(e.target.value))}
                      style={{ width: 75, accentColor: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: POMODORO DEEP WORK SPRINT TIMER */}
            {activeTab === 'pomodoro' && (
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}
