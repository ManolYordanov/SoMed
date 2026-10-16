import React, { useRef, useState, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Plus, 
  Check, 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { VideoItem, User } from '../types';

interface VideoCardProps {
  video: VideoItem;
  creator: User | undefined;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLike: (videoId: string) => void;
  isLiked: boolean;
  onBookmark: (videoId: string) => void;
  isBookmarked: boolean;
  onOpenComments: (videoId: string) => void;
  onOpenShare: (video: VideoItem) => void;
  onFollowToggle: (userId: string) => void;
  isFollowing: boolean;
  onSelectCreator: (user: User) => void;
  onSelectHashtag: (tag: string) => void;
  onSelectMention: (username: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  creator,
  isActive,
  isMuted,
  onToggleMute,
  onLike,
  isLiked,
  onBookmark,
  isBookmarked,
  onOpenComments,
  onOpenShare,
  onFollowToggle,
  isFollowing,
  onSelectCreator,
  onSelectHashtag,
  onSelectMention,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number } | null>(null);
  const [videoError, setVideoError] = useState<boolean>(false);
  const lastTapRef = useRef<number>(0);

  // Auto-play/pause when card becomes active or inactive
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Autoplay prevented or failed', err);
            setIsPlaying(false);
          });
      }
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Track progress
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  // Handle single tap (play/pause) vs double tap (like)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (now - lastTapRef.current < 300) {
      // Double tap detected!
      if (!isLiked) {
        onLike(video.id);
      }
      setHeartBurst({ x, y });
      setTimeout(() => setHeartBurst(null), 800);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current !== 0) {
          // Single tap: toggle play/pause
          togglePlayPause();
          lastTapRef.current = 0;
        }
      }, 300);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.warn);
      setIsPlaying(true);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 500);
  };

  // Format big numbers
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div 
      className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none snap-item"
      onClick={handleContainerClick}
    >
      {/* Video player */}
      {!videoError ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.posterUrl}
          className="w-full h-full object-cover sm:object-contain bg-black"
          playsInline
          loop
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onError={() => {
            console.warn('Video load error fallback for:', video.videoUrl);
            setVideoError(true);
          }}
        />
      ) : (
        // High quality animated canvas fallback if network or media blocks
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-950 p-6 text-center text-white relative">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">
            {video.caption.slice(0, 40)}...
          </p>
          <p className="text-xs text-slate-400">
            Tap anywhere to interact · Sound by {video.soundAuthor}
          </p>
        </div>
      )}

      {/* Center Play/Pause pulse indicator */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white animate-in zoom-in-75 fade-out duration-300">
            {isPlaying ? (
              <Play className="w-8 h-8 fill-white ml-1" />
            ) : (
              <Pause className="w-8 h-8 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Double tap Heart Burst animation */}
      {heartBurst && (
        <div
          className="absolute pointer-events-none z-30 animate-in zoom-in-50 fade-out duration-700"
          style={{ left: heartBurst.x - 40, top: heartBurst.y - 40 }}
        >
          <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-[0_10px_20px_rgba(244,63,94,0.6)]" />
        </div>
      )}

      {/* Top Scrim Gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Bottom Scrim Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Right Action Bar */}
      <div 
        className="absolute right-3 sm:right-5 bottom-20 z-20 flex flex-col items-center gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Avatar with Follow/Add Friend Button */}
        <div className="relative group flex flex-col items-center mb-1">
          <button
            onClick={() => creator && onSelectCreator(creator)}
            className="w-11 h-11 rounded-full p-0.5 bg-white border border-white/40 shadow-lg hover:scale-105 transition-transform overflow-hidden"
            title={`View @${creator?.username}`}
          >
            <img
              src={creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={creator?.displayName || 'Creator'}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Add the guy button (+) */}
          {creator && (
            <button
              onClick={() => onFollowToggle(creator.id)}
              className={`absolute -bottom-2 w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-md ${
                isFollowing
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white hover:bg-rose-600 scale-100 hover:scale-110'
              }`}
              title={isFollowing ? 'Following (Added)' : 'Add / Follow creator'}
              aria-label={isFollowing ? 'Following' : 'Follow creator'}
            >
              {isFollowing ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={() => onLike(video.id)}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
          aria-label={isLiked ? 'Unlike video' : 'Like video'}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60'
            }`}
          >
            <Heart
              className={`w-6 h-6 transition-all ${
                isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white group-hover:scale-110'
              }`}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums drop-shadow">
            {formatCount(video.likesCount)}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={() => onOpenComments(video.id)}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
          aria-label="Open comments"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xs font-semibold tabular-nums drop-shadow">
            {formatCount(video.commentsCount)}
          </span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          onClick={() => onBookmark(video.id)}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
          aria-label={isBookmarked ? 'Unsave video' : 'Save video'}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60'
            }`}
          >
            <Bookmark
              className={`w-6 h-6 transition-all ${
                isBookmarked ? 'fill-amber-400 text-amber-400 scale-110' : 'text-white group-hover:scale-110'
              }`}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums drop-shadow">
            Save
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onOpenShare(video)}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
          aria-label="Share video with friends"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xs font-semibold tabular-nums drop-shadow">
            {formatCount(video.sharesCount)}
          </span>
        </button>

        {/* Spinning Vinyl Audio Record */}
        <div className="mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 p-1 border-2 border-slate-600 shadow-xl flex items-center justify-center animate-spin-slow">
            <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
              <Music className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Information Overlay */}
      <div 
        className="absolute left-3 right-16 sm:left-6 sm:right-24 bottom-18 z-20 text-white text-left pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Name & Handle */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <button
            onClick={() => creator && onSelectCreator(creator)}
            className="font-bold text-sm sm:text-base hover:underline tracking-tight flex items-center gap-1 drop-shadow"
          >
            @{creator?.username || 'creator'}
            {creator?.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </button>

          {/* Quick Follow Badge on Name if not followed */}
          {creator && !isFollowing && (
            <button
              onClick={() => onFollowToggle(creator.id)}
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
            >
              Follow
            </button>
          )}
        </div>

        {/* Video Caption with highlighted tags & mentions */}
        <p className="text-xs sm:text-sm text-slate-100 line-clamp-2 mb-2 leading-relaxed drop-shadow">
          {video.caption.split(' ').map((word, index) => {
            if (word.startsWith('@')) {
              const username = word.replace(/[^a-zA-Z0-9_]/g, '');
              return (
                <button
                  key={index}
                  onClick={() => onSelectMention(username)}
                  className="font-semibold text-sky-400 hover:underline mr-1"
                >
                  {word}
                </button>
              );
            }
            if (word.startsWith('#')) {
              const tag = word.replace(/[^a-zA-Z0-9_]/g, '');
              return (
                <button
                  key={index}
                  onClick={() => onSelectHashtag(tag)}
                  className="font-semibold text-rose-300 hover:underline mr-1"
                >
                  {word}
                </button>
              );
            }
            return word + ' ';
          })}
        </p>

        {/* Sound Track Ticker */}
        <div className="flex items-center gap-2 text-xs text-slate-200">
          <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <div className="overflow-hidden whitespace-nowrap max-w-[200px] sm:max-w-xs">
            <span className="inline-block animate-marquee drop-shadow text-[11px]">
              {video.soundTitle} · {video.soundAuthor}
            </span>
          </div>

          {/* Waveform visualizer bars */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3 shrink-0 ml-1">
              <span className="w-0.5 bg-rose-400 animate-audio-bar-1" />
              <span className="w-0.5 bg-rose-400 animate-audio-bar-2" />
              <span className="w-0.5 bg-rose-400 animate-audio-bar-3" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div 
          className="h-full bg-rose-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
