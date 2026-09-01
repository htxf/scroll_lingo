import { DailyHotProvider, CommunityFallbackProvider } from './hotTopicProviders.js';

/**
 * 聚合与容灾调度器
 * 1. 优先抓取国内聚合热榜
 * 2. 失败时自动降级到垂直圈子备用源
 */
export async function getHotTopicsWithFallback(category = 'tech', limit = 3) {
  // 1. 主力源 (DailyHot)
  try {
    console.log(`[TopicAggregator] 正在从主力源 (DailyHot) 抓取 ${category} 热点...`);
    const topics = await DailyHotProvider.fetch(category, limit);
    if (topics && topics.length > 0) {
      console.log(`[TopicAggregator] ✓ 成功获取 ${topics.length} 条主力源热点`);
      return topics;
    }
  } catch (err) {
    console.warn(`[TopicAggregator] 主力源网络波动，自动无缝降级到备选源:`, err.message);
  }

  // 2. 降级备用源 (CommunityFallback)
  try {
    console.log(`[TopicAggregator] 正在从备用源抓取 ${category} 热点...`);
    const fallbackTopics = await CommunityFallbackProvider.fetch(category, limit);
    if (fallbackTopics && fallbackTopics.length > 0) {
      console.log(`[TopicAggregator] ✓ 成功获取 ${fallbackTopics.length} 条备用源热点`);
      return fallbackTopics;
    }
  } catch (err) {
    console.error(`[TopicAggregator] 全部热点源均失败:`, err.message);
  }

  return [];
}
