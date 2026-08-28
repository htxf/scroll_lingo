import { useState, useCallback, useRef } from 'react';

/**
 * Pure helper to sanitize speech text by stripping out emojis, kaomoji, and non-speech symbols
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
    // Increment sequence to invalidate any pending play callbacks
    playSeqRef.current += 1;

    // 1. Force abort and destroy current Audio element
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current.load();
      } catch {
        // ignore
      }
      currentAudioRef.current = null;
    }

    // 2. Force cancel SpeechSynthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    setPlayingId(null);
  }, []);

  const speak = useCallback(
    (text: string, id: string = text, customAudioUrl?: string) => {
      // Step 1: Immediately stop any currently playing audio (strictly 0 echo, 0 double play)
      stop();

      const cleanText = sanitizeSpeechText(text);
      if (!cleanText && !customAudioUrl) return;

      const thisSeq = ++playSeqRef.current;
      setPlayingId(id);

      // Determine Audio URL:
      // 1. If explicit customAudioUrl is provided (Plan 1), use it directly
      // 2. If it's a full sentence / has punctuation, use high-speed authentic Japanese sentence MP3 stream
      // 3. If it's a short token / Kana, use Youdao Japanese dictionary MP3
      let audioUrl = customAudioUrl;
      if (!audioUrl) {
        const isSentence = cleanText.length > 5 || /[。！？、\s]/.test(cleanText);
        if (isSentence) {
          audioUrl = `https://fanyi.baidu.com/gettts?lan=jp&text=${encodeURIComponent(cleanText)}&spd=3&source=web`;
        } else {
          audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=jap`;
        }
      }

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
          setPlayingId(null);
          currentAudioRef.current = null;
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (playSeqRef.current === thisSeq) {
            setPlayingId(null);
            currentAudioRef.current = null;
          }
        });
      }
    },
    [stop]
  );

  return { speak, stop, playingId };
}
