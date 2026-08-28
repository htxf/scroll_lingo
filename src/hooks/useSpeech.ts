import { useState, useCallback, useRef, useEffect } from 'react';

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
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const japaneseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize and select explicit Japanese voice if available in browser
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const findJapaneseVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const jaVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === 'ja-jp' ||
          v.lang.toLowerCase() === 'ja_jp' ||
          v.lang.toLowerCase().startsWith('ja') ||
          v.name.toLowerCase().includes('japanese') ||
          v.name.includes('Kyoko') ||
          v.name.includes('Otoya') ||
          v.name.includes('Nanami') ||
          v.name.includes('日本語')
      );

      if (jaVoice) {
        japaneseVoiceRef.current = jaVoice;
      }
    };

    findJapaneseVoice();
    window.speechSynthesis.onvoiceschanged = findJapaneseVoice;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    playSeqRef.current += 1;

    // Clear timeout guard
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    // Force abort & destroy current Audio element to completely prevent delayed ghost audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.src = '';
        currentAudioRef.current.load();
      } catch {
        // ignore abort errors
      }
      currentAudioRef.current = null;
    }

    // Force cancel SpeechSynthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    setPlayingId(null);
  }, []);

  const playLocalSpeechSynthesis = useCallback(
    (cleanText: string, id: string, thisSeq: number) => {
      if (!('speechSynthesis' in window)) {
        if (playSeqRef.current === thisSeq) setPlayingId(null);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;

        if (japaneseVoiceRef.current) {
          utterance.voice = japaneseVoiceRef.current;
        }

        utterance.onstart = () => {
          if (playSeqRef.current === thisSeq) {
            setPlayingId(id);
          }
        };

        utterance.onend = () => {
          if (playSeqRef.current === thisSeq) {
            setPlayingId(null);
          }
        };

        utterance.onerror = () => {
          if (playSeqRef.current === thisSeq) {
            setPlayingId(null);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        if (playSeqRef.current === thisSeq) {
          setPlayingId(null);
        }
      }
    },
    []
  );

  const speak = useCallback(
    (text: string, id: string = text) => {
      // 1. Stop any currently playing audio immediately
      stop();

      const cleanText = sanitizeSpeechText(text);
      if (!cleanText) return;

      const thisSeq = ++playSeqRef.current;
      setPlayingId(id);

      // Determine if text is a full sentence or short token
      const isSentence = cleanText.length > 5 || /[。！？、\s]/.test(cleanText);

      // For full sentences: directly use local 0ms instant speech synthesis with pure Kana (0ms response, works offline in subway)
      if (isSentence) {
        playLocalSpeechSynthesis(cleanText, id, thisSeq);
        return;
      }

      // For short words/tokens: try dictionary audio with strict 350ms timeout guard
      let hasStartedPlaying = false;
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=jap`;
      
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioUrl;
      currentAudioRef.current = audio;

      // Timeout Guard: If network is slow (e.g. in subway), abort network audio after 350ms and speak locally immediately!
      timeoutTimerRef.current = setTimeout(() => {
        if (playSeqRef.current === thisSeq && !hasStartedPlaying) {
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = '';
            currentAudioRef.current = null;
          }
          playLocalSpeechSynthesis(cleanText, id, thisSeq);
        }
      }, 350);

      audio.onplaying = () => {
        hasStartedPlaying = true;
        if (timeoutTimerRef.current) {
          clearTimeout(timeoutTimerRef.current);
          timeoutTimerRef.current = null;
        }
      };

      audio.onended = () => {
        if (playSeqRef.current === thisSeq) {
          setPlayingId(null);
          currentAudioRef.current = null;
        }
      };

      audio.onerror = () => {
        if (playSeqRef.current === thisSeq) {
          if (timeoutTimerRef.current) {
            clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
          }
          currentAudioRef.current = null;
          playLocalSpeechSynthesis(cleanText, id, thisSeq);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (playSeqRef.current === thisSeq) {
            if (timeoutTimerRef.current) {
              clearTimeout(timeoutTimerRef.current);
              timeoutTimerRef.current = null;
            }
            currentAudioRef.current = null;
            playLocalSpeechSynthesis(cleanText, id, thisSeq);
          }
        });
      }
    },
    [stop, playLocalSpeechSynthesis]
  );

  return { speak, stop, playingId };
}
