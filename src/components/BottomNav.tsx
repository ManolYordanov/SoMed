import React from 'react';
import { Home, Compass, Plus, MessageSquare, User as UserIcon } from 'lucide-react';
import { ActiveTab, User } from '../types';

interface BottomNavProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadMessagesCount: number;
  currentUser: User;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  unreadMessagesCount,
  currentUser,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 text-slate-300 md:hidden">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        
        {/* Tab 1: Feed */}
        <button
          onClick={() => onTabChange('feed')}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors"
          aria-label="Feed"
        >
          <Home
            className={`w-6 h-6 transition-all ${
              currentTab === 'feed' ? 'text-white scale-110' : 'text-slate-400 hover:text-white'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 ${
              currentTab === 'feed' ? 'text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Feed
          </span>
        </button>

        {/* Tab 2: Discover / Add People */}
        <button
          onClick={() => onTabChange('discover')}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors"
          aria-label="Discover and Add People"
        >
          <Compass
            className={`w-6 h-6 transition-all ${
              currentTab === 'discover' ? 'text-white scale-110' : 'text-slate-400 hover:text-white'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 ${
              currentTab === 'discover' ? 'text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Discover
          </span>
        </button>

        {/* Tab 3: Create / Post Video (+) */}
        <button
          onClick={() => onTabChange('create')}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 group"
          aria-label="Post a Video"
        >
          <div className="relative flex items-center justify-center w-11 h-8 rounded-xl bg-gradient-to-r from-sky-400 via-rose-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 group-hover:scale-105 active:scale-95 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1 text-slate-300">
            Post
          </span>
        </button>

        {/* Tab 4: Messages / Chat */}
        <button
          onClick={() => onTabChange('inbox')}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative"
          aria-label="Direct Messages"
        >
          <div className="relative">
            <MessageSquare
              className={`w-6 h-6 transition-all ${
                currentTab === 'inbox' ? 'text-white scale-110' : 'text-slate-400 hover:text-white'
              }`}
            />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 ${
              currentTab === 'inbox' ? 'text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Chats
          </span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors"
          aria-label="Profile"
        >
          <div
            className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all ${
              currentTab === 'profile' ? 'border-rose-500 scale-110' : 'border-transparent'
            }`}
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-full h-full text-slate-300" />
            )}
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 ${
              currentTab === 'profile' ? 'text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Profile
          </span>
        </button>

      </div>
    </nav>
  );
};
