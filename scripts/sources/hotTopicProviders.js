/**
 * Multi-source Hot Topic Data Providers
 * Provider 1 (Primary): Domestic Aggregator (SSPAI, Weibo, Zhihu, Bilibili)
 * Provider 2 (Fallback): Fallback Community Feeds & Guaranteed Seed Fallback
 */

export class RawTopicItem {
  constructor({ id, title, desc = '', source, category, url = '', hotScore = 0 }) {
    this.id = id;
    this.title = title;
    this.desc = desc;
    this.source = source;
    this.category = category;
    this.url = url;
    this.hotScore = hotScore;
  }
}

/** Provider 1: 国内聚合热榜 (主力) */
export const DailyHotProvider = {
  name: 'DailyHot',
  channelMap: {
    tech: 'sspai',          // 少数派
    lifestyle: 'wbHot',      // 微博
    coffee: 'zhihuHot',     // 知乎
    sports: 'douyinHot',    // 抖音/综合
    gaming: 'bili',         // B站
    food: 'wbHot',
  },

  async fetch(category = 'tech', limit = 3) {
    const channel = this.channelMap[category] || 'sspai';
    const endpoints = [
      // 节点 1: 韩小韩稳定公共接口
      `https://api.vvhan.com/api/hotlist/${channel}`,
      // 节点 2: DailyHot 备用节点
      `https://api.pearktrue.cn/api/dailyhot/?title=${channel}`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(3500),
        });
        if (!res.ok) continue;

        const json = await res.json();
        const list = json.data || json.result || [];
        if (list.length === 0) continue;

        return list.slice(0, limit).map((item, idx) => new RawTopicItem({
          id: `dh_${channel}_${idx}_${Date.now()}`,
          title: item.title || item.name || '',
          desc: item.desc || item.hot || item.mobil_url || '',
          source: `dailyhot_${channel}`,
          category,
          url: item.url || item.mobil_url || item.mobileUrl || '',
          hotScore: typeof item.hot === 'number' ? item.hot : 100 - idx,
        }));
      } catch (err) {
        // try next
      }
    }

    throw new Error(`DailyHot all endpoints failed for ${channel}`);
  },
};

/** Provider 2: 垂直圈子与种子兜底 */
export const CommunityFallbackProvider = {
  name: 'CommunityFallback',
  seedTopics: {
    tech: [
      { title: 'TypeScript 5.8 正式发布，类型推导与编译速度大幅提升', desc: '新版本带来更快的检查速度与更精准的联合类型收窄', url: 'https://devblogs.microsoft.com/typescript/' },
      { title: 'OpenAI 推出全新轻量级推理模型，代码能力再破纪录', desc: '新模型在数学和编程基准测试中展现出极高推理效率', url: 'https://openai.com/news/' },
    ],
    coffee: [
      { title: '2026 世界手冲咖啡大赛精选豆单公布，浅烘埃塞风味领跑', desc: '花香与柑橘酸质成为今年热门评选手冲风味走向', url: 'https://worldcoffeeevents.org/' },
      { title: '东京小众精品咖啡馆探索：手冲慢生活与浅草老街', desc: '浅草隅田川边新开自烘焙咖啡馆，成为咖啡迷新打卡地', url: 'https://tokyocoffee.org/' },
    ],
    lifestyle: [
      { title: '周末猫咪咖啡馆治愈日记：如何用一根猫条收获全场好感', desc: '可爱的三花猫和英短在阳光下打呼噜，治愈一周疲惫', url: 'https://weibo.com' },
      { title: '极简生活与早起晨间习惯：坚持 30 天后的身心变化', desc: '早起一杯温水与十分钟冥想，开启精力充沛的一天', url: 'https://zhihu.com' },
    ],
    sports: [
      { title: '欧冠焦点战补时绝杀！主场球迷沸腾见证逆转奇迹', desc: '下半场补时第 94 分钟打入制胜球，全队相拥狂欢', url: 'https://hupu.com' },
      { title: '夜跑 5 公里后的拉伸与心率恢复指南：科学运动不伤膝', desc: '跑后动态拉伸与筋膜放松，告别小腿肌肉酸痛', url: 'https://sports.qq.com' },
    ],
  },

  async fetch(category = 'tech', limit = 3) {
    const list = this.seedTopics[category] || this.seedTopics.tech;
    return list.slice(0, limit).map((item, idx) => new RawTopicItem({
      id: `fallback_${category}_${idx}_${Date.now()}`,
      title: item.title,
      desc: item.desc,
      source: `fallback_${category}`,
      category,
      url: item.url,
      hotScore: 90 - idx * 5,
    }));
  },
};
