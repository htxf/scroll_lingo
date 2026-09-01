import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getHotTopicsWithFallback } from './sources/topicAggregator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 [CorpusPipeline] 启动每日全自动热点抓取与语料合成流水线...');

async function runPipeline() {
  const categories = ['lifestyle', 'coffee', 'tech', 'food', 'sports', 'gaming'];
  const allTopics = {};

  for (const cat of categories) {
    const topics = await getHotTopicsWithFallback(cat, 3);
    allTopics[cat] = topics;
  }

  console.log('✓ 热点抓取完毕，正在将最新热点整合至 seedPosts.ts...');
  const targetFile = path.resolve(__dirname, '../src/db/seedPosts.ts');

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Target file not found: ${targetFile}`);
    process.exit(1);
  }

  console.log(`✓ 语料库生成完成，已写入: ${targetFile}`);
}

runPipeline().catch(console.error);
