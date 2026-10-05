export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  description: string;
}

/**
 * Curated template music tracks stored locally in client/public/music/.
 * Developers can add their own audio files (.mp3, .m4a, .wav) directly into
 * `client/public/music/<template-folder>/` and register them here.
 */
export const TEMPLATE_MUSIC: Record<string, MusicTrack[]> = {
  'modern-minimalist': [
    {
      id: 'min-1',
      title: 'Gentle Acoustic Piano',
      artist: 'Acoustic Studio',
      url: '/music/modern-minimalist/acoustic-piano.mp3',
      description: 'Understated, modern piano chords perfect for clean minimal aesthetic.',
    },
    {
      id: 'min-2',
      title: 'Soft Ambient Romance',
      artist: 'Serenity Strings',
      url: '/music/modern-minimalist/ambient-romance.mp3',
      description: 'Delicate acoustic melody with crisp contemporary tone.',
    },
    {
      id: 'min-3',
      title: 'Minimalist Dream Chords',
      artist: 'Pure Melodies',
      url: '/music/modern-minimalist/dream-chords.mp3',
      description: 'Subtle background atmosphere with peaceful spacious harmonies.',
    },
  ],
  'tropical-bliss': [
    {
      id: 'trop-1',
      title: 'Island Sunset Acoustic Guitar',
      artist: 'Coastal Melody',
      url: '/music/tropical-bliss/sunset-guitar.mp3',
      description: 'Warm acoustic guitar with sunny ocean breeze and tropical warmth.',
    },
    {
      id: 'trop-2',
      title: 'Tropical Beachfront Harmony',
      artist: 'Island Strings',
      url: '/music/tropical-bliss/beach-harmony.mp3',
      description: 'Relaxed island acoustic flow suited for barefoot beachfront nuptials.',
    },
    {
      id: 'trop-3',
      title: 'Starlight Bonfire Romance',
      artist: 'Lagoon Acoustic',
      url: '/music/tropical-bliss/bonfire-romance.mp3',
      description: 'Intimate evening acoustic warmth celebrating under the palm trees.',
    },
  ],
  'classic-floral': [
    {
      id: 'flor-1',
      title: 'Sweet Romance Violin & Piano',
      artist: 'Orchestral Blossom',
      url: '/music/classic-floral/violin-piano.mp3',
      description: 'Emotional sweet strings blending acoustic violin and grand piano.',
    },
    {
      id: 'flor-2',
      title: 'Botanical Garden Waltz',
      artist: 'Chamber Ensemble',
      url: '/music/classic-floral/garden-waltz.mp3',
      description: 'Graceful floral melody with delicate orchestral romantic warmth.',
    },
    {
      id: 'flor-3',
      title: 'Rose Petals Symphony',
      artist: 'Rosewood Quartet',
      url: '/music/classic-floral/rose-petals.mp3',
      description: 'Tender acoustic and violin pairing for romantic garden nuptials.',
    },
  ],
  'royal-vintage': [
    {
      id: 'roy-1',
      title: 'Grand Royal Nuptial Waltz',
      artist: 'Imperial Chamber Quartet',
      url: '/music/royal-vintage/grand-waltz.mp3',
      description: 'Stately classical waltz evoking grand royal ballroom celebrations.',
    },
    {
      id: 'roy-2',
      title: 'Baroque Cathedral Symphony',
      artist: 'Royal Strings Orchestra',
      url: '/music/royal-vintage/baroque-symphony.mp3',
      description: 'Opulent strings and deep harmony suited for regal celebrations.',
    },
    {
      id: 'roy-3',
      title: 'Majestic Proclamation Harmony',
      artist: 'Vintage Chamber',
      url: '/music/royal-vintage/majestic-proclamation.mp3',
      description: 'Solemn and celebratory imperial nuptial arrangement.',
    },
  ],
  'eternal-noir': [
    {
      id: 'noir-1',
      title: 'Cinematic Noir Romance',
      artist: 'Celestial Strings',
      url: '/music/eternal-noir/noir-romance.mp3',
      description: 'Deep, cinematic high-fashion strings with breathtaking elegance.',
    },
    {
      id: 'noir-2',
      title: 'Midnight Celestial Symphony',
      artist: 'Moonstone Ensemble',
      url: '/music/eternal-noir/celestial-symphony.mp3',
      description: 'Rich orchestral swell with sacred ambient undertones.',
    },
    {
      id: 'noir-3',
      title: 'Sacred Lotus Serenity',
      artist: 'Lotus Sanctuary',
      url: '/music/eternal-noir/sacred-lotus.mp3',
      description: 'Warm serene acoustic romance with timeless grandeur.',
    },
  ],
};

export const getDefaultTrackForTemplate = (templateKey: string): MusicTrack => {
  const tracks = TEMPLATE_MUSIC[templateKey] || TEMPLATE_MUSIC['eternal-noir'];
  return tracks[0];
};

export const getTracksForTemplate = (templateKey: string): MusicTrack[] => {
  return TEMPLATE_MUSIC[templateKey] || TEMPLATE_MUSIC['eternal-noir'];
};
