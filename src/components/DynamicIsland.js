'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, Pause, Headphones, Volume2, Sparkles, X, 
  Search, Sliders, Waves, Brain, CloudRain, Disc3, 
  ChevronDown, ExternalLink, CheckCircle2, Bell, Radio,
  SkipForward, SkipBack, Compass, Bot, Code2, Globe2
} from 'lucide-react';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

export default function DynamicIsland() {
  const {
    user,
    userName,
    isUserLoading,
    isJustLoggedIn,
    setIsJustLoggedIn,
    isPlaying,
    activeMode,
    currentTrack,
    ambientType,
    volume,
    isIslandExpanded,
    activeNotification,
    playAmbient,
    stopAllAudio,
    togglePlay,
    playNextTrack,
    playPrevTrack,
    setVolume,
    setIsIslandExpanded,
    setIsSoundscapeModalOpen,
    setIsSearchModalOpen,
    clearNotification
  } = useDynamicIsland();

  const [isHovered, setIsHovered] = useState(false);

  // Auto-collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const island = document.getElementById('rminios-dynamic-island');
      if (island && !island.contains(e.target)) {
        setIsIslandExpanded(false);
      }
    };
    if (isIslandExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isIslandExpanded, setIsIslandExpanded]);

  // CRITICAL REQUIREMENT: Dynamic Island ONLY visible after login
  if (!user) {
    return null;
  }

  // If notification arrives, highlight the island
  const isNotificationMode = !!activeNotification;

  return (
    <div 
      id="rminios-dynamic-island"
      className={`dynamic-island-container ${isIslandExpanded ? 'expanded' : ''} ${isNotificationMode ? 'notification' : ''} ${isPlaying ? 'playing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 0. DYNAMIC GREETING IMMEDIATELY AFTER LOGIN */}
      {isJustLoggedIn ? (
        <div 
          className="dynamic-island-pill dynamic-island-greeting"
          onClick={() => setIsJustLoggedIn(false)}
          style={{ 
            cursor: 'pointer', 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(99, 102, 241, 0.28))',
            border: '1px solid rgba(34, 197, 94, 0.45)'
          }}
          title="Click to switch to focus audio"
        >
          <div className="island-pill-left" style={{ gap: 10 }}>
            <span style={{ fontSize: '1.25rem', animation: 'wave 1s ease-in-out infinite alternate', display: 'inline-block' }}>👋</span>
            <div className="island-pill-text">
              <span className="island-pill-title" style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.84rem' }}>
                Hello, {userName || 'Researcher'}!
              </span>
              <span className="island-pill-sub" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>
                Welcome to RMinios OS • Research Mode Ready
              </span>
            </div>
          </div>
          <div className="island-pill-right" onClick={(e) => { e.stopPropagation(); setIsJustLoggedIn(false); }}>
            <button 
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              Focus Music
            </button>
          </div>
        </div>
      ) : isNotificationMode ? (
        /* 1. NOTIFICATION POPUP VIEW */
        <div className="dynamic-island-notification">
          <div className="island-notification-left">
            <div className={`island-notif-icon ${activeNotification.type || 'info'}`}>
              {activeNotification.icon || <Sparkles size={16} />}
            </div>
            <div className="island-notif-text">
              <span className="island-notif-title">{activeNotification.title}</span>
              <span className="island-notif-desc">{activeNotification.message}</span>
            </div>
          </div>
          <button 
            className="island-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              clearNotification();
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : isIslandExpanded ? (
        /* 2. EXPANDED MEDIA & QUICK OS LAUNCH VIEW */
        <div className="dynamic-island-expanded-card">
          {/* Header row */}
          <div className="island-expanded-header">
            <div className="island-badge-row">
              <span className="island-live-badge">
                <span className="live-dot" />
                {activeMode === 'ambient' ? `AMBIENT • ${ambientType.toUpperCase()}` : 
                 activeMode === 'spotify' ? 'SPOTIFY DEEP WORK' : 'AUDIO PREVIEW'}
              </span>
            </div>
            <div className="island-header-actions">
              <button 
                className="island-icon-btn"
                onClick={() => setIsSearchModalOpen(true)}
                title="Search any Spotify song"
              >
                <Search size={14} />
              </button>
              <button 
                className="island-icon-btn"
                onClick={() => setIsSoundscapeModalOpen(true)}
                title="Open full sound studio"
              >
                <Sliders size={14} />
              </button>
              <button 
                className="island-icon-btn"
                onClick={() => setIsIslandExpanded(false)}
                title="Collapse"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Track details row */}
          <div className="island-track-body">
            <div className="island-art-wrapper">
              <img 
                src={currentTrack?.albumArt || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300'} 
                alt="Album Cover"
                className={`island-album-art ${isPlaying ? 'spinning' : ''}`}
              />
              {isPlaying && (
                <div className="island-art-equalizer">
                  <span className="eq-bar bar-1" />
                  <span className="eq-bar bar-2" />
                  <span className="eq-bar bar-3" />
                </div>
              )}
            </div>

            <div className="island-track-info">
              <h4 className="island-title">{currentTrack?.title || 'Lo-Fi Chill & Code'}</h4>
              <p className="island-artist">{currentTrack?.artist || 'Lofi Girl'}</p>
              
              {/* Quick Ambient Mode Switcher */}
              <div className="island-modes-row">
                <button 
                  className={`island-chip ${activeMode === 'ambient' && ambientType === 'rain' ? 'active' : ''}`}
                  onClick={() => playAmbient('rain')}
                >
                  <CloudRain size={11} /> Rain
                </button>
                <button 
                  className={`island-chip ${activeMode === 'ambient' && ambientType === 'binaural' ? 'active' : ''}`}
                  onClick={() => playAmbient('binaural')}
                >
                  <Brain size={11} /> 40Hz Gamma
                </button>
                <button 
                  className={`island-chip ${activeMode === 'ambient' && ambientType === 'waves' ? 'active' : ''}`}
                  onClick={() => playAmbient('waves')}
                >
                  <Waves size={11} /> Ocean
                </button>
                <button 
                  className={`island-chip ${activeMode === 'spotify' ? 'active' : ''}`}
                  onClick={() => setIsSearchModalOpen(true)}
                >
                  <Disc3 size={11} /> Spotify...
                </button>
              </div>
            </div>
          </div>

          {/* Quick Platform Launch Hub to ease website navigation */}
          <div style={{ 
            margin: '8px 0', 
            padding: '8px 10px', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 12, 
            border: '1px solid rgba(255,255,255,0.06)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Quick Platform Launch
              </span>
              <span style={{ fontSize: '0.65rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                {userName || 'Researcher'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
              {[
                { label: 'Code Studio', href: '/dashboard/codestudio', icon: '💻' },
                { label: '3D Galaxy', href: '/dashboard/galaxy', icon: '🌌' },
                { label: 'Swarm Arena', href: '/dashboard/swarm', icon: '🤖' },
                { label: 'Audio Paper', href: '/dashboard/podcast', icon: '🎙️' },
                { label: 'Python Lab', href: '/dashboard/sandbox', icon: '🧪' },
                { label: 'Dashboard', href: '/dashboard', icon: '📊' }
              ].map(dest => (
                <Link
                  key={dest.href}
                  href={dest.href}
                  onClick={() => setIsIslandExpanded(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 7px',
                    borderRadius: 7,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: '#fff',
                    fontSize: '0.71rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>{dest.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Controls Footer */}
          <div className="island-expanded-footer">
            <div className="island-volume-slider">
              <Volume2 size={13} style={{ opacity: 0.7 }} />
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="island-range"
              />
              <span className="island-volume-text">{Math.round(volume * 100)}%</span>
            </div>

            <div className="island-main-controls" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button 
                className="island-icon-btn" 
                onClick={playPrevTrack} 
                title="Previous Track"
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <SkipBack size={14} />
              </button>
              <button 
                className="island-play-pause-lg"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
              </button>
              <button 
                className="island-icon-btn" 
                onClick={playNextTrack} 
                title="Next Track"
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <SkipForward size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 3. COMPACT PILL VIEW (DEFAULT / PLAYING) */
        <div 
          className="dynamic-island-pill"
          onClick={() => setIsIslandExpanded(true)}
        >
          {/* Left indicator */}
          <div className="island-pill-left">
            {isPlaying ? (
              <div className="island-equalizer-mini">
                <span className="mini-eq-bar bar-1" />
                <span className="mini-eq-bar bar-2" />
                <span className="mini-eq-bar bar-3" />
                <span className="mini-eq-bar bar-4" />
              </div>
            ) : (
              <div className="island-idle-dot" />
            )}
            
            <div className="island-pill-text">
              <span className="island-pill-title">
                {isPlaying ? currentTrack?.title : 'Deep Work Audio'}
              </span>
              <span className="island-pill-sub">
                {isPlaying ? (currentTrack?.artist || 'Playing') : 'Focus Soundscape'}
              </span>
            </div>
          </div>

          {/* Right mini controls */}
          <div className="island-pill-right" onClick={(e) => e.stopPropagation()}>
            <button 
              className="island-pill-action-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: 1 }} />}
            </button>
            <button 
              className="island-pill-action-btn"
              onClick={() => setIsSearchModalOpen(true)}
              title="Search Spotify"
            >
              <Search size={12} />
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(20deg); }
        }
      `}</style>
    </div>
  );
}
