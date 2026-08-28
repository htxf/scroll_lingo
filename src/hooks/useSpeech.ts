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

interface UseSpeechOptions {
  onNetworkWarning?: (msg: string) => void;
}

export function useSpeech(options?: UseSpeechOptions) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const playSeqRef = useRef<number>(0);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const japaneseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize and detect native Japanese voice for offline emergency fallback
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

    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.src = '';
        currentAudioRef.current.load();
      } catch {
        // ignore
      }
      currentAudioRef.current = null;
    }

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
          if (playSeqRef.current === thisSeq) setPlayingId(id);
        };
        utterance.onend = () => {
          if (playSeqRef.current === thisSeq) setPlayingId(null);
        };
        utterance.onerror = () => {
          if (playSeqRef.current === thisSeq) setPlayingId(null);
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        if (playSeqRef.current === thisSeq) setPlayingId(null);
      }
    },
    []
  );

  const speak = useCallback(
    (text: string, id: string = text) => {
      // 1. Force stop and destroy any currently playing audio immediately
      stop();

      const cleanText = sanitizeSpeechText(text);
      if (!cleanText) return;

      const thisSeq = ++playSeqRef.current;
      setPlayingId(id);

      // Plan B: High-Fidelity Microsoft Edge-TTS Japanese Neural Audio API (/api/tts)
      const edgeTtsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=ja-JP-NanamiNeural`;
      const youdaoBackupUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=jap`;

      let hasStarted = false;

      const tryAudioStream = (url: string, onFail: () => void) => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        currentAudioRef.current = audio;

        audio.onplaying = () => {
          hasStarted = true;
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
          if (playSeqRef.current === thisSeq && !hasStarted) {
            onFail();
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (playSeqRef.current === thisSeq && !hasStarted) {
              onFail();
            }
          });
        }
      };

      // 1. Try Plan B Edge-TTS first
      tryAudioStream(edgeTtsUrl, () => {
        // 2. If Edge-TTS fails/offline, try backup Youdao stream
        tryAudioStream(youdaoBackupUrl, () => {
          // 3. If all network audio fails, notify user and fallback to local speech
          if (options?.onNetworkWarning) {
            options.onNetworkWarning('网络连接较慢，已切换至离线发音模式');
          }
          playLocalSpeechSynthesis(cleanText, id, thisSeq);
        });
      });

      // 1.5s network timeout protection
      timeoutTimerRef.current = setTimeout(() => {
        if (playSeqRef.current === thisSeq && !hasStarted) {
          if (options?.onNetworkWarning) {
            options.onNetworkWarning('网络响应缓慢，已切换至离线发音模式');
          }
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = '';
            currentAudioRef.current = null;
          }
          playLocalSpeechSynthesis(cleanText, id, thisSeq);
        }
      }, 1500);
    },
    [stop, playLocalSpeechSynthesis, options]
  );

  return { speak, stop, playingId };
}
