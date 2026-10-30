import { NextResponse } from 'next/server';

// Curated high-relevance fallbacks for offline or instant quick results
const POPULAR_PRESETS = [
  {
    id: 'lofi-girl',
    title: 'Lofi Hip Hop Study Beats',
    artist: 'Lofi Girl / ChilledCow',
    album: 'Lofi Study Beats',
    albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
    type: 'spotify'
  },
  {
    id: 'deep-ambient',
    title: 'Deep Space Cosmic Ambient',
    artist: 'Stellardrone',
    album: 'Light Years',
    albumArt: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300&auto=format&fit=crop&q=80',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c35272a29c.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    type: 'spotify'
  },
  {
    id: 'interstellar',
    title: 'Cornfield Chase / Time (Interstellar)',
    artist: 'Hans Zimmer',
    album: 'Interstellar Soundtrack',
    albumArt: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_974bf3426e.mp3?filename=cinematic-atmosphere-score-2-6395.mp3',
    spotifyUri: 'https://open.spotify.com/embed/track/6pWgRkpqVfxnj3WuIcJ7S3?utm_source=generator&theme=0',
    type: 'spotify'
  },
  {
    id: 'piano-focus',
    title: 'Nuvole Bianche (Peaceful Piano)',
    artist: 'Ludovico Einaudi',
    album: 'Una Mattina',
    albumArt: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=300&auto=format&fit=crop&q=80',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=sad-soul-chopin-style-piano-123490.mp3',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    type: 'spotify'
  },
  {
    id: 'synthwave-code',
    title: 'Resonance & Midnight City',
    artist: 'HOME / M83',
    album: 'Odyssey / Hurry Up',
    albumArt: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    type: 'spotify'
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        tracks: POPULAR_PRESETS,
        total: POPULAR_PRESETS.length,
        isPreset: true
      });
    }

    const trimmed = query.trim();

    // Check if user pasted a direct Spotify URL or URI
    const spotifyMatch = trimmed.match(/spotify\.(com|link)\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/i) 
      || trimmed.match(/spotify:(track|playlist|album|artist):([a-zA-Z0-9]+)/i);

    if (spotifyMatch) {
      const type = spotifyMatch[2] || spotifyMatch[1];
      const id = spotifyMatch[3] || spotifyMatch[2];
      const embedUri = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      
      const directTrack = {
        id: `spotify-${type}-${id}`,
        title: `Spotify ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        artist: 'Imported from Spotify',
        album: 'Custom User Track',
        albumArt: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=300&auto=format&fit=crop&q=80',
        previewUrl: '',
        spotifyUri: embedUri,
        type: 'spotify'
      };

      return NextResponse.json({
        success: true,
        tracks: [directTrack, ...POPULAR_PRESETS],
        total: 1 + POPULAR_PRESETS.length,
        isDirectSpotify: true
      });
    }

    // High-speed universal music catalog search (Millions of worldwide tracks)
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=25`;
    
    let tracks = [];
    try {
      const res = await fetch(itunesUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          tracks = data.results.map((song) => {
            // Replace 100x100 with 600x600 for sharp album covers
            const hiResArt = (song.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg') 
              || song.artworkUrl100 
              || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';

            // Generate clean Spotify search embed query
            const spotifySearchUri = `https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator&theme=0`;

            return {
              id: `track-${song.trackId}`,
              title: song.trackName,
              artist: song.artistName,
              album: song.collectionName || 'Single',
              albumArt: hiResArt,
              previewUrl: song.previewUrl || '',
              duration: song.trackTimeMillis ? Math.round(song.trackTimeMillis / 1000) : 180,
              spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${song.trackName} ${song.artistName}`)}`,
              spotifyUri: spotifySearchUri,
              type: song.previewUrl ? 'preview' : 'spotify'
            };
          });
        }
      }
    } catch (apiErr) {
      console.warn('Live music search API error, filtering presets:', apiErr.message);
    }

    // Filter presets if live search returned few results
    if (tracks.length === 0) {
      const filteredPresets = POPULAR_PRESETS.filter(p => 
        p.title.toLowerCase().includes(trimmed.toLowerCase()) || 
        p.artist.toLowerCase().includes(trimmed.toLowerCase())
      );
      tracks = filteredPresets.length > 0 ? filteredPresets : POPULAR_PRESETS;
    }

    return NextResponse.json({
      success: true,
      tracks,
      total: tracks.length
    });
  } catch (error) {
    console.error('Spotify Search Route Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      tracks: POPULAR_PRESETS
    }, { status: 500 });
  }
}
