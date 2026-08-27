import { useState } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (selectedCategories: string[], baselineLevel: 'N0' | 'N5' | 'N4' | 'N3') => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['lifestyle', 'coffee', 'tech']);
  const [selectedLevel, setSelectedLevel] = useState<'N0' | 'N5' | 'N4' | 'N3'>('N0');

  if (!isOpen) return null;

  const categories = [
    { id: 'lifestyle', icon: '🌿', label: '日式日常', desc: '生活美学、生活记录' },
    { id: 'coffee', icon: '☕', label: '咖啡手冲', desc: '咖啡烘焙、手冲技巧' },
    { id: 'tech', icon: '💻', label: '科技编程', desc: '全栈开发、AI 探索' },
    { id: 'sports', icon: '⚽', label: '体育战术', desc: 'J 联赛、球员动态' },
    { id: 'gaming', icon: '🎮', label: '游戏文化', desc: '主机游戏、评测' },
    { id: 'food', icon: '🍣', label: '日料美食', desc: '居酒屋与拉面巡礼' },
  ];

  const levels: { level: 'N0' | 'N5' | 'N4' | 'N3'; title: string; sampleText: string; desc: string }[] = [
    {
      level: 'N0',
      title: 'N0 萌芽级',
      sampleText: 'あ！ねこ！可愛い！',
      desc: '未学过日语，从假名发音与短文开始，听音记字。',
    },
    {
      level: 'N5',
      title: 'N5 入门级',
      sampleText: '朝の珈琲は最高です。',
      desc: '懂基础假名，希望全量注音辅助阅读。',
    },
    {
      level: 'N4',
      title: 'N4 进阶级',
      sampleText: '浅煎りの豆を丁寧にドリップしました。',
      desc: '掌握基础语法，在社交动态中自然积累短句。',
    },
    {
      level: 'N3',
      title: 'N3 畅读级',
      sampleText: '型安全性がさらに向上しました。',
      desc: '大致顺畅看懂生字帖，仅对难词提供注音。',
    },
  ];

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories((prev) => prev.filter((item) => item !== id));
      }
    } else {
      if (selectedCategories.length < 3) {
        setSelectedCategories((prev) => [...prev, id]);
      }
    }
  };

  const handleFinish = () => {
    onComplete(selectedCategories, selectedLevel);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'var(--glass-blur)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            scroll_lingo
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {step} / 2
          </span>
        </div>

        {step === 1 ? (
          <>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '6px' }}>
                选择感兴趣的话题
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                为你定制专属推文 (最多选 3 项)
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--border-radius-md)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{cat.label}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cat.desc}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedCategories.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              下一步：难度设置
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '6px' }}>
                选择感官基线
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                后续算法将根据你的阅读表现静默微调。
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
              {levels.map((lvl) => {
                const isSelected = selectedLevel === lvl.level;
                return (
                  <div
                    key={lvl.level}
                    onClick={() => setSelectedLevel(lvl.level)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--border-radius-md)',
                      border: isSelected ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: isSelected ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
                        {lvl.title}
                      </span>
                      {isSelected && <span style={{ color: 'var(--accent-secondary)' }}>✓</span>}
                    </div>

                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-japanese)', color: 'var(--accent-primary)' }}>
                      「{lvl.sampleText}」
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {lvl.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                上一步
              </button>

              <button
                onClick={handleFinish}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'var(--accent-secondary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                进入应用
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
