import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Heart, AtSign, Smile } from 'lucide-react';
import { CommentItem, User, VideoItem } from '../types';

interface CommentsDrawerProps {
  video: VideoItem | undefined;
  comments: CommentItem[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onAddComment: (videoId: string, text: string) => void;
  onLikeComment: (commentId: string) => void;
  onSelectUser: (user: User) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  video,
  comments,
  users,
  currentUser,
  onClose,
  onAddComment,
  onLikeComment,
  onSelectUser,
}) => {
  const [inputText, setInputText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  if (!video) return null;

  const videoComments = comments.filter((c) => c.videoId === video.id);

  // Check for @mention trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    const lastWord = val.split(' ').pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (username: string) => {
    const words = inputText.split(' ');
    words.pop(); // remove incomplete mention
    words.push(`@${username} `);
    setInputText(words.join(' '));
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddComment(video.id, inputText.trim());
    setInputText('');
    setMentionQuery(null);
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Matched users for autocomplete
  const matchedUsers = mentionQuery
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(mentionQuery) ||
          u.displayName.toLowerCase().includes(mentionQuery)
      )
    : [];

  const getUser = (id: string) => users.find((u) => u.id === id);

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Surface */}
      <div 
        className="relative z-10 w-full sm:max-w-md h-[75vh] sm:h-[600px] bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar on mobile */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">
              Comments <span className="text-slate-400 font-normal text-xs tabular-nums">({videoComments.length})</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {videoComments.length > 0 ? (
            videoComments.map((comment) => {
              const author = getUser(comment.userId);
              return (
                <div key={comment.id} className="flex items-start gap-3 text-left group">
                  <button
                    onClick={() => author && onSelectUser(author)}
                    className="shrink-0"
                  >
                    <img
                      src={author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                      alt={author?.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <button
                        onClick={() => author && onSelectUser(author)}
                        className="text-xs font-semibold text-white hover:underline truncate"
                      >
                        @{author?.username || 'user'}
                      </button>
                      <span className="text-[10px] text-slate-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed break-words">
                      {comment.text.split(' ').map((word, i) => {
                        if (word.startsWith('@')) {
                          return (
                            <span key={i} className="text-sky-400 font-semibold mr-1">
                              {word}
                            </span>
                          );
                        }
                        return word + ' ';
                      })}
                    </p>
                  </div>

                  {/* Like comment button */}
                  <button
                    onClick={() => onLikeComment(comment.id)}
                    className="flex flex-col items-center gap-0.5 pt-1 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        comment.isLiked ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span className="text-[10px] tabular-nums">
                      {comment.likesCount}
                    </span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <p className="text-sm font-medium text-slate-300 mb-1">No comments yet</p>
              <p className="text-xs text-slate-500">Be the first to share your thoughts!</p>
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Mention suggestions popup */}
        {matchedUsers.length > 0 && (
          <div className="p-2 border-t border-slate-800 bg-slate-950 max-h-32 overflow-y-auto space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 px-2 pb-1">Mention a user</p>
            {matchedUsers.slice(0, 4).map((u) => (
              <button
                key={u.id}
                onClick={() => insertMention(u.username)}
                className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-left text-xs text-white transition-colors"
              >
                <img
                  src={u.avatar}
                  alt={u.displayName}
                  className="w-6 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium text-white truncate">{u.displayName}</span>
                <span className="text-slate-400 text-[11px]">@{u.username}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-8 h-8 rounded-full object-cover shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Add comment... (use @ to mention)"
              className="w-full py-2 pl-3 pr-10 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                setInputText((prev) => prev + '@');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              title="Add @mention"
            >
              <AtSign className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-full bg-rose-500 text-white disabled:opacity-40 disabled:hover:bg-rose-500 hover:bg-rose-600 transition-colors shrink-0"
            aria-label="Send comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
