import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Edit3, 
  Grid, 
  Heart, 
  Bookmark, 
  Play, 
  Check, 
  UserPlus, 
  MessageSquare, 
  LogOut, 
  Sparkles, 
  Camera, 
  Upload, 
  X,
  Users
} from 'lucide-react';
import { User, VideoItem } from '../types';

interface ProfileViewProps {
  profileUser: User;
  currentUser: User;
  allUsers: User[];
  videos: VideoItem[];
  onFollowToggle: (userId: string) => void;
  onStartChat: (user: User) => void;
  onSelectVideo: (video: VideoItem) => void;
  onUpdateProfile: (updated: Partial<User>) => void;
  onSwitchUser: (user: User) => void;
  onOpenAuth: () => void;
  onOpenDiscover: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileUser,
  currentUser,
  allUsers,
  videos,
  onFollowToggle,
  onStartChat,
  onSelectVideo,
  onUpdateProfile,
  onSwitchUser,
  onOpenAuth,
  onOpenDiscover,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'saved'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit profile form state
  const [displayName, setDisplayName] = useState(profileUser.displayName);
  const [username, setUsername] = useState(profileUser.username);
  const [bio, setBio] = useState(profileUser.bio);
  const [avatar, setAvatar] = useState(profileUser.avatar);
  const [password, setPassword] = useState(profileUser.password || '');

  const isMe = profileUser.id === currentUser.id;
  const isFollowing = currentUser.following.includes(profileUser.id);

  // Filter videos
  const userVideos = videos.filter((v) => v.userId === profileUser.id);
  const likedVideos = videos.filter((v) => profileUser.likedVideos.includes(v.id));
  const savedVideos = videos.filter((v) => profileUser.savedVideos.includes(v.id));

  const currentList =
    activeTab === 'posts' ? userVideos : activeTab === 'likes' ? likedVideos : savedVideos;

  // Total likes received across all posted videos
  const totalLikesReceived = userVideos.reduce((acc, v) => acc + v.likesCount, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: bio.trim(),
      avatar: avatar.trim(),
      password: password.trim(),
    });
    setShowEditModal(false);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-black text-slate-100 pb-20 md:pb-6 no-scrollbar">
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-amber-400 to-sky-400 shadow-xl overflow-hidden">
              <img
                src={profileUser.avatar}
                alt={profileUser.displayName}
                className="w-full h-full object-cover rounded-full bg-slate-900"
                referrerPolicy="no-referrer"
              />
            </div>
            {isMe && (
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-rose-500 shadow-md transition-colors"
                title="Edit profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              {profileUser.displayName}
            </h1>
            {profileUser.isVerified && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </div>

          <p className="text-sm text-sky-400 font-medium mb-2.5">
            @{profileUser.username}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed mb-5">
            {profileUser.bio}
          </p>

          {/* Social Stats Strip */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 py-3 px-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center mb-6 shadow-sm">
            <div>
              <p className="text-base sm:text-lg font-bold text-white tabular-nums">
                {profileUser.following.length}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Following</p>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <p className="text-base sm:text-lg font-bold text-white tabular-nums">
                {profileUser.followers.length}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Followers</p>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <p className="text-base sm:text-lg font-bold text-white tabular-nums">
                {totalLikesReceived}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Likes</p>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <p className="text-base sm:text-lg font-bold text-white tabular-nums">
                {profileUser.friends.length}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Friends</p>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="flex items-center gap-2.5">
            {isMe ? (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Account</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Log out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onFollowToggle(profileUser.id)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isFollowing
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Added Friend</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add / Follow</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onStartChat(profileUser)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Message</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Video Grid Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-medium text-slate-400 mb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'posts' ? 'border-rose-500 text-white font-semibold' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Videos ({userVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'likes' ? 'border-rose-500 text-white font-semibold' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked ({likedVideos.length})</span>
          </button>

          {isMe && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'saved' ? 'border-rose-500 text-white font-semibold' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved ({savedVideos.length})</span>
            </button>
          )}
        </div>

        {/* Video 3-Column Grid */}
        {currentList.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {currentList.map((vid) => (
              <div
                key={vid.id}
                onClick={() => onSelectVideo(vid)}
                className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group hover:opacity-95 transition-all"
              >
                <img
                  src={vid.posterUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&auto=format&fit=crop&q=80'}
                  alt={vid.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-white drop-shadow">
                    <Play className="w-3 h-3 fill-white" />
                    <span className="tabular-nums">
                      {vid.viewsCount > 1000 ? `${(vid.viewsCount / 1000).toFixed(1)}K` : vid.viewsCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <Grid className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No videos in this tab</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeTab === 'posts' ? 'Post a video to share with your friends!' : 'Interact with reels on the feed to save them.'}
            </p>
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowEditModal(false)} />
          <div 
            className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-white">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Avatar section */}
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-2">
                  <label className="block font-semibold text-slate-300">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex gap-1.5">
                    {[
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                    ].map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatar(sample)}
                        className="w-7 h-7 rounded-full overflow-hidden border border-slate-700 hover:border-rose-500"
                      >
                        <img src={sample} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Username (@handle)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set or change password"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
