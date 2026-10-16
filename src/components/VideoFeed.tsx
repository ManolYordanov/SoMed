import React, { useState, useEffect, useRef } from 'react';
import { VideoItem, User } from '../types';
import { VideoCard } from './VideoCard';
import { 
  ChevronUp, 
  ChevronDown, 
  Compass, 
  Users, 
  TrendingUp, 
  Music, 
  Sparkles 
} from 'lucide-react';

interface VideoFeedProps {
  videos: VideoItem[];
  users: User[];
  currentUser: User;
  isMuted: boolean;
  onToggleMute: () => void;
  onLike: (videoId: string) => void;
  onBookmark: (videoId: string) => void;
  onOpenComments: (videoId: string) => void;
  onOpenShare: (video: VideoItem) => void;
  onFollowToggle: (userId: string) => void;
  onSelectCreator: (user: User) => void;
  onSelectHashtag: (tag: string) => void;
  onSelectMention: (username: string) => void;
  feedFilter: 'forYou' | 'following';
  onOpenDiscover: () => void;
  onOpenCreate: () => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videos,
  users,
  currentUser,
  isMuted,
  onToggleMute,
  onLike,
  onBookmark,
  onOpenComments,
  onOpenShare,
  onFollowToggle,
  onSelectCreator,
  onSelectHashtag,
  onSelectMention,
  feedFilter,
  onOpenDiscover,
  onOpenCreate,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayVideos, setDisplayVideos] = useState<VideoItem[]>(videos);

  // Sync display videos when videos or filter changes
  useEffect(() => {
    let filtered = videos;
    if (feedFilter === 'following') {
      filtered = videos.filter((v) => currentUser.following.includes(v.userId));
    }
    setDisplayVideos(filtered);
    setActiveIndex(0);
  }, [videos, feedFilter, currentUser.following]);

  // Infinite scroll generator: append more videos when reaching near end
  const loadMoreVideos = () => {
    if (videos.length === 0) return;
    const more = videos.map((v, i) => ({
      ...v,
      id: `${v.id}_loop_${Date.now()}_${i}`,
    }));
    setDisplayVideos((prev) => [...prev, ...more]);
  };

  // Handle scroll events with debounce to update active index
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const height = el.clientHeight;
    if (height === 0) return;

    const newIndex = Math.round(el.scrollTop / height);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < displayVideos.length) {
      setActiveIndex(newIndex);
    }

    // If near bottom, load more
    if (el.scrollHeight - (el.scrollTop + height) < height * 2) {
      loadMoreVideos();
    }
  };

  // Keyboard navigation: Arrow Up / Arrow Down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        scrollToVideo(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        scrollToVideo(activeIndex - 1);
      } else if (e.key === 'm') {
        onToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, displayVideos.length, onToggleMute]);

  const scrollToVideo = (index: number) => {
    if (index < 0 || index >= displayVideos.length) return;
    const el = containerRef.current;
    if (!el) return;
    const height = el.clientHeight;
    el.scrollTo({
      top: index * height,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const getUserById = (id: string) => users.find((u) => u.id === id);

  // Suggested friends to add (people not yet followed)
  const suggestedUsers = users
    .filter((u) => u.id !== currentUser.id && !currentUser.following.includes(u.id))
    .slice(0, 4);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden bg-black">
      
      {/* Desktop Left Sidebar: Suggested Creators to Add */}
      <aside aria-label="Suggested creators and trending topics" className="hidden lg:flex flex-col w-72 h-full p-4 border-r border-white/10 text-slate-300 overflow-y-auto no-scrollbar shrink-0">
        
        {/* Suggested Creators */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              Suggested Creators
            </span>
            <button
              onClick={onOpenDiscover}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              See all
            </button>
          </div>

          <div className="space-y-2.5">
            {suggestedUsers.length > 0 ? (
              suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <button
                    onClick={() => onSelectCreator(user)}
                    className="flex items-center gap-2.5 min-w-0 text-left"
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => onFollowToggle(user.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors shrink-0"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                You follow all suggested creators!
              </p>
            )}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="mb-6">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Trending Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['#skatelife', '#cinematography', '#modular', '#webgl', '#nightvibes', '#surrealart'].map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectHashtag(tag.replace('#', ''))}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard navigation helper */}
        <div className="mt-auto p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            Quick Tips
          </p>
          <p>• Press <kbd className="px-1 py-0.5 rounded bg-black/40 text-white font-mono">↓</kbd> / <kbd className="px-1 py-0.5 rounded bg-black/40 text-white font-mono">↑</kbd> to change video</p>
          <p>• Press <kbd className="px-1 py-0.5 rounded bg-black/40 text-white font-mono">M</kbd> to toggle mute</p>
          <p>• Double tap video to like</p>
        </div>
      </aside>

      {/* Main Reels Snap Feed Container */}
      <main className="relative flex-1 h-full max-w-[450px] w-full flex items-center justify-center">
        
        {displayVideos.length > 0 ? (
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar relative"
          >
            {displayVideos.map((video, index) => {
              const creator = getUserById(video.userId);
              const isLiked = currentUser.likedVideos.includes(video.id);
              const isBookmarked = currentUser.savedVideos.includes(video.id);
              const isFollowing = currentUser.following.includes(video.userId);

              return (
                <div key={video.id} className="w-full h-full snap-item relative">
                  <VideoCard
                    video={video}
                    creator={creator}
                    isActive={index === activeIndex}
                    isMuted={isMuted}
                    onToggleMute={onToggleMute}
                    onLike={onLike}
                    isLiked={isLiked}
                    onBookmark={onBookmark}
                    isBookmarked={isBookmarked}
                    onOpenComments={onOpenComments}
                    onOpenShare={onOpenShare}
                    onFollowToggle={onFollowToggle}
                    isFollowing={isFollowing}
                    onSelectCreator={onSelectCreator}
                    onSelectHashtag={onSelectHashtag}
                    onSelectMention={onSelectMention}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          // Empty state when following no one yet
          <div className="flex flex-col items-center justify-center p-8 text-center text-white max-w-sm">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No videos yet</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              You are not following any creators with recent posts. Discover amazing people or post your first video!
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={onOpenDiscover}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors"
              >
                Find Creators
              </button>
              <button
                onClick={onOpenCreate}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
              >
                Post Video
              </button>
            </div>
          </div>
        )}

        {/* Floating Up/Down Navigation Buttons for desktop convenience */}
        <div className="hidden sm:flex flex-col gap-2 absolute right-[-54px] top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={() => scrollToVideo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Video"
            aria-label="Previous Video"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollToVideo(activeIndex + 1)}
            disabled={activeIndex >= displayVideos.length - 1}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Video"
            aria-label="Next Video"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Desktop Right Sidebar: Soundtracks & Quick Discovery */}
      <aside aria-label="Popular soundtracks" className="hidden xl:flex flex-col w-72 h-full p-4 border-l border-white/10 text-slate-300 overflow-y-auto no-scrollbar shrink-0">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Music className="w-3.5 h-3.5 text-sky-400" />
          Popular Soundtracks
        </span>

        <div className="space-y-2">
          {[
            { title: 'Midnight City Drift', artist: 'Sophie Novak', uses: '4.2k videos' },
            { title: 'Adrenaline Rush (Mix)', artist: 'Leo Torres', uses: '8.9k videos' },
            { title: 'Raindrops & Analog Waves', artist: 'Sophie Novak', uses: '2.1k videos' },
            { title: 'Cybernetic Flow', artist: 'Marcus Vance', uses: '1.5k videos' },
          ].map((track, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer"
              onClick={onOpenCreate}
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-medium text-white truncate group-hover:text-rose-400 transition-colors">
                  {track.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {track.artist} · {track.uses}
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-rose-500/20 group-hover:bg-rose-500 text-rose-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Music className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </aside>

    </div>
  );
};
