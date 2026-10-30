'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Music2, Play, Pause, ExternalLink, 
  Sparkles, Disc, Radio, Loader2, Link2, Check
} from 'lucide-react';
import { useDynamicIsland } from '@/context/DynamicIslandContext';

const GENRE_CHIPS = [
  { label: '☕ Lo-Fi Coding', query: 'lofi hip hop' },
  { label: '🚀 Hans Zimmer / Interstellar', query: 'Hans Zimmer Interstellar' },
  { label: '🎹 Peaceful Piano', query: 'Ludovico Einaudi piano' },
  { label: '🌌 Synthwave / Retro', query: 'synthwave electronic' },
  { label: '🎧 Daft Punk', query: 'Daft Punk' },
  { label: '🌧️ Ambient Calm', query: 'ambient meditation' },
  { label: '🔥 Taylor Swift', query: 'Taylor Swift' },
  { label: '⚡ The Weeknd', query: 'The Weeknd' },
  { label: '🎸 Coldplay', query: 'Coldplay' }
];

export default function SpotifySearchModal() {
  const { 
    isSearchModalOpen, 
    setIsSearchModalOpen, 
    playTrack, 
    currentTrack, 
    isPlaying, 
    showNotification 
  } = useDynamicIsland();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'url'
  const [customUrl, setCustomUrl] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Search function
  const executeSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success && data.tracks) {
        setResults(data.tracks);
      }
    } catch (e) {
      console.warn('Search request failed:', e);
    }
    setLoading(false);
  };

  // Initial load presets
  useEffect(() => {
    if (isSearchModalOpen && results.length === 0) {
      executeSearch('');
    }
  }, [isSearchModalOpen, results.length]);

  // Handle debounced search query
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(val);
    }, 350);
  };

  // Handle direct Spotify URL submission
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    executeSearch(customUrl.trim());
    setActiveTab('search');
    showNotification({
      title: 'Spotify Track Imported',
      message: 'Loading your custom Spotify link into the background player...',
      icon: <Disc size={16} />,
      type: 'success'
    });
  };

  const handleSelectTrack = (track) => {
    playTrack(track);
    showNotification({
      title: 'Now Playing in Background',
      message: `${track.title} • ${track.artist}`,
      icon: <Music2 size={16} />,
      type: 'purple'
    });
  };

  if (!isSearchModalOpen) return null;

  return (
    <div className="spotify-modal-overlay" onClick={() => setIsSearchModalOpen(false)}>
      <div className="spotify-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="spotify-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spotify-modal-badge">
              <Music2 size={18} style={{ color: '#1db954' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                Universal Spotify & Deep Work Music
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                Search millions of songs or import any Spotify track/playlist to play in website background
              </p>
            </div>
          </div>
          <button 
            className="spotify-modal-close"
            onClick={() => setIsSearchModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="spotify-modal-tabs">
          <button 
            className={`spotify-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={14} /> Search Any Song or Artist
          </button>
          <button 
            className={`spotify-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <Link2 size={14} /> Paste Spotify URL / Playlist
          </button>
        </div>

        {/* Search Input View */}
        {activeTab === 'search' ? (
          <div>
            <div className="spotify-search-input-box">
              <Search size={16} style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 12 }} />
              <input 
                type="text" 
                value={query}
                onChange={handleInputChange}
                placeholder="Search Taylor Swift, Interstellar, Lo-Fi, Coldplay, Mozart, Anime..."
                className="spotify-search-input"
                autoFocus
              />
              {loading && <Loader2 size={16} className="spotify-spinner" />}
              {query && (
                <button 
                  className="spotify-clear-btn" 
                  onClick={() => { setQuery(''); executeSearch(''); }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Genre Chips */}
            <div className="spotify-genre-chips">
              {GENRE_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  className="spotify-chip"
                  onClick={() => {
                    setQuery(chip.query);
                    executeSearch(chip.query);
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Paste URL View */
          <form onSubmit={handleUrlSubmit} className="spotify-url-form">
            <input 
              type="text" 
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="e.g. https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT or /playlist/..."
              className="spotify-search-input"
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Load & Play
            </button>
          </form>
        )}

        {/* Results List */}
        <div className="spotify-results-list">
          {loading && results.length === 0 ? (
            <div className="spotify-loading-state">
              <Loader2 size={28} className="spotify-spinner" />
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Searching global music catalog...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="spotify-empty-state">
              <Music2 size={32} style={{ opacity: 0.3 }} />
              <p>No tracks found for "{query}". Try another artist, song, or soundtrack.</p>
            </div>
          ) : (
            results.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentlyPlaying = isCurrent && isPlaying;

              return (
                <div 
                  key={track.id} 
                  className={`spotify-track-row ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleSelectTrack(track)}
                >
                  {/* Artwork */}
                  <div className="track-row-art-wrapper">
                    <img 
                      src={track.albumArt || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'} 
                      alt={track.title}
                      className="track-row-art"
                    />
                    <div className="track-row-play-overlay">
                      {isCurrentlyPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="track-row-details">
                    <span className="track-row-title">{track.title}</span>
                    <span className="track-row-artist">{track.artist} • {track.album}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="track-row-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`btn btn-sm ${isCurrentlyPlaying ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', gap: 5, padding: '4px 12px' }}
                      onClick={() => handleSelectTrack(track)}
                    >
                      {isCurrentlyPlaying ? (
                        <><Pause size={12} /> Playing</>
                      ) : (
                        <><Play size={12} /> Play</>
                      )}
                    </button>
                    {track.spotifyUrl && (
                      <a 
                        href={track.spotifyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="track-row-link"
                        title="View on Spotify"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
