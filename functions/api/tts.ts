// Reserved for future dedicated TTS microservice
export async function onRequestGet(): Promise<Response> {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
