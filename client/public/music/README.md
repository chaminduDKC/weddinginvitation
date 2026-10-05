# Wedding Music Tracks (Public Directory)

All wedding background music files are stored here and served as static assets from the `/public` directory.

## Directory Structure

```
client/public/music/
├── modern-minimalist/
│   ├── acoustic-piano.mp3
│   ├── ambient-romance.mp3
│   └── dream-chords.mp3
├── tropical-bliss/
│   ├── sunset-guitar.mp3
│   ├── beach-harmony.mp3
│   └── bonfire-romance.mp3
├── classic-floral/
│   ├── violin-piano.mp3
│   ├── garden-waltz.mp3
│   └── rose-petals.mp3
├── royal-vintage/
│   ├── grand-waltz.mp3
│   ├── baroque-symphony.mp3
│   └── majestic-proclamation.mp3
└── eternal-noir/
    ├── noir-romance.mp3
    ├── celestial-symphony.mp3
    └── sacred-lotus.mp3
```

## How to Add or Replace Songs

1. **Add your audio file:**
   Drop your `.mp3` (or `.m4a` / `.wav`) file into the desired template folder, for example:
   `client/public/music/modern-minimalist/my-new-song.mp3`

2. **Register the track in configuration:**
   Open `client/src/lib/musicTracks.ts` and update or add an entry in `TEMPLATE_MUSIC`:
   ```typescript
   {
     id: 'min-custom-1',
     title: 'My Custom Song Name',
     artist: 'Artist Name',
     url: '/music/modern-minimalist/my-new-song.mp3',
     description: 'Short romantic description of the music style.',
   }
   ```

3. **That's it!**
   The new song will immediately appear in:
   - The **Theme Customizer** (`/customize/:templateKey`) with play/pause preview
   - The **Invitation Preview** and **Live Guest View** with automatic unlock on wax seal tap and floating audio control bar.
