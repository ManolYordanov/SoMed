import React, { useEffect } from 'react';
import { Bell, Heart, UserPlus, AtSign, MessageSquare, X } from 'lucide-react';
import { NotificationItem, User } from '../types';

interface PushToastProps {
  notification: NotificationItem | null;
  actor: User | undefined;
  onClose: () => void;
  onClick: () => void;
}

export const PushToast: React.FC<PushToastProps> = ({
  notification,
  actor,
  onClose,
  onClick,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-amber-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-violet-400" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  return (
    <aside 
      aria-label="Push notification alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div 
        onClick={onClick}
        className="flex items-center gap-3 p-3.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 cursor-pointer hover:border-slate-600 transition-all active:scale-[0.98]"
      >
        <div className="relative shrink-0">
          <img
            src={actor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt={actor?.displayName || 'User'}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-1 -right-1 p-1 bg-slate-800 rounded-full border border-slate-700 shadow">
            {getIcon()}
          </span>
        </div>

        <div className="flex-1 min-w-0 pr-1 text-left">
          <p className="text-xs font-semibold text-white truncate">
            {actor?.displayName || 'Someone'}{' '}
            <span className="font-normal text-slate-400">@{actor?.username}</span>
          </p>
          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
            {notification.content}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
