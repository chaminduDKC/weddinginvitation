/**
 * Autoplay-safe audio controller.
 * Browsers and mobile WebViews strictly require an initial user gesture.
 * This manager provides seamless track switching, track previewing, and continuous looped playback.
 */

class RomanticAudioManager {
  private audio: HTMLAudioElement | null = null;
  private isUnlocked = false;
  private isPlaying = false;
  private currentTrackUrl = '/music/modern-minimalist/acoustic-piano.mp3';

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.audio = new Audio(this.currentTrackUrl);
    this.audio.loop = true;
    this.audio.volume = 0.45;
    this.audio.preload = 'none';
  }

  /**
   * Unlock and play audio on user interaction (e.g. tapping "Open Invitation").
   */
  public async unlockAndPlay(customTrackUrl?: string | null): Promise<boolean> {
    if (!customTrackUrl || customTrackUrl === 'none') {
      this.pause();
      return false;
    }

    if (!this.audio) this.init();
    if (!this.audio) return false;

    if (customTrackUrl && this.currentTrackUrl !== customTrackUrl) {
      this.audio.src = customTrackUrl;
      this.currentTrackUrl = customTrackUrl;
    }

    try {
      await this.audio.play();
      this.isUnlocked = true;
      this.isPlaying = true;
      return true;
    } catch (err) {
      console.warn('Audio play request was blocked or postponed:', err);
      this.isPlaying = false;
      return false;
    }
  }

  /**
   * Directly preview or toggle a specific track (e.g. inside ThemeCustomizePage track list).
   */
  public async previewTrack(trackUrl: string): Promise<boolean> {
    if (!this.audio) this.init();
    if (!this.audio) return false;

    // If currently playing the same track, toggle pause
    if (this.isPlaying && this.isTrackPlaying(trackUrl)) {
      this.pause();
      return false;
    }

    this.audio.src = trackUrl;
    this.currentTrackUrl = trackUrl;

    try {
      await this.audio.play();
      this.isUnlocked = true;
      this.isPlaying = true;
      return true;
    } catch (err) {
      console.warn('Preview play blocked:', err);
      this.isPlaying = false;
      return false;
    }
  }

  public toggle(fallbackTrackUrl?: string | null): boolean {
    if (!this.audio) this.init();
    if (!this.audio) return false;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      if (fallbackTrackUrl && fallbackTrackUrl !== 'none' && this.currentTrackUrl !== fallbackTrackUrl) {
        this.audio.src = fallbackTrackUrl;
        this.currentTrackUrl = fallbackTrackUrl;
      }

      this.audio.play().then(() => {
        this.isPlaying = true;
        this.isUnlocked = true;
      }).catch(err => {
        console.warn('Failed to resume audio:', err);
      });
    }

    return this.isPlaying;
  }

  public pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  public getCurrentTrackUrl(): string {
    return this.currentTrackUrl;
  }

  public isTrackPlaying(trackUrl: string): boolean {
    if (!this.isPlaying) return false;
    if (this.currentTrackUrl === trackUrl) return true;
    if (this.audio?.src && trackUrl && this.audio.src.endsWith(trackUrl)) return true;
    return false;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      isUnlocked: this.isUnlocked,
      currentTrackUrl: this.currentTrackUrl,
    };
  }
}

export const audioManager = new RomanticAudioManager();
