import { useEffect, useState, useRef } from 'react';
import { db, initializeDatabase, toUserKnowledgeState, UserStateEntity, SavedWordEntity } from './db/database';
import { Post, Token, UserKnowledgeState } from './types';
import { PostCard } from './components/feed/PostCard';
import { InteractiveCard } from './components/reader/InteractiveCard';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { BookmarksTab } from './components/bookmarks/BookmarksTab';
import { ProfileTab } from './components/profile/ProfileTab';
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showKanaChart, setShowKanaChart] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Daily Feed Pacing & Anti-Fatigue Milestone
  const [dailyPostLimit, setDailyPostLimit] = useState<number>(12);
  const [isReviewOnlyMode, setIsReviewOnlyMode] = useState<boolean>(false);

  const { speak, stop, playingId } = useSpeech();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  // Automatic Infinite Scroll
  useEffect(() => {
    if (!sentinelRef.current || activeTab !== 'feed') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && posts.length > 0) {
          setPosts((prev) => {
            const extra = prev.map((orig, idx) => ({
              ...orig,
              id: `post_inf_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
              createdAt: '刚刚',
              likesCount: orig.likesCount + Math.floor(Math.random() * 10),
            }));
            return [...prev, ...extra];
          });
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [activeTab, posts.length]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

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

    for (const token of post.tokens) {
      if (token.lemma && token.definitionZh) {
        const newEntity: SavedWordEntity = {
          id: `saved_${token.id}_${Date.now()}`,
          lemma: token.lemma,
          surface: token.surface,
          reading: token.reading,
          definitionZh: token.definitionZh,
          level: token.level,
          contextSentence: post.contentJa,
          addedAt: Date.now(),
        };
        await db.savedWords.put(newEntity);
      }
    }

    const updatedSaved = await db.savedWords.toArray();
    setSavedWords(updatedSaved);
    triggerToast('已将本帖词汇存入生词书签库');
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

      if (selectedToken) {
        const newEntity: SavedWordEntity = {
          id: `saved_${selectedToken.id}_${Date.now()}`,
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

  // Daily Feed Slice
  const activeFeedPosts = isReviewOnlyMode
    ? srsRankedPosts.filter((p) => p.tokens.some((t) => userState.explicitFocusWords.has(t.lemma) || userState.explicitKnownWords.has(t.lemma)))
    : srsRankedPosts.slice(0, dailyPostLimit);

  const hasReachedDailyLimit = !isReviewOnlyMode && srsRankedPosts.length >= dailyPostLimit;

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
                padding: '3px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              title="五十音图"
            >
              五十音
            </button>
            <button
              onClick={() => setShowAdmin(true)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              title="管理后台"
            >
              CMS
            </button>
            <button
              onClick={() => setShowOnboarding(true)}
              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--accent-secondary)', border: 'none', cursor: 'pointer' }}
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
              onSpeakText={(text) => speak(text, post.id)}
              onStopText={stop}
              isPlayingAudio={playingId === post.id}
              onBookmarkPost={handleBookmarkPost}
            />
          ))}

          {/* Daily Goal Completion Milestone Card (Anti-Fatigue & Closure) */}
          {hasReachedDailyLimit && (
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
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                今日推荐推文已完成
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.5' }}>
                适度刷帖更利于长期语感沉淀。你可以开启温故复习，或继续加刷。
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
                    setDailyPostLimit((prev) => prev + 5);
                    triggerToast('已为你加更 5 篇推文');
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
                  再来 5 篇推文
                </button>

                {!userState.userId && (
                  <button
                    onClick={() => setShowAuth(true)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--border-radius-full)',
                      border: '1px solid var(--accent-secondary)',
                      backgroundColor: 'transparent',
                      color: 'var(--accent-secondary)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    保存进度到云端
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Automatic Infinite Scroll Sentinel Element (only when in review mode or extra requested) */}
          {!hasReachedDailyLimit && (
            <div
              ref={sentinelRef}
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '11px',
              }}
            >
              加载中...
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
