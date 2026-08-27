import { Comment, Token, UserKnowledgeState } from '../../types';
import { RubyTokenText } from '../reader/RubyTokenText';
import { useSpeech } from '../../hooks/useSpeech';

interface CommentSectionProps {
  comments: Comment[];
  userState: UserKnowledgeState;
  onTokenClick: (token: Token) => void;
  isStudyMode: boolean;
}

export function CommentSection({ comments, userState, onTokenClick, isStudyMode }: CommentSectionProps) {
  const { speak } = useSpeech();

  if (comments.length === 0) {
    return (
      <div style={{ padding: '10px', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>
        💬 暂无拟真评论，快来参与互动吧～
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '12px',
        borderRadius: 'var(--border-radius-md)',
        marginTop: '8px',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
        <span>热门拟真评论 ({comments.length})</span>
        <span style={{ color: 'var(--accent-secondary)' }}>{isStudyMode ? '📖 评论学习解构中' : '📱 评论纯享中'}</span>
      </div>

      {comments.map((comment) => (
        <div
          key={comment.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px',
          }}
        >
          {/* Commenter Header & Speaker Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={comment.persona.avatarUrl}
                alt={comment.persona.name}
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {comment.persona.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {comment.createdAt}
              </span>
            </div>

            {/* Comment Audio Playback Button */}
            <button
              onClick={() => speak(comment.contentJa)}
              style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer' }}
              title="朗读此条评论发音"
            >
              🔊
            </button>
          </div>

          {/* Comment Japanese Content (Pure or Interactive Ruby) */}
          <div style={{ fontSize: '14px', fontFamily: 'var(--font-japanese)', paddingLeft: '32px' }}>
            {isStudyMode && comment.tokens && comment.tokens.length > 0 ? (
              <RubyTokenText tokens={comment.tokens} userState={userState} onTokenClick={onTokenClick} />
            ) : (
              <span style={{ color: 'var(--text-primary)' }}>{comment.contentJa}</span>
            )}
          </div>

          {/* Comment Translation in Study Mode */}
          {isStudyMode && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '32px' }}>
              💬 {comment.contentZh}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
