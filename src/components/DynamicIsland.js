'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Pause, Headphones, Volume2, Sparkles, X, 
  Search, Sliders, Waves, Brain, CloudRain, Disc3, 
  ChevronDown, ExternalLink, CheckCircle2, Bell, Radio
} from 'lucide-react';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

export default function DynamicIsland() {
  const {
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

  // If notification arrives, highlight the island
  const isNotificationMode = !!activeNotification;

  return (
    <div 
      id="rminios-dynamic-island"
      className={`dynamic-island-container ${isIslandExpanded ? 'expanded' : ''} ${isNotificationMode ? 'notification' : ''} ${isPlaying ? 'playing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. NOTIFICATION POPUP VIEW */}
      {isNotificationMode ? (
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
        /* 2. EXPANDED MEDIA & STUDIO VIEW */
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

            <div className="island-main-controls">
              <button 
                className="island-play-pause-lg"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
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
    </div>
  );
}
