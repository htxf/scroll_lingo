import { useEffect, useState, useCallback } from 'react';
import { db, initializeDatabase, toUserKnowledgeState, UserStateEntity, SavedWordEntity } from './db/database';
import { Post, Token, Persona, UserKnowledgeState } from './types';
import { PostCard } from './components/feed/PostCard';
import { InteractiveCard } from './components/reader/InteractiveCard';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { BookmarksTab } from './components/bookmarks/BookmarksTab';
import { ProfileTab } from './components/profile/ProfileTab';
import { PersonaProfileModal } from './components/profile/PersonaProfileModal';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { OfflineBadge } from './components/common/OfflineBadge';
import { AdminWorkbench } from './components/admin/AdminWorkbench';
import { AuthModal } from './components/auth/AuthModal';
import { KanaChartModal } from './components/kana/KanaChartModal';
import { evaluateImplicitProgress } from './utils/implicitAlgorithm';
import { rankPostsForInFeedSRS } from './utils/srsEngine';
import { mergeUserKnowledgeStates } from './utils/syncMerger';
import { useSpeech } from './hooks/useSpeech';
import './styles/global.css';

export function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedWords, setSavedWords] = useState<SavedWordEntity[]>([]);
  const [userState, setUserState] = useState<UserKnowledgeState | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showKanaChart, setShowKanaChart] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [isReviewOnlyMode, setIsReviewOnlyMode] = useState<boolean>(false);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const { speakPost, stop, playingId } = useSpeech();

  useEffect(() => {
    async function loadApp() {
      try {
        await initializeDatabase();
        const allPosts = await db.posts.toArray();
        const allSaved = await db.savedWords.toArray();
        const stateEntity = await db.userState.get('current_user');
        
        setPosts(allPosts);
        setSavedWords(allSaved);

        if (stateEntity) {
          const domainState = toUserKnowledgeState(stateEntity);
          setUserState(domainState);
          // Only show onboarding if user has NEVER completed onboarding before
          if (!stateEntity.hasCompletedOnboarding) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    loadApp();
  }, []);

  const handleOnboardingComplete = async (
    categories: string[],
    baselineLevel: 'N0' | 'N5' | 'N4' | 'N3'
  ) => {
    if (!userState) return;

    const updatedState: UserKnowledgeState = {
      ...userState,
      interestCategories: categories,
      baselineLevel: baselineLevel,
      hasCompletedOnboarding: true,
    };

    setUserState(updatedState);
    setShowOnboarding(false);

    const entityUpdate: UserStateEntity = {
      id: 'current_user',
      deviceUuid: updatedState.deviceUuid,
      baselineLevel: updatedState.baselineLevel,
      explicitKnownWords: Array.from(updatedState.explicitKnownWords),
      explicitFocusWords: Array.from(updatedState.explicitFocusWords),
      interestCategories: updatedState.interestCategories,
      totalPostsRead: updatedState.totalPostsRead,
      totalWordsMastered: updatedState.totalWordsMastered,
      lastActiveTimestamp: Date.now(),
      hasCompletedOnboarding: true,
    };
    await db.userState.put(entityUpdate);
    triggerToast(`已设定基线为 ${baselineLevel === 'N0' ? 'N0 萌芽' : `JLPT ${baselineLevel}`}`);
  };

  const handleAdminAddPost = async (newPost: Post) => {
    await db.posts.put(newPost);
    const updatedPosts = await db.posts.toArray();
    setPosts(updatedPosts);
  };

  const handleBookmarkPost = async (post: Post) => {
    if (!userState) return;

    let addedCount = 0;
    for (const token of post.tokens) {
      if (token.lemma && token.definitionZh && token.pos !== '标点') {
        const stableId = `saved_${token.lemma}`;
        const newEntity: SavedWordEntity = {
          id: stableId,
          lemma: token.lemma,
          surface: token.surface,
          reading: token.reading,
          definitionZh: token.definitionZh,
          level: token.level,
          contextSentence: post.contentJa,
          addedAt: Date.now(),
        };
        await db.savedWords.put(newEntity);
        addedCount++;
      }
    }

    const updatedSaved = await db.savedWords.toArray();
    setSavedWords(updatedSaved);
    triggerToast(addedCount > 0 ? `已将本帖 ${addedCount} 个词汇存入生词本` : '已更新生词本');
  };

  const handleLoginSuccess = async (userEmail: string) => {
    if (!userState) return;

    const cloudState: UserKnowledgeState = {
      userId: userEmail,
      deviceUuid: 'cloud-device',
      baselineLevel: 'N0',
      explicitKnownWords: new Set(['あ', 'ねこ']),
      explicitFocusWords: new Set(['おいしい']),
      interestCategories: ['lifestyle'],
      totalPostsRead: 15,
      totalWordsMastered: 2,
      lastActiveTimestamp: Date.now(),
      hasCompletedOnboarding: true,
    };

    const mergedState = mergeUserKnowledgeStates(userState, cloudState);
    setUserState(mergedState);
    setShowAuth(false);

    const entityUpdate: UserStateEntity = {
      id: 'current_user',
      deviceUuid: mergedState.deviceUuid,
      baselineLevel: mergedState.baselineLevel,
      explicitKnownWords: Array.from(mergedState.explicitKnownWords),
      explicitFocusWords: Array.from(mergedState.explicitFocusWords),
      interestCategories: mergedState.interestCategories,
      totalPostsRead: mergedState.totalPostsRead,
      totalWordsMastered: mergedState.totalWordsMastered,
      lastActiveTimestamp: Date.now(),
      hasCompletedOnboarding: true,
    };
    await db.userState.put(entityUpdate);
    triggerToast(`云端同步成功，已合并 ${mergedState.explicitKnownWords.size} 个词汇`);
  };

  const handleToggleKnown = async (lemma: string) => {
    if (!userState) return;

    const newKnown = new Set(userState.explicitKnownWords);
    const newFocus = new Set(userState.explicitFocusWords);

    let isMarkedNow = false;
    if (newKnown.has(lemma)) {
      newKnown.delete(lemma);
    } else {
      newKnown.add(lemma);
      newFocus.delete(lemma);
      isMarkedNow = true;
    }

    const updatedState: UserKnowledgeState = {
      ...userState,
      explicitKnownWords: newKnown,
      explicitFocusWords: newFocus,
      totalWordsMastered: newKnown.size,
    };

    const evaluatedLevel = evaluateImplicitProgress(
      {
        postId: 'active',
        dwellTimeMs: 5000,
        lookupsCount: 0,
        knownMarkedCount: isMarkedNow ? 3 : 0,
      },
      updatedState
    );

    if (evaluatedLevel !== updatedState.baselineLevel) {
      updatedState.baselineLevel = evaluatedLevel;
      triggerToast(`隐性调整至 ${evaluatedLevel === 'N0' ? 'N0 萌芽' : `JLPT ${evaluatedLevel}`}`);
    }

    setUserState(updatedState);

    const entityUpdate: UserStateEntity = {
      id: 'current_user',
      deviceUuid: updatedState.deviceUuid,
      baselineLevel: updatedState.baselineLevel,
      explicitKnownWords: Array.from(newKnown),
      explicitFocusWords: Array.from(newFocus),
      interestCategories: updatedState.interestCategories,
      totalPostsRead: updatedState.totalPostsRead,
      totalWordsMastered: updatedState.totalWordsMastered,
      lastActiveTimestamp: Date.now(),
      hasCompletedOnboarding: true,
    };
    await db.userState.put(entityUpdate);
  };

  const handleToggleFocus = async (lemma: string) => {
    if (!userState) return;

    const newKnown = new Set(userState.explicitKnownWords);
    const newFocus = new Set(userState.explicitFocusWords);

    if (newFocus.has(lemma)) {
      newFocus.delete(lemma);
    } else {
      newFocus.add(lemma);
      newKnown.delete(lemma);

      if (selectedToken && selectedToken.pos !== '标点') {
        const stableId = `saved_${selectedToken.lemma}`;
        const newEntity: SavedWordEntity = {
          id: stableId,
          lemma: selectedToken.lemma,
          surface: selectedToken.surface,
          reading: selectedToken.reading,
          definitionZh: selectedToken.definitionZh,
          level: selectedToken.level,
          contextSentence: selectedToken.surface,
          addedAt: Date.now(),
        };
        await db.savedWords.put(newEntity);
        const updatedSaved = await db.savedWords.toArray();
        setSavedWords(updatedSaved);
      }
    }

    const updatedState: UserKnowledgeState = {
      ...userState,
      explicitKnownWords: newKnown,
      explicitFocusWords: newFocus,
    };

    setUserState(updatedState);

    const entityUpdate: UserStateEntity = {
      id: 'current_user',
      deviceUuid: updatedState.deviceUuid,
      baselineLevel: updatedState.baselineLevel,
      explicitKnownWords: Array.from(newKnown),
      explicitFocusWords: Array.from(newFocus),
      interestCategories: updatedState.interestCategories,
      totalPostsRead: updatedState.totalPostsRead,
      totalWordsMastered: updatedState.totalWordsMastered,
      lastActiveTimestamp: Date.now(),
      hasCompletedOnboarding: true,
    };
    await db.userState.put(entityUpdate);
  };

  const handleRemoveSavedWord = async (id: string) => {
    await db.savedWords.delete(id);
    const updated = await db.savedWords.toArray();
    setSavedWords(updated);
  };

  if (isInitializing || !userState) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>加载中...</p>
      </div>
    );
  }

  const n0FilteredPosts = posts.filter((post) => {
    if (userState.baselineLevel === 'N0') {
      return post.level === 'N0';
    }
    return true;
  });

  const basePosts = n0FilteredPosts.length > 0 ? n0FilteredPosts : posts;
  const srsRankedPosts = rankPostsForInFeedSRS(basePosts, userState, savedWords);

  // Active Feed Posts
  const activeFeedPosts = isReviewOnlyMode
    ? srsRankedPosts.filter((p) => p.tokens.some((t) => userState.explicitFocusWords.has(t.lemma) || userState.explicitKnownWords.has(t.lemma)))
    : srsRankedPosts;

  // State checks: Finished viewing all available hot topics
  const isEntireDatabaseExhausted = !isReviewOnlyMode && activeFeedPosts.length > 0;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
      {/* Toast Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-full)',
            fontSize: '12px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-md)',
            zIndex: 3000,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            scroll_lingo
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowKanaChart(true)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              title="五十音图"
            >
              五十音
            </button>
            <button
              onClick={() => setShowOnboarding(true)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-full)',
                background: 'rgba(29, 155, 240, 0.15)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {userState.baselineLevel === 'N0' ? 'N0 萌芽' : `JLPT ${userState.baselineLevel}`}
            </button>
          </div>
        </div>

        {/* Offline Badge */}
        <OfflineBadge />
      </header>

      {/* Tab Contents */}
      {activeTab === 'feed' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeFeedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userState={userState}
              onTokenClick={(token) => setSelectedToken(token)}
              onSpeakPost={speakPost}
              onStopText={stop}
              isPlayingAudio={playingId === post.id}
              onBookmarkPost={handleBookmarkPost}
              selectedTokenId={selectedToken?.id}
              onPersonaClick={(p) => setSelectedPersona(p)}
            />
          ))}

          {/* Clean Bottom Milestone (All live topics loaded) */}
          {isEntireDatabaseExhausted && (
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '24px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginTop: '8px',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                🎉 你已刷完全部推文！
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.5' }}>
                当前阶段语料库已全部浏览完毕。你可以开启生词温故复习，或重置推文流重新刷一轮！
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
                <button
                  onClick={() => {
                    setIsReviewOnlyMode(true);
                    triggerToast('已切换至温故复习模式');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--border-radius-full)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  开启温故复习
                </button>

                <button
                  onClick={() => {
                    setIsReviewOnlyMode(false);
                    triggerToast('已重置推文流，重新开始');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--border-radius-full)',
                    border: 'none',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  重新打乱刷一轮
                </button>
              </div>
            </div>
          )}

          {/* Case 3: Review Only Mode Empty State */}
          {isReviewOnlyMode && activeFeedPosts.length === 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '24px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                暂无待复习生词
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.5' }}>
                在推文或词卡中收藏生词后，温故复习模式会自动精选相关推文。
              </p>
              <button
                onClick={() => setIsReviewOnlyMode(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--border-radius-full)',
                  border: 'none',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                返回全部推文流
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === 'bookmarks' && (
        <BookmarksTab
          savedWords={savedWords}
          onRemoveWord={handleRemoveSavedWord}
          onMarkKnown={handleToggleKnown}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileTab
          userState={userState}
          onOpenOnboarding={() => setShowOnboarding(true)}
          onOpenAuth={() => setShowAuth(true)}
        />
      )}

      {/* 0ms Interactive Card Drawer */}
      <InteractiveCard
        token={selectedToken}
        userState={userState}
        onClose={() => setSelectedToken(null)}
        onToggleKnown={handleToggleKnown}
        onToggleFocus={handleToggleFocus}
      />

      {/* Persona Profile Modal */}
      <PersonaProfileModal
        persona={selectedPersona}
        onClose={() => setSelectedPersona(null)}
      />

      {/* Fifty-Sounds Kana Chart Modal */}
      <KanaChartModal
        isOpen={showKanaChart}
        onClose={() => setShowKanaChart(false)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        initialCategories={userState.interestCategories}
        initialLevel={userState.baselineLevel}
      />

      {/* Admin CMS Workbench Modal */}
      <AdminWorkbench
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        onAddPost={handleAdminAddPost}
      />

      {/* Auth & Sync Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLoginSuccess={handleLoginSuccess}
        userState={userState}
      />

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        savedCount={savedWords.length}
      />
    </div>
  );
}

export default App;
