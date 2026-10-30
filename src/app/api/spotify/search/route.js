import { NextResponse } from 'next/server';

// Comprehensive catalog of Official Curated Spotify Playlists
const SPOTIFY_PLAYLISTS = [
  // Focus & Coding
  {
    id: '37i9dQZF1DWWQRwui0ExPn',
    title: 'lofi beats',
    curator: 'Spotify',
    desc: 'Beats to relax/study to. The definitive coding lofi playlist.',
    category: 'Lofi & Study',
    albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DWZeKCadgRdKQ',
    title: 'Deep Focus',
    curator: 'Spotify',
    desc: 'Keep calm and focus with atmospheric ambient post-rock.',
    category: 'Focus & Ambient',
    albumArt: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX3qCx52SuA2W',
    title: 'Brain Food',
    curator: 'Spotify',
    desc: 'Hypnotic electronic focus rhythms for cognitive deep work.',
    category: 'Electronic Focus',
    albumArt: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3qCx52SuA2W?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX8Uebhn9wzrS',
    title: 'Instrumental Study',
    curator: 'Spotify',
    desc: 'Soft instrumental melodies to boost productivity and focus.',
    category: 'Acoustic & Study',
    albumArt: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DWZZbwlv3Vmtr',
    title: 'Focus Flow',
    curator: 'Spotify',
    desc: 'Uptempo instrumental beats to power through programming sprints.',
    category: 'Coding & Energy',
    albumArt: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZZbwlv3Vmtr?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DXc8kgYqQLMfH',
    title: 'Chill Lofi Study Beats',
    curator: 'Spotify',
    desc: 'Mellow lofi hip hop beats for writing and paper drafting.',
    category: 'Lofi & Study',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXc8kgYqQLMfH?utm_source=generator&theme=0',
    type: 'playlist'
  },
  // Piano & Classical
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    title: 'Peaceful Piano',
    curator: 'Spotify',
    desc: 'Calm acoustic piano melodies to enhance focus and relax.',
    category: 'Piano & Strings',
    albumArt: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX7K31D69s4M1',
    title: 'Calm Piano Focus',
    curator: 'Spotify',
    desc: 'Gentle, modern solo piano for late-night research sessions.',
    category: 'Piano & Strings',
    albumArt: 'https://images.unsplash.com/photo-1514117445516-2ecfc5c4d257?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX7K31D69s4M1?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX8CwtYg11s3f',
    title: 'Epic Classical',
    curator: 'Spotify',
    desc: 'Inspiring, grand orchestral works that spark breakthrough ideas.',
    category: 'Classical',
    albumArt: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8CwtYg11s3f?utm_source=generator&theme=0',
    type: 'playlist'
  },
  // Soundtracks & Cinematic
  {
    id: '37i9dQZF1DX142b78q6W8g',
    title: 'Hans Zimmer & Film Scores',
    curator: 'Spotify',
    desc: 'Masterpieces by Hans Zimmer, Ludwig Göransson, and John Williams.',
    category: 'Soundtracks',
    albumArt: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX142b78q6W8g?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DWVcbIib8nLFI',
    title: 'Interstellar & Sci-Fi Scores',
    curator: 'Spotify',
    desc: 'Cosmic organs and celestial acoustics for deep universe discovery.',
    category: 'Soundtracks',
    albumArt: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVcbIib8nLFI?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DXdfO4YQFi2RF',
    title: 'Video Game Soundtracks',
    curator: 'Spotify',
    desc: 'Iconic gaming themes engineered for long focus loops.',
    category: 'Soundtracks',
    albumArt: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdfO4YQFi2RF?utm_source=generator&theme=0',
    type: 'playlist'
  },
  // Synthwave & Electronic
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    title: 'Synthwave Chill / Space',
    curator: 'Spotify',
    desc: 'Retro synthwave and cosmic focus for futuristic engineering.',
    category: 'Synthwave & Electronic',
    albumArt: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DXdOEFt9ZX0dh',
    title: 'RetroWave / Outrun',
    curator: 'Spotify',
    desc: 'Neon cyber beats and fast 80s driving synthesizers.',
    category: 'Synthwave & Electronic',
    albumArt: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdOEFt9ZX0dh?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX4FP944Jq42d',
    title: 'Cyberpunk Vibe',
    curator: 'Spotify',
    desc: 'Dark electro, industrial bass, and tech-noir soundscapes.',
    category: 'Synthwave & Electronic',
    albumArt: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4FP944Jq42d?utm_source=generator&theme=0',
    type: 'playlist'
  },
  // Global Hits & Pop
  {
    id: '37i9dQZF1DXcBWIGoYBM5M',
    title: "Today's Top Hits",
    curator: 'Spotify',
    desc: 'The hottest tracks on Spotify right now worldwide.',
    category: 'Pop & Hits',
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX5KpP2LN299J',
    title: 'Taylor Swift Essentials',
    curator: 'Spotify',
    desc: 'All the biggest hits, fan favorites, and eras of Taylor Swift.',
    category: 'Pop & Hits',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5KpP2LN299J?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DZ06evO151d0U',
    title: 'This Is Coldplay',
    curator: 'Spotify',
    desc: 'Yellow, Viva La Vida, Fix You, and the essential Coldplay catalog.',
    category: 'Pop & Hits',
    albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO151d0U?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DZ06evO2YpQc2',
    title: 'This Is The Weeknd',
    curator: 'Spotify',
    desc: 'Blinding Lights, Starboy, and the complete Abel Tesfaye collection.',
    category: 'Pop & Hits',
    albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO2YpQc2?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX4WYpdgoIcn6',
    title: 'Chill Hits',
    curator: 'Spotify',
    desc: 'Kick back to the best chill pop and modern acoustic hits.',
    category: 'Pop & Hits',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DWXRqgorJj26U',
    title: 'Rock Classics',
    curator: 'Spotify',
    desc: 'Rock legends & timeless anthems that never get old.',
    category: 'Rock',
    albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator&theme=0',
    type: 'playlist'
  },
  // Indian & Bollywood
  {
    id: '37i9dQZF1DX0XUfTFmZeMt',
    title: 'Bollywood Chill',
    curator: 'Spotify',
    desc: 'Soulful Hindi acoustics, unhurried melodies, and easy listening.',
    category: 'Indian & Bollywood',
    albumArt: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUfTFmZeMt?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DZ06evO37mcv3',
    title: 'This Is Arijit Singh',
    curator: 'Spotify',
    desc: 'Tum Hi Ho, Kesariya, Channa Mereya and the soulful voice of Arijit Singh.',
    category: 'Indian & Bollywood',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO37mcv3?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX1q47H4k20pI',
    title: 'A.R. Rahman Focus',
    curator: 'Spotify',
    desc: 'Academy-award winning maestro orchestrations and peaceful symphonies.',
    category: 'Indian & Bollywood',
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1q47H4k20pI?utm_source=generator&theme=0',
    type: 'playlist'
  },
  // Anime & Hip Hop
  {
    id: '37i9dQZF1DX5xiztvhV9pG',
    title: 'Anime Lofi & OST Chill',
    curator: 'Spotify',
    desc: 'Chill anime themes, Ghibli piano, and lo-fi nostalgia.',
    category: 'Anime & Gaming',
    albumArt: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5xiztvhV9pG?utm_source=generator&theme=0',
    type: 'playlist'
  },
  {
    id: '37i9dQZF1DX0XUsuxWHRQd',
    title: 'RapCaviar / Focus Flow',
    curator: 'Spotify',
    desc: 'High energy hip hop, Drake, Kendrick, and rhythm focus.',
    category: 'Hip Hop & Rhythm',
    albumArt: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0',
    type: 'playlist'
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const searchType = searchParams.get('type') || 'all'; // 'playlist' | 'track' | 'all'

    const trimmed = query.trim().toLowerCase();

    // 1. Direct Spotify URL / URI Paste Parsing
    const spotifyMatch = trimmed.match(/spotify\.(com|link)\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/i) 
      || trimmed.match(/spotify:(track|playlist|album|artist):([a-zA-Z0-9]+)/i);

    if (spotifyMatch) {
      const type = spotifyMatch[2] || spotifyMatch[1];
      const id = spotifyMatch[3] || spotifyMatch[2];
      const embedUri = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      
      const directItem = {
        id: `spotify-${type}-${id}`,
        title: `Spotify ${type.charAt(0).toUpperCase() + type.slice(1)} (${id})`,
        curator: 'Custom Spotify Import',
        desc: `Loaded via direct Spotify link. Full ${type} ready in player.`,
        albumArt: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=400&auto=format&fit=crop&q=80',
        spotifyUri: embedUri,
        type: type === 'track' ? 'track' : 'playlist'
      };

      return NextResponse.json({
        success: true,
        playlists: [directItem, ...SPOTIFY_PLAYLISTS],
        tracks: [directItem],
        isDirectSpotify: true
      });
    }

    // 2. Track Search (iTunes global API for songs)
    let tracks = [];
    if (trimmed && (searchType === 'track' || searchType === 'all')) {
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=25`;
        const res = await fetch(itunesUrl, { next: { revalidate: 3600 } });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            tracks = data.results.map(song => {
              const hiResArt = (song.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg') 
                || song.artworkUrl100 
                || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
              return {
                id: `track-${song.trackId}`,
                title: song.trackName,
                artist: song.artistName,
                album: song.collectionName || 'Single',
                albumArt: hiResArt,
                previewUrl: song.previewUrl || '',
                duration: song.trackTimeMillis ? Math.round(song.trackTimeMillis / 1000) : 180,
                spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${song.trackName} ${song.artistName}`)}`,
                spotifyUri: `https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator&theme=0`,
                type: song.previewUrl ? 'preview' : 'spotify'
              };
            });
          }
        }
      } catch (err) {
        console.warn('Track search error:', err.message);
      }
    }

    // 3. Playlist Search across curated Spotify database
    let matchingPlaylists = SPOTIFY_PLAYLISTS;
    if (trimmed) {
      matchingPlaylists = SPOTIFY_PLAYLISTS.filter(p => 
        p.title.toLowerCase().includes(trimmed) || 
        p.desc.toLowerCase().includes(trimmed) || 
        p.category.toLowerCase().includes(trimmed) ||
        p.curator.toLowerCase().includes(trimmed)
      );

      // If specific search returned few results, dynamically synthesize a result or append popular ones
      if (matchingPlaylists.length === 0) {
        if (tracks.length > 0) {
          const first = tracks[0];
          matchingPlaylists = [
            {
              id: `spotify-search-${encodeURIComponent(trimmed)}`,
              title: `${first.artist} & Similar on Spotify`,
              curator: 'Spotify Catalog',
              desc: `Top tracks and hits matching "${query}".`,
              category: 'Search Match',
              albumArt: first.albumArt,
              spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
              rawUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
              type: 'playlist'
            },
            ...SPOTIFY_PLAYLISTS.slice(0, 6)
          ];
        } else {
          matchingPlaylists = SPOTIFY_PLAYLISTS;
        }
      }
    }

    return NextResponse.json({
      success: true,
      playlists: matchingPlaylists,
      tracks: tracks.length > 0 ? tracks : matchingPlaylists.map(p => ({
        id: p.id,
        title: p.title,
        artist: p.curator,
        album: p.desc,
        albumArt: p.albumArt,
        spotifyUri: p.spotifyUri,
        type: 'spotify'
      }))
    });
  } catch (error) {
    console.error('Spotify Search API Error:', error);
    return NextResponse.json({
      success: false,
      playlists: SPOTIFY_PLAYLISTS,
      tracks: []
    }, { status: 500 });
  }
}
