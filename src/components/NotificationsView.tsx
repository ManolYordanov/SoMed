import React, { useState } from 'react';
import { 
  Bell, 
  UserPlus, 
  AtSign, 
  Heart, 
  MessageSquare, 
  CheckCheck, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  X 
} from 'lucide-react';
import { NotificationItem, User, VideoItem } from '../types';
import { requestPushPermission } from '../utils/storage';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  users: User[];
  videos: VideoItem[];
  currentUser: User;
  onMarkAllAsRead: () => void;
  onSelectUser: (user: User) => void;
  onSelectVideo: (video: VideoItem) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  users,
  videos,
  currentUser,
  onMarkAllAsRead,
  onSelectUser,
  onSelectVideo,
  onClose,
  isModal = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'mentions' | 'followers' | 'comments'>('all');
  const [pushStatus, setPushStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushStatus(granted ? 'granted' : 'denied');
  };

  const getUser = (id: string) => users.find((u) => u.id === id);
  const getVideo = (id: string | undefined) => (id ? videos.find((v) => v.id === id) : undefined);

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'mentions') return n.type === 'mention';
    if (filter === 'followers') return n.type === 'follow';
    if (filter === 'comments') return n.type === 'comment' || n.type === 'like';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-amber-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-300" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const content = (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full text-slate-100">
      
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-base sm:text-lg text-white">Notifications & Mentions</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Native Browser Push Notification Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Push Notifications</p>
              <p className="text-[11px] text-slate-400">
                {pushStatus === 'granted'
                  ? 'Browser push is active for new followers & mentions.'
                  : 'Turn on real-time alerts for mentions and new followers.'}
              </p>
            </div>
          </div>

          {pushStatus !== 'granted' ? (
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
            >
              Enable
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              Enabled
            </span>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('mentions')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              filter === 'mentions' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mentions
          </button>
          <button
            onClick={() => setFilter('followers')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              filter === 'followers' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => setFilter('comments')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              filter === 'comments' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Likes & Comments
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 no-scrollbar">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((item) => {
            const actor = getUser(item.actorId);
            const targetVideo = getVideo(item.videoId);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  item.isRead
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-slate-900 border-rose-500/30 text-white shadow-md'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <button onClick={() => actor && onSelectUser(actor)}>
                      <img
                        src={actor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                        alt={actor?.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-950 rounded-full border border-slate-800">
                      {getIcon(item.type)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white leading-relaxed">
                      <button
                        onClick={() => actor && onSelectUser(actor)}
                        className="font-bold hover:underline"
                      >
                        {actor?.displayName || 'Someone'}
                      </button>{' '}
                      <span className="text-slate-400">@{actor?.username}</span>{' '}
                      <span className="text-slate-200">{item.content}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formatTime(item.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Thumbnail or action button */}
                {targetVideo ? (
                  <button
                    onClick={() => onSelectVideo(targetVideo)}
                    className="w-10 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0 relative group"
                    title="Watch video"
                  >
                    <img
                      src={targetVideo.posterUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=100&auto=format&fit=crop&q=80'}
                      alt="Reel preview"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ) : actor ? (
                  <button
                    onClick={() => onSelectUser(actor)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 hover:text-white shrink-0 transition-colors"
                  >
                    View
                  </button>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No notifications here</p>
            <p className="text-xs text-slate-500 mt-1">
              When people mention you, follow you, or interact with your videos, you will see it here.
            </p>
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
          className="relative z-10 w-full sm:max-w-xl h-[85vh] bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
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
