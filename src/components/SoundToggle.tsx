import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const SoundToggle: React.FC = () => {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('camp-click-sound') !== 'off';
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('camp-click-sound', enabled ? 'on' : 'off');
    } catch {
      // ignore
    }

    async function handleClick(e: MouseEvent) {
      if (
        !enabled ||
        !(e.target instanceof Element) ||
        e.target.closest('[data-sound-toggle]') ||
        !e.target.closest('button:not([disabled]), a[href], .step-icon, .session-icon')
      ) {
        return;
      }

      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioCtxClass();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const now = ctx.currentTime;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(760, now);
          osc.frequency.exponentialRampToValueAtTime(460, now + 0.055);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.045, now + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.07);

          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        } catch {
          // Audio play error ignored
        }
      }
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [enabled]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const label = enabled ? 'كتم صوت النقر' : 'تشغيل صوت النقر';

  return (
    <button
      className="sound-toggle"
      data-sound-toggle
      aria-label={label}
      title={label}
      aria-pressed={enabled}
      onClick={() => setEnabled((prev) => !prev)}
    >
      {enabled ? (
        <Volume2 size={20} aria-hidden="true" />
      ) : (
        <VolumeX size={20} aria-hidden="true" />
      )}
      <span>صوت النقر</span>
    </button>
  );
};
