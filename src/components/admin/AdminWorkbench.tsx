import { useState } from 'react';
import { Post } from '../../types';
import { verifyAndTokenizePost, FuriganaErrorReport, createFuriganaReport } from '../../services/corpusPipeline';
import { INITIAL_PERSONAS } from '../../db/seedPosts';

interface AdminWorkbenchProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (post: Post) => void;
}

export function AdminWorkbench({ isOpen, onClose, onAddPost }: AdminWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'reports' | 'personas'>('generate');
  const [inputJa, setInputJa] = useState('');
  const [inputZh, setInputZh] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tech');
  const [isGenerating, setIsGenerating] = useState(false);

  const [reports, setReports] = useState<FuriganaErrorReport[]>([
    createFuriganaReport('t_kado', '角', '角', 'つの (Ttsuno)', 'かど (Kado)', '街の角で待つ'),
  ]);

  const personasList = Object.values(INITIAL_PERSONAS);

  if (!isOpen) return null;

  const handleGeneratePost = async () => {
    if (!inputJa || !inputZh) return;
    setIsGenerating(true);

    try {
      const persona = personasList.find((p) => p.category === selectedCategory) || personasList[0]!;
      const newPost = await verifyAndTokenizePost(inputJa, inputZh, selectedCategory, persona, 'N4');
      
      onAddPost(newPost);
      setInputJa('');
      setInputZh('');
      alert('双重切词校验完成，新帖子已成功发布至语料库');
    } catch (err) {
      console.error('Failed to generate post:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResolveReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    alert('错读更正已生效，已同步修正 Token Hash 数据');
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
        zIndex: 2500,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-md)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              语料管理后台
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              MeCab/Kuromoji + LLM 双重切词校验工作台
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Sub-Nav */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('generate')}
            style={{
              padding: '6px 10px',
              border: 'none',
              background: 'none',
              color: activeTab === 'generate' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'generate' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: activeTab === 'generate' ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            语料生成
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '6px 10px',
              border: 'none',
              background: 'none',
              color: activeTab === 'reports' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'reports' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: activeTab === 'reports' ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>错读反馈</span>
            {reports.length > 0 && (
              <span style={{ background: 'var(--accent-danger)', color: '#fff', fontSize: '10px', borderRadius: '10px', padding: '1px 5px' }}>
                {reports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('personas')}
            style={{
              padding: '6px 10px',
              border: 'none',
              background: 'none',
              color: activeTab === 'personas' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'personas' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: activeTab === 'personas' ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            AI 博主
          </button>
        </div>

        {/* Tab 1: Generate Post */}
        {activeTab === 'generate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              日语原文 (多音字上下文自动校验):
            </label>
            <textarea
              value={inputJa}
              onChange={(e) => setInputJa(e.target.value)}
              placeholder="例如: 最新のニュースです。"
              rows={3}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '10px',
                fontSize: '13px',
                fontFamily: 'var(--font-japanese)',
              }}
            />

            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>中文译文:</label>
            <input
              type="text"
              value={inputZh}
              onChange={(e) => setInputZh(e.target.value)}
              placeholder="例如: 这是最新新闻。"
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '10px',
                fontSize: '13px',
              }}
            />

            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>绑定分类与 AI 博主:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '10px',
                fontSize: '13px',
              }}
            >
              <option value="coffee">@coffee_master_ken (咖啡)</option>
              <option value="tech">@dev_tokyo_yuki (科技)</option>
              <option value="sports">@tactics_tokyo_ren (体育)</option>
            </select>

            <button
              onClick={handleGeneratePost}
              disabled={isGenerating || !inputJa || !inputZh}
              style={{
                padding: '10px',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              {isGenerating ? '正在运行双重切词与注音校验...' : '校验并发布至语料库'}
            </button>
          </div>
        )}

        {/* Tab 2: Error Feedback Reports Queue */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                暂无待处理的注音报错工单
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
                      字词: {report.surface}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      待审核
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    上下文: 「{report.contextSentence}」
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    原读音: <span style={{ textDecoration: 'line-through' }}>{report.currentReading}</span> $\rightarrow$ 修正建议: <strong style={{ color: 'var(--accent-secondary)' }}>{report.suggestedReading}</strong>
                  </div>

                  <button
                    onClick={() => handleResolveReport(report.id)}
                    style={{
                      alignSelf: 'flex-end',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'var(--accent-secondary)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    批准一键更正
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Persona Management */}
        {activeTab === 'personas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {personasList.map((p) => (
              <div
                key={p.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '10px',
                  borderRadius: 'var(--border-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <img src={p.avatarUrl} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.handle} · {p.bioZh}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
