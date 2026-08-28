import { useState, useCallback, useEffect, useRef } from 'react';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const japaneseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize and check for native Japanese voices
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
    // Stop Audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Stop SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingId(null);
  }, []);

  const speak = useCallback(
    (text: string, id: string = text) => {
      stop();

      const cleanText = sanitizeSpeechText(text);
      if (!cleanText) return;

      setPlayingId(id);

      // Strategy 1: Google Japanese Full-Sentence & Word TTS Stream
      // Generates 100% natural, continuous native Japanese female voice for ANY arbitrary Japanese sentence or word
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encodeURIComponent(cleanText)}`;
      const youdaoTtsUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=2&le=jap`;

      const tryPlayUrl = (url: string, onFail: () => void) => {
        try {
          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onended = () => {
            setPlayingId(null);
            audioRef.current = null;
          };

          audio.onerror = () => {
            onFail();
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              onFail();
            });
          }
        } catch {
          onFail();
        }
      };

      // Play Google TTS -> if failed, try Youdao -> if failed, try Web Speech API
      tryPlayUrl(googleTtsUrl, () => {
        tryPlayUrl(youdaoTtsUrl, () => {
          fallbackWebSpeech(cleanText, id);
        });
      });
    },
    [stop]
  );

  const fallbackWebSpeech = (cleanText: string, id: string) => {
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
      utterance.rate = 0.88;

      if (japaneseVoiceRef.current) {
        utterance.voice = japaneseVoiceRef.current;
      }

      utterance.onstart = () => setPlayingId(id);
      utterance.onend = () => {
        setPlayingId(null);
      };
      utterance.onerror = () => {
        setPlayingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setPlayingId(null);
    }
  };

  return { speak, stop, playingId };
}
