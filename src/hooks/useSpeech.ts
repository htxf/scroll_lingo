import { useState, useCallback, useRef } from 'react';

/**
 * Helper to sanitize speech text by stripping out emojis, kaomoji, and non-speech symbols
 */
export function sanitizeSpeechText(text: string): string {
  return text
    // Strip standard Unicode Emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
    // Strip Kaomoji in parentheses like ( •̀ ω •́ )✧ or (≧∇≦)
    .replace(/\([^\)]*[\u0370-\u03FF\u0400-\u04FF\u2200-\u22FF\u25A0-\u25FF\u2207\u2200\u03C9\u2207\u2200\u2267\u2266][^\)]*\)/gu, '')
    // Strip remaining decorative symbols
    .replace(/[✨🎉💪🔥⚽️☕️🍣( •̀ ω •́ )✧(≧∇≦)]/g, '')
    .trim();
}

export function useSpeech() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const playSeqRef = useRef<number>(0);

  const stop = useCallback(() => {
    playSeqRef.current += 1;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingId(null);
  }, []);

  const speak = useCallback(
    (text: string, id: string = text) => {
      // 1. Stop any currently playing audio immediately to prevent echo / double playing
      stop();

      const cleanText = sanitizeSpeechText(text);
      if (!cleanText) return;

      const thisSeq = ++playSeqRef.current;
      setPlayingId(id);

      // High-Quality Native Japanese TTS Audio (Fast & accessible globally in China and overseas)
      // Supports both single kana/words AND full long sentences
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=jap`;
      
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioUrl;
      currentAudioRef.current = audio;

      audio.onended = () => {
        if (playSeqRef.current === thisSeq) {
          setPlayingId(null);
          currentAudioRef.current = null;
        }
      };

      audio.onerror = () => {
        if (playSeqRef.current === thisSeq) {
          // Fallback to Web Speech Synthesis ONLY if network stream fails
          if ('speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(cleanText);
              utterance.lang = 'ja-JP';
              utterance.rate = 0.88;

              utterance.onend = () => {
                if (playSeqRef.current === thisSeq) setPlayingId(null);
              };
              utterance.onerror = () => {
                if (playSeqRef.current === thisSeq) setPlayingId(null);
              };

              window.speechSynthesis.speak(utterance);
            } catch {
              setPlayingId(null);
            }
          } else {
            setPlayingId(null);
          }
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy blocks Audio.play(), try Web Speech API
          if (playSeqRef.current === thisSeq && 'speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(cleanText);
              utterance.lang = 'ja-JP';
              utterance.rate = 0.88;
              utterance.onend = () => {
                if (playSeqRef.current === thisSeq) setPlayingId(null);
              };
              utterance.onerror = () => {
                if (playSeqRef.current === thisSeq) setPlayingId(null);
              };
              window.speechSynthesis.speak(utterance);
            } catch {
              setPlayingId(null);
            }
          } else {
            setPlayingId(null);
          }
        });
      }
    },
    [stop]
  );

  return { speak, stop, playingId };
}
