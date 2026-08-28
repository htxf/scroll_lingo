import { useState, useCallback, useRef, useEffect } from 'react';

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
  const japaneseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Pre-fetch and lock the Japanese voice on load & voice changes
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
    // Bump sequence to invalidate any pending playback
    playSeqRef.current += 1;

    // 1. Instantly pause, clear and destroy Audio element
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

    // 2. Instantly cancel Web Speech Synthesis
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
    (text: string, id: string = text) => {
      // Step 1: Force stop everything immediately to guarantee 0 echo and 0 double-play
      stop();

      const cleanText = sanitizeSpeechText(text);
      if (!cleanText) return;

      const thisSeq = ++playSeqRef.current;
      setPlayingId(id);

      // Determine if text is a full sentence or single token/kana
      const isSentence = cleanText.length > 6 || /[。！？、\s]/.test(cleanText);

      // =========================================================================
      // CASE 1: Full Sentences -> Direct Local Web Speech Synthesis (0 network, 0ms, 100% pure kana)
      // =========================================================================
      if (isSentence) {
        if (!('speechSynthesis' in window)) {
          setPlayingId(null);
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
        return;
      }

      // =========================================================================
      // CASE 2: Single Words / Fifty-Sounds Kana -> High-Speed Native Human Japanese MP3
      // =========================================================================
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
          // If network audio fails, fallback to local Web Speech once (no overlapping)
          if ('speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(cleanText);
              utterance.lang = 'ja-JP';
              utterance.rate = 0.9;
              if (japaneseVoiceRef.current) {
                utterance.voice = japaneseVoiceRef.current;
              }
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
          if (playSeqRef.current === thisSeq) {
            setPlayingId(null);
          }
        });
      }
    },
    [stop]
  );

  return { speak, stop, playingId };
}
