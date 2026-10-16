import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Check, 
  MessageSquare, 
  Users, 
  Sparkles, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { User } from '../types';

interface DiscoverModalProps {
  users: User[];
  currentUser: User;
  onFollowToggle: (userId: string) => void;
  onStartChat: (user: User) => void;
  onSelectUser: (user: User) => void;
  initialSearch?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const DiscoverModal: React.FC<DiscoverModalProps> = ({
  users,
  currentUser,
  onFollowToggle,
  onStartChat,
  onSelectUser,
  initialSearch = '',
  onClose,
  isModal = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().replace('@', '');
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    );
  });

  const content = (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full text-slate-100">
      
      {/* Header & Search Bar */}
      <div className="p-4 sm:p-6 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-base sm:text-lg text-white">
              Discover & Add People
            </h2>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Search creators by <span className="text-sky-400 font-medium">@username</span> or name to add them to your friends network and unlock direct messaging.
        </p>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by @username (e.g. maya_chen, leo_skate)..."
            className="w-full py-2.5 pl-10 pr-10 rounded-2xl bg-slate-900 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
            autoFocus={isModal}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* User Directory List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 space-y-3 no-scrollbar">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isFollowing = currentUser.following.includes(user.id);
            const isFriend = currentUser.friends.includes(user.id);

            return (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => onSelectUser(user)}
                    className="relative shrink-0"
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-rose-500/50 transition-colors"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => onSelectUser(user)}
                        className="font-bold text-sm text-white hover:underline truncate"
                      >
                        {user.displayName}
                      </button>
                      <span className="text-xs text-sky-400 font-medium">
                        @{user.username}
                      </span>
                      {user.isVerified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                      {user.bio}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                      <span>
                        <strong className="text-white tabular-nums">{user.followers.length}</strong> followers
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-white tabular-nums">{user.likedVideos.length}</strong> likes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Chat button (enabled once added/following) */}
                  <button
                    onClick={() => onStartChat(user)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title={`Message @${user.username}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Chat</span>
                  </button>

                  {/* Add / Follow button */}
                  <button
                    onClick={() => onFollowToggle(user.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isFollowing
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No users found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Check the spelling or try searching another @username.</p>
          </div>
        )}
      </div>

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="absolute inset-0" onClick={onClose} />
        <div 
          className="relative z-10 w-full sm:max-w-2xl h-[85vh] bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-black pb-16 md:pb-0">
      {content}
    </div>
  );
};
