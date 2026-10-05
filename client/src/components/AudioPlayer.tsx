import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../lib/audio';

export const AudioPlayer: React.FC<{ customTrackUrl?: string }> = ({ customTrackUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    const active = audioManager.toggle();
    setIsPlaying(active);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/95 border border-slate-200 text-obsidian shadow-sm hover:bg-white transition-transform active:scale-95 min-h-[44px]"
        aria-label={isPlaying ? 'Mute romantic background music' : 'Play romantic background music'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="h-4 w-4 text-gold-600" />
            <div className="flex items-end gap-0.5 h-3 w-4">
              <span className="w-0.5 bg-gold-600 rounded-full animate-bounce h-3" />
              <span className="w-0.5 bg-gold-600 rounded-full animate-bounce h-2 delay-75" />
              <span className="w-0.5 bg-gold-600 rounded-full animate-bounce h-3.5 delay-150" />
            </div>
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Music</span>
          </>
        )}
      </button>
    </div>
  );
};
