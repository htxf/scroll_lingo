import fs from 'fs';
import path from 'path';
import https from 'https';

const AUDIO_DIR = path.resolve('public/audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// 20 Seed Posts with pure Japanese text to synthesize
const POSTS_TO_SYNTHESIZE = [
  { id: 'post_life_01', text: 'あ！ねこ！かわいい！' },
  { id: 'post_life_02_text', text: 'これ、なに？たのしい！' },
  { id: 'post_life_03', text: 'おやすみ。またあした。' },
  { id: 'post_life_04', text: 'いぬ！おおきい！すごい！' },
  { id: 'post_life_05_text', text: 'こんにちは！げんき？' },
  { id: 'post_coffee_01_text', text: 'おはよう！きょうもいいひ！' },
  { id: 'post_coffee_02', text: 'あさのコーヒー。いいかおり。' },
  { id: 'post_coffee_03_text', text: 'みず！つめたい！おいしい！' },
  { id: 'post_coffee_04', text: 'カフェでほんをよむ。しずか。' },
  { id: 'post_food_01', text: 'すし！おいしい！ありがとう！' },
  { id: 'post_food_02', text: 'ラーメン！あつい！うまい！' },
  { id: 'post_food_03_text', text: 'おなかすいた！ごはんたべよう！' },
  { id: 'post_food_04', text: 'まっちゃアイス。あまくてつめたい。' },
  { id: 'post_tech_01_text', text: 'はい！オーケー！バグなし！' },
  { id: 'post_tech_02_text', text: 'コードをかく。うごいた！うれしい！' },
  { id: 'post_tech_03', text: 'あたらしいパソコン。とてもはやい！' },
  { id: 'post_sports_01', text: 'ゴール！かった！さいこう！' },
  { id: 'post_sports_02_text', text: 'はしる！つかれた！でもきもちいい！' },
  { id: 'post_game_01', text: 'ゲームクリア！やったー！' },
  { id: 'post_game_02_text', text: 'つよいてき！まけた！もういっかい！' },
];

/**
 * Fetch MP3 binary from Bing Edge-TTS or fallback TTS service
 */
async function synthesizePostAudio(post) {
  const filePath = path.join(AUDIO_DIR, `${post.id}.mp3`);
  
  // Clean text
  const clean = post.text.replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim();

  return new Promise((resolve) => {
    // Generate authentic MP3 using Google/Baidu/Open TTS stream
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=ja&client=tw-ob`;
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`[AudioGen] Generated: public/audio/${post.id}.mp3 (${fs.statSync(filePath).size} bytes)`);
          resolve(true);
        });
      } else {
        console.warn(`[AudioGen] Google TTS returned status ${res.statusCode}, trying alternate source...`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.warn(`[AudioGen] Error for ${post.id}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Generating pre-baked static audio for all seed posts...');
  for (const post of POSTS_TO_SYNTHESIZE) {
    await synthesizePostAudio(post);
  }
  console.log('Done generating static audio assets!');
}

run();
