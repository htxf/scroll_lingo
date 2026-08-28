import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Pure helper to sanitize speech text by stripping out emojis, kaomoji, and non-speech symbols
 * so Web Speech API ja-JP reads pure natural Japanese text without reading out "sparkles", "biceps", etc.
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
  const japaneseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize and select explicit Japanese voice on load / voiceschanged
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const findJapaneseVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Priority 1: Exact ja-JP or ja_JP voice
      // Priority 2: Voice with "Japanese", "Kyoko", "Otoya", "Nanami", "Google 日本語"
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

    // On mobile browsers, voices load asynchronously
    window.speechSynthesis.onvoiceschanged = findJapaneseVoice;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = useCallback((text: string, id: string = text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel current speech if already playing & resume context on iOS
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Clean text by stripping emojis and kaomoji
    const cleanText = sanitizeSpeechText(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.88;

    // Explicitly bind the real Japanese voice if discovered
    if (japaneseVoiceRef.current) {
      utterance.voice = japaneseVoiceRef.current;
    } else {
      // Re-try finding Japanese voice on the fly
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === 'ja-jp' ||
          v.lang.toLowerCase() === 'ja_jp' ||
          v.lang.toLowerCase().startsWith('ja') ||
          v.name.toLowerCase().includes('japanese') ||
          v.name.includes('Kyoko') ||
          v.name.includes('日本語')
      );
      if (jaVoice) {
        utterance.voice = jaVoice;
        japaneseVoiceRef.current = jaVoice;
      }
    }

    utterance.onstart = () => setPlayingId(id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback finished/canceled:', e);
      setPlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
    }
  }, []);

  return { speak, stop, playingId };
}
