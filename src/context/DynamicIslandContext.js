'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const DynamicIslandContext = createContext(null);

const DEFAULT_TRACK = {
  id: 'lofi-beats-default',
  title: 'Lo-Fi Chill & Code',
  artist: 'Lofi Girl / Chilled Beats',
  album: 'Deep Work Focus',
  albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
  previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
  type: 'spotify'
};

export function DynamicIslandProvider({ children }) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState('ambient'); // 'ambient' | 'spotify' | 'preview'
  const [currentTrack, setCurrentTrack] = useState(DEFAULT_TRACK);
  const [ambientType, setAmbientType] = useState('rain'); // 'rain' | 'binaural' | 'waves' | 'whitenoise'
  const [volume, setVolume] = useState(0.5);

  // UI state
  const [isIslandExpanded, setIsIslandExpanded] = useState(false);
  const [isSoundscapeModalOpen, setIsSoundscapeModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  // Audio nodes and references
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Initialize Web Audio Context on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Stop ambient Web Audio nodes
  const stopAmbientNodes = useCallback(() => {
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
  }, []);

  // Start ambient Web Audio synthesis
  const startAmbientSynthesis = useCallback((type) => {
    stopAmbientNodes();
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

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
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
            b6 = white * 0.115926;
          } else {
            output[i] = white * 0.04;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        if (type === 'rain') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 850;
          noise.connect(filter);
          filter.connect(masterGain);
        } else {
          noise.connect(masterGain);
        }

        noise.start();
        noiseSourceRef.current = noise;

      } else if (type === 'binaural') {
        // 40Hz Gamma Focus Frequency (Left: 200Hz, Right: 240Hz)
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);

        oscLeft.type = 'sine';
        oscRight.type = 'sine';
        oscLeft.frequency.value = 200;
        oscRight.frequency.value = 240;

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
        lfo.frequency.value = 0.12; // Gentle ocean swell period
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 320;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(masterGain);

        noise.start();
        lfo.start();
        noiseSourceRef.current = noise;
        osc1Ref.current = lfo;
      }

      setIsPlaying(true);
      setActiveMode('ambient');
      setAmbientType(type);
    } catch (err) {
      console.warn('Web Audio synthesis error:', err);
    }
  }, [getAudioContext, stopAmbientNodes, volume]);

  // Adjust volume dynamically
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play ambient generator
  const playAmbient = useCallback((type) => {
    const targetType = type || ambientType;
    startAmbientSynthesis(targetType);
    setCurrentTrack({
      id: `ambient-${targetType}`,
      title: targetType === 'rain' ? '🌧️ Heavy Rain Flow' :
             targetType === 'binaural' ? '🧠 40Hz Gamma Brainwaves' :
             targetType === 'waves' ? '🌊 Gentle Ocean Swell' : '🌬️ Pure White Noise',
      artist: 'Native Web Audio Synthesizer',
      album: 'Deep Cognitive Focus',
      albumArt: targetType === 'rain' ? 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&auto=format&fit=crop&q=80' :
                targetType === 'binaural' ? 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=300&auto=format&fit=crop&q=80' :
                targetType === 'waves' ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' :
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
      previewUrl: '',
      spotifyUri: '',
      type: 'ambient'
    });
  }, [ambientType, startAmbientSynthesis]);

  // Stop all audio
  const stopAllAudio = useCallback(() => {
    stopAmbientNodes();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, [stopAmbientNodes]);

  // Play specific track or Spotify item
  const playTrack = useCallback((track) => {
    stopAmbientNodes();
    setCurrentTrack(track);

    if (track.previewUrl) {
      setActiveMode('preview');
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn('Audio preview play error:', err);
          setIsPlaying(false);
        });
      }
    } else {
      setActiveMode('spotify');
      setIsPlaying(true);
    }
  }, [stopAmbientNodes, volume]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAllAudio();
    } else {
      if (activeMode === 'ambient') {
        playAmbient(ambientType);
      } else if (activeMode === 'preview' && audioRef.current && currentTrack.previewUrl) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        setIsPlaying(true);
      }
    }
  }, [activeMode, ambientType, currentTrack.previewUrl, isPlaying, playAmbient, stopAllAudio]);

  // Show dynamic notification on Dynamic Island
  const showNotification = useCallback(({ title, message, icon, type = 'info', duration = 4500 }) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    // Play subtle high-frequency notification blip
    try {
      const ctx = getAudioContext();
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}

    setActiveNotification({
      id: Date.now(),
      title,
      message,
      icon,
      type
    });

    notificationTimeoutRef.current = setTimeout(() => {
      setActiveNotification(null);
    }, duration);
  }, [getAudioContext]);

  const clearNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setActiveNotification(null);
  }, []);

  return (
    <DynamicIslandContext.Provider
      value={{
        isPlaying,
        activeMode,
        currentTrack,
        ambientType,
        volume,
        isIslandExpanded,
        isSoundscapeModalOpen,
        isSearchModalOpen,
        activeNotification,
        playAmbient,
        stopAllAudio,
        playTrack,
        togglePlay,
        setVolume,
        setIsIslandExpanded,
        setIsSoundscapeModalOpen,
        setIsSearchModalOpen,
        showNotification,
        clearNotification
      }}
    >
      {children}

      {/* Hidden persistent HTML5 Audio Element for Preview Streams */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        loop={activeMode === 'ambient' || activeMode === 'preview'} 
      />

      {/* Hidden persistent Spotify Embed Iframe for Continuous Playback */}
      {activeMode === 'spotify' && currentTrack?.spotifyUri && (
        <div 
          style={{ 
            position: 'fixed', 
            top: -9999, 
            left: -9999, 
            width: 1, 
            height: 1, 
            opacity: 0, 
            pointerEvents: 'none',
            zIndex: -1 
          }}
        >
          <iframe 
            src={currentTrack.spotifyUri}
            width="300"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
    </DynamicIslandContext.Provider>
  );
}

export function useDynamicIsland() {
  const context = useContext(DynamicIslandContext);
  if (!context) {
    throw new Error('useDynamicIsland must be used within a DynamicIslandProvider');
  }
  return context;
}
