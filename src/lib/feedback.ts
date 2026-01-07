// Haptic feedback utility using Vibration API
export const haptics = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 20]);
    }
  },
};

// Audio feedback using Web Audio API for crisp sounds
class AudioFeedback {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
    if (!this.isEnabled) return;
    
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Soft attack and release for pleasant sound
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Soft click for navigation
  click() {
    this.playTone(800, 0.05, 'sine', 0.08);
    haptics.light();
  }

  // Pleasant pop for next step
  pop() {
    this.playTone(600, 0.08, 'sine', 0.1);
    setTimeout(() => this.playTone(900, 0.06, 'sine', 0.08), 30);
    haptics.medium();
  }

  // Success sound for completion
  success() {
    this.playTone(523, 0.15, 'sine', 0.1); // C5
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.1), 100); // E5
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.12), 200); // G5
    haptics.success();
  }

  // Soft whoosh for modal open
  whoosh() {
    const ctx = this.getContext();
    if (!ctx || !this.isEnabled) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    
    const now = ctx.currentTime;
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    
    haptics.light();
  }

  toggle(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

export const audio = new AudioFeedback();
