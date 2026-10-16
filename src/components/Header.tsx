import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Eye, 
  Bell, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { ThemeSettings, ThemeMode, ActiveTab, User } from '../types';

interface HeaderProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  feedFilter: 'forYou' | 'following';
  onFeedFilterChange: (filter: 'forYou' | 'following') => void;
  themeSettings: ThemeSettings;
  onThemeSettingsChange: (settings: ThemeSettings) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenDiscover: () => void;
  currentUser: User;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  feedFilter,
  onFeedFilterChange,
  themeSettings,
  onThemeSettingsChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenDiscover,
  currentUser,
  isMuted,
  onToggleMute,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleSelectMode = (mode: ThemeMode) => {
    onThemeSettingsChange({ ...themeSettings, mode });
    setShowThemeMenu(false);
  };

  const handleToggleWarmth = () => {
    onThemeSettingsChange({
      ...themeSettings,
      warmthFilter: !themeSettings.warmthFilter,
    });
  };

  const isLight = themeSettings.mode === 'light';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 select-none bg-black/70 border-white/10 text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onTabChange('feed')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              VibeStream
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links & Feed Switcher */}
        <div className="flex items-center gap-2">
          {currentTab === 'feed' ? (
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <button
                onClick={() => onFeedFilterChange('following')}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  feedFilter === 'following'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Following
              </button>
              <button
                onClick={() => onFeedFilterChange('forYou')}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  feedFilter === 'forYou'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                For You
              </button>
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <button 
                onClick={() => onTabChange('feed')} 
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                Feed
              </button>
              <button 
                onClick={() => onTabChange('discover')} 
                className={`hover:text-white transition-colors whitespace-nowrap ${currentTab === 'discover' ? 'text-white font-semibold' : ''}`}
              >
                Discover
              </button>
              <button 
                onClick={() => onTabChange('inbox')} 
                className={`hover:text-white transition-colors whitespace-nowrap ${currentTab === 'inbox' ? 'text-white font-semibold' : ''}`}
              >
                Direct Messages
              </button>
              <button 
                onClick={() => onTabChange('profile')} 
                className={`hover:text-white transition-colors whitespace-nowrap ${currentTab === 'profile' ? 'text-white font-semibold' : ''}`}
              >
                Profile
              </button>
            </nav>
          )}
        </div>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? 'Unmute Audio (Sound On)' : 'Mute Audio'}
            aria-label="Toggle audio volume"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Search / Add Friend trigger */}
          <button
            onClick={onOpenDiscover}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Search users & Add friends"
            aria-label="Search and add friends"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications button with unread counter */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Notifications & Mentions"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-black animate-pulse" />
            )}
          </button>

          {/* Eye Strain Reduction & Dark Mode Menu */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
              title="Eye strain reduction & dark mode options"
              aria-label="Dark mode and eye comfort settings"
            >
              {themeSettings.mode === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : themeSettings.mode === 'dark-eyecare' ? (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="hidden sm:inline">
                {themeSettings.mode === 'dark-eyecare' ? 'Eye-Care' : themeSettings.mode === 'dark-oled' ? 'OLED' : 'Light'}
              </span>
            </button>

            {/* Dropdown for theme & eye strain reduction */}
            {showThemeMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 p-3 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 text-slate-200 text-xs animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-rose-400" />
                      Display & Eye Care
                    </span>
                    <span className="text-[10px] text-slate-400">Eye Strain Relief</span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <button
                      onClick={() => handleSelectMode('dark-eyecare')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        themeSettings.mode === 'dark-eyecare'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="font-medium text-white">Eye-Care Midnight</p>
                          <p className="text-[10px] text-slate-400">Warm dark tone, soft contrast</p>
                        </div>
                      </div>
                      {themeSettings.mode === 'dark-eyecare' && <ShieldCheck className="w-4 h-4 text-rose-400" />}
                    </button>

                    <button
                      onClick={() => handleSelectMode('dark-oled')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        themeSettings.mode === 'dark-oled'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="font-medium text-white">OLED Pure Dark</p>
                          <p className="text-[10px] text-slate-400">True black #000000 screen</p>
                        </div>
                      </div>
                      {themeSettings.mode === 'dark-oled' && <ShieldCheck className="w-4 h-4 text-rose-400" />}
                    </button>

                    <button
                      onClick={() => handleSelectMode('light')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        themeSettings.mode === 'light'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="font-medium text-white">Daylight Mode</p>
                          <p className="text-[10px] text-slate-400">Clean bright sunlight style</p>
                        </div>
                      </div>
                      {themeSettings.mode === 'light' && <ShieldCheck className="w-4 h-4 text-rose-400" />}
                    </button>
                  </div>

                  {/* Warmth Blue-Light Filter Slider/Toggle */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Amber Warmth Filter</p>
                      <p className="text-[10px] text-slate-400">Filters blue light fatigue</p>
                    </div>
                    <button
                      onClick={handleToggleWarmth}
                      className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                        themeSettings.warmthFilter ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          themeSettings.warmthFilter ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar to open profile */}
          <button
            onClick={() => onTabChange('profile')}
            className="p-0.5 rounded-full ring-2 ring-transparent hover:ring-rose-500 transition-all shrink-0 ml-1"
            title={`Logged in as ${currentUser.displayName}`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-7 h-7 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>

      </div>
    </header>
  );
};
