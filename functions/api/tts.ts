// Cloudflare Pages Function: /api/tts
// Implements Plan B: Microsoft Edge-TTS Japanese Neural Speech Synthesis

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const text = url.searchParams.get('text')?.trim();
  const voice = url.searchParams.get('voice') || 'ja-JP-NanamiNeural';

  if (!text) {
    return new Response(JSON.stringify({ error: 'Text parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Sanitize text
  const cleanText = text
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[✨🎉💪🔥⚽️☕️🍣]/g, '')
    .trim();

  if (!cleanText) {
    return new Response(JSON.stringify({ error: 'Empty speech text after sanitization' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const audioBuffer = await synthesizeEdgeTts(cleanText, voice);
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'TTS synthesis failed';
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

/**
 * Connect to Microsoft Edge TTS WebSocket and synthesize audio stream
 */
async function synthesizeEdgeTts(text: string, voice: string): Promise<ArrayBuffer> {
  const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  const connectionId = crypto.randomUUID().replace(/-/g, '');
  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connectionId}`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const audioChunks: Uint8Array[] = [];
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Edge-TTS synthesis timed out'));
    }, 6000);

    ws.addEventListener('open', () => {
      const timestamp = new Date().toISOString();
      
      // 1. Send speech config
      const configMsg =
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
              },
            },
          },
        });
      ws.send(configMsg);

      // 2. Send SSML text
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ja-JP'>` +
        `<voice name='${voice}'><prosody pitch='+0Hz' rate='+0%'>${escapeXml(text)}</prosody></voice>` +
        `</speak>`;

      const ssmlMsg =
        `X-RequestId:${connectionId}\r\n` +
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;
      ws.send(ssmlMsg);
    });

    ws.addEventListener('message', async (event) => {
      if (typeof event.data === 'string') {
        if (event.data.includes('Path:turn.end')) {
          clearTimeout(timeout);
          ws.close();
          const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const merged = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of audioChunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          resolve(merged.buffer);
        }
      } else if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
        let buffer: ArrayBuffer;
        if (event.data instanceof Blob) {
          buffer = await event.data.arrayBuffer();
        } else {
          buffer = event.data;
        }

        const dataView = new DataView(buffer);
        if (buffer.byteLength >= 2) {
          const headerLength = dataView.getInt16(0);
          if (buffer.byteLength > headerLength + 2) {
            const audioData = new Uint8Array(buffer, headerLength + 2);
            audioChunks.push(audioData);
          }
        }
      }
    });

    ws.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error('WebSocket connection to Edge-TTS failed'));
    });

    ws.addEventListener('close', () => {
      clearTimeout(timeout);
      if (audioChunks.length > 0) {
        const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const merged = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of audioChunks) {
          merged.set(chunk, offset);
          offset += chunk.length;
        }
        resolve(merged.buffer);
      }
    });
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
