import React, { useState, useEffect } from 'react';
import { 
  User, 
  VideoItem, 
  CommentItem, 
  DirectMessage, 
  NotificationItem, 
  ThemeSettings, 
  ActiveTab 
} from './types';
import { 
  getCurrentUser, 
  saveCurrentUser, 
  getAllUsers, 
  saveAllUsers, 
  getAllVideos, 
  saveAllVideos, 
  getAllComments, 
  saveAllComments, 
  getAllMessages, 
  saveAllMessages, 
  getAllNotifications, 
  saveAllNotifications, 
  getThemeSettings, 
  saveThemeSettings, 
  sendBrowserPushNotification,
  logoutCurrentUser 
} from './utils/storage';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { VideoFeed } from './components/VideoFeed';
import { CommentsDrawer } from './components/CommentsDrawer';
import { ShareModal } from './components/ShareModal';
import { CreateVideoModal } from './components/CreateVideoModal';
import { DiscoverModal } from './components/DiscoverModal';
import { ChatView } from './components/ChatView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { PushToast } from './components/PushToast';

export default function App() {
  // Persistent data state
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);
  const [users, setUsers] = useState<User[]>(getAllUsers);
  const [videos, setVideos] = useState<VideoItem[]>(getAllVideos);
  const [comments, setComments] = useState<CommentItem[]>(getAllComments);
  const [messages, setMessages] = useState<DirectMessage[]>(getAllMessages);
  const [notifications, setNotifications] = useState<NotificationItem[]>(getAllNotifications);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(getThemeSettings);

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [feedFilter, setFeedFilter] = useState<'forYou' | 'following'>('forYou');
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(() => getCurrentUser());
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  // Audio mute state (global)
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Modal overlays
  const [activeCommentVideoId, setActiveCommentVideoId] = useState<string | null>(null);
  const [shareVideo, setShareVideo] = useState<VideoItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Real-time Push Notification Toast banner
  const [activePushToast, setActivePushToast] = useState<{
    notification: NotificationItem;
    actor: User | undefined;
  } | null>(null);

  // Sync current user to profile view when switching users or editing profile
  useEffect(() => {
    if (currentUser && (!selectedProfileUser || selectedProfileUser.id === currentUser.id)) {
      setSelectedProfileUser(currentUser);
    }
  }, [currentUser]);

  // Apply Theme & Eye-care Warmth to DOM
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Reset theme classes
    root.classList.remove('theme-light', 'theme-oled', 'theme-eyecare');
    body.classList.remove('bg-black', 'bg-slate-950', 'bg-slate-100', 'text-white', 'text-slate-900', 'eye-care-warmth');

    if (themeSettings.mode === 'light') {
      root.classList.add('theme-light');
      body.classList.add('bg-slate-900', 'text-white'); // keep background high contrast for video viewports
    } else if (themeSettings.mode === 'dark-oled') {
      root.classList.add('theme-oled');
      body.classList.add('bg-black', 'text-white');
    } else {
      root.classList.add('theme-eyecare');
      body.classList.add('bg-slate-950', 'text-slate-100');
    }

    if (themeSettings.warmthFilter) {
      body.classList.add('eye-care-warmth');
    }
  }, [themeSettings]);

  // Trigger Push Notification helper
  const triggerNotification = (
    actorId: string,
    recipientId: string,
    type: 'follow' | 'mention' | 'like' | 'comment' | 'message',
    content: string,
    videoId?: string
  ) => {
    const fallbackUser = currentUser || users[0];
    const actor = users.find((u) => u.id === actorId) || fallbackUser;
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: recipientId,
      actorId,
      type,
      content,
      videoId,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveAllNotifications(updated);

    // If notification is for the current user, trigger in-app toast & browser push
    if (currentUser && recipientId === currentUser.id && actor) {
      setActivePushToast({ notification: newNotif, actor });
      sendBrowserPushNotification(
        `${actor.displayName} (@${actor.username})`,
        content,
        actor.avatar
      );
    }
  };

  // Follow / Add Guy toggle
  const handleFollowToggle = (targetUserId: string) => {
    if (!currentUser || targetUserId === currentUser.id) return;
    const isAlreadyFollowing = currentUser.following.includes(targetUserId);

    let updatedFollowing: string[];
    let updatedFriends: string[];

    if (isAlreadyFollowing) {
      updatedFollowing = currentUser.following.filter((id) => id !== targetUserId);
      updatedFriends = currentUser.friends.filter((id) => id !== targetUserId);
    } else {
      updatedFollowing = [...currentUser.following, targetUserId];
      updatedFriends = [...currentUser.friends, targetUserId];

      // Trigger push notification to the creator
      triggerNotification(
        currentUser.id,
        targetUserId,
        'follow',
        'started following you and added you as a friend.'
      );
    }

    const updatedUser: User = {
      ...currentUser,
      following: updatedFollowing,
      friends: updatedFriends,
    };

    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);

    // Update target user's followers list
    const updatedUsers = users.map((u) => {
      if (u.id === targetUserId) {
        const followers = isAlreadyFollowing
          ? u.followers.filter((id) => id !== currentUser.id)
          : [...u.followers, currentUser.id];
        return { ...u, followers };
      }
      if (u.id === currentUser.id) {
        return updatedUser;
      }
      return u;
    });

    setUsers(updatedUsers);
    saveAllUsers(updatedUsers);
  };

  // Like video
  const handleLikeVideo = (videoId: string) => {
    if (!currentUser) return;
    const isAlreadyLiked = currentUser.likedVideos.includes(videoId);
    const updatedLikedVideos = isAlreadyLiked
      ? currentUser.likedVideos.filter((id) => id !== videoId)
      : [...currentUser.likedVideos, videoId];

    const updatedUser = {
      ...currentUser,
      likedVideos: updatedLikedVideos,
    };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);

    const updatedVideos = videos.map((v) => {
      if (v.id === videoId) {
        const likesCount = isAlreadyLiked ? Math.max(0, v.likesCount - 1) : v.likesCount + 1;
        // Trigger notification to video owner
        if (!isAlreadyLiked && v.userId !== currentUser.id) {
          triggerNotification(
            currentUser.id,
            v.userId,
            'like',
            'liked your video.',
            v.id
          );
        }
        return { ...v, likesCount };
      }
      return v;
    });

    setVideos(updatedVideos);
    saveAllVideos(updatedVideos);
  };

  // Bookmark / Save video
  const handleBookmarkVideo = (videoId: string) => {
    if (!currentUser) return;
    const isSaved = currentUser.savedVideos.includes(videoId);
    const updatedSaved = isSaved
      ? currentUser.savedVideos.filter((id) => id !== videoId)
      : [...currentUser.savedVideos, videoId];

    const updatedUser = { ...currentUser, savedVideos: updatedSaved };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);
  };

  // Add comment with automatic @mention push notifications!
  const handleAddComment = (videoId: string, text: string) => {
    if (!currentUser) return;
    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      videoId,
      userId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    saveAllComments(updatedComments);

    // Update video comments count
    const targetVideo = videos.find((v) => v.id === videoId);
    if (targetVideo) {
      const updatedVideos = videos.map((v) =>
        v.id === videoId ? { ...v, commentsCount: v.commentsCount + 1 } : v
      );
      setVideos(updatedVideos);
      saveAllVideos(updatedVideos);

      // Notify video author
      if (targetVideo.userId !== currentUser.id) {
        triggerNotification(
          currentUser.id,
          targetVideo.userId,
          'comment',
          `commented on your video: "${text.slice(0, 45)}"`,
          videoId
        );
      }
    }

    // Check for @mentions in comment text
    const words = text.split(/\s+/);
    words.forEach((w) => {
      if (w.startsWith('@')) {
        const username = w.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
        const mentionedUser = users.find((u) => u.username.toLowerCase() === username);
        if (mentionedUser && mentionedUser.id !== currentUser.id) {
          triggerNotification(
            currentUser.id,
            mentionedUser.id,
            'mention',
            `mentioned you in a comment: "${text.slice(0, 50)}"`,
            videoId
          );
        }
      }
    });
  };

  // Like comment
  const handleLikeComment = (commentId: string) => {
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likesCount: isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
        };
      }
      return c;
    });
    setComments(updated);
    saveAllComments(updated);
  };

  // Post Video
  const handlePostVideo = (
    newVideoData: Omit<VideoItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'viewsCount'>
  ) => {
    if (!currentUser) return;
    const newVideo: VideoItem = {
      ...newVideoData,
      id: `v_${Date.now()}`,
      likesCount: 1, // creator automatic like
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 12,
      createdAt: new Date().toISOString(),
    };

    const updatedVideos = [newVideo, ...videos];
    setVideos(updatedVideos);
    saveAllVideos(updatedVideos);

    // Also mark as liked
    const updatedUser = {
      ...currentUser,
      likedVideos: [...currentUser.likedVideos, newVideo.id],
    };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);

    // Check for mentions in video caption
    newVideo.mentions.forEach((username) => {
      const mentionedUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (mentionedUser && mentionedUser.id !== currentUser.id) {
        triggerNotification(
          currentUser.id,
          mentionedUser.id,
          'mention',
          `tagged you in a new video post: "${newVideo.caption.slice(0, 40)}"`,
          newVideo.id
        );
      }
    });

    setActiveTab('feed');
  };

  // Send Direct Message
  const handleSendMessage = (receiverId: string, text: string, sharedVideoId?: string) => {
    if (!currentUser) return;
    const newMsg: DirectMessage = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      receiverId,
      text,
      sharedVideoId,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    saveAllMessages(updatedMsgs);

    // Ensure recipient is in friends list
    if (!currentUser.friends.includes(receiverId)) {
      const updatedUser = {
        ...currentUser,
        friends: [...currentUser.friends, receiverId],
      };
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }

    // Trigger notification to friend
    triggerNotification(
      currentUser.id,
      receiverId,
      'message',
      `sent you a message: "${text.slice(0, 40)}"`
    );
  };

  // Share video directly to a friend
  const handleSendVideoToFriend = (friendId: string, videoId: string) => {
    handleSendMessage(friendId, 'Hey, check out this video!', videoId);

    // Increment share counter on video
    const updatedVideos = videos.map((v) =>
      v.id === videoId ? { ...v, sharesCount: v.sharesCount + 1 } : v
    );
    setVideos(updatedVideos);
    saveAllVideos(updatedVideos);
  };

  // Sign up new user
  const handleSignUp = (
    newUserFields: Omit<User, 'id' | 'followers' | 'following' | 'friends' | 'likedVideos' | 'savedVideos' | 'createdAt'>
  ) => {
    const newUser: User = {
      ...newUserFields,
      id: `user_${Date.now()}`,
      followers: ['user_maya', 'user_leo'], // welcome followers
      following: ['user_maya'],
      friends: ['user_maya'],
      likedVideos: [],
      savedVideos: [],
      createdAt: new Date().toISOString(),
      isVerified: false,
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    saveAllUsers(updatedUsers);

    setCurrentUser(newUser);
    saveCurrentUser(newUser);
    setSelectedProfileUser(newUser);

    // Welcome push notification
    triggerNotification(
      'user_maya',
      newUser.id,
      'follow',
      'Maya Chen started following you. Welcome to VibeStream!'
    );
  };

  // Sign in existing user
  const handleSignIn = (username: string, password?: string): boolean => {
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (!user) return false;
    if (password && user.password && user.password !== password) {
      return false;
    }
    setCurrentUser(user);
    saveCurrentUser(user);
    setSelectedProfileUser(user);
    return true;
  };

  // Edit current user profile
  const handleUpdateProfile = (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveAllUsers(updatedUsers);
  };

  // Switch account easily
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    setSelectedProfileUser(user);
  };

  // Log out of account (returns to mandatory account setup)
  const handleLogout = () => {
    logoutCurrentUser();
    setCurrentUser(null);
    setSelectedProfileUser(null);
    setActiveChatUserId(null);
    setActiveTab('feed');
  };

  // Notifications mark all as read
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    saveAllNotifications(updated);
  };

  // Quick navigation handlers
  const handleSelectCreator = (creator: User) => {
    setSelectedProfileUser(creator);
    setActiveTab('profile');
  };

  const handleSelectMention = (username: string) => {
    const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setSelectedProfileUser(found);
      setActiveTab('profile');
    } else {
      setShowDiscoverModal(true);
    }
  };

  const handleSelectHashtag = (tag: string) => {
    setFeedFilter('forYou');
    setActiveTab('feed');
  };

  const handleStartChatWithUser = (user: User) => {
    setActiveChatUserId(user.id);
    setActiveTab('inbox');
    setShowDiscoverModal(false);
  };

  const handleSelectVideoFromProfileOrChat = (video: VideoItem) => {
    setFeedFilter('forYou');
    setActiveTab('feed');
  };

  // Mandatory Account Gate: User MUST make an account or sign in to use VibeStream
  if (!currentUser) {
    return (
      <div className="w-full h-screen overflow-hidden bg-black text-slate-100 flex items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          isMandatory={true}
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
          existingUsers={users}
        />
      </div>
    );
  }

  // Counts
  const unreadNotificationsCount = notifications.filter(
    (n) => n.userId === currentUser.id && !n.isRead
  ).length;

  const unreadMessagesCount = messages.filter(
    (m) => m.receiverId === currentUser.id && !m.isRead
  ).length;

  const currentCommentVideo = videos.find((v) => v.id === activeCommentVideoId);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-black text-slate-100 select-none">
      
      {/* Top Header */}
      <Header
        currentTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') setSelectedProfileUser(currentUser);
          setActiveTab(tab);
        }}
        feedFilter={feedFilter}
        onFeedFilterChange={setFeedFilter}
        themeSettings={themeSettings}
        onThemeSettingsChange={(settings) => {
          setThemeSettings(settings);
          saveThemeSettings(settings);
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenDiscover={() => setShowDiscoverModal(true)}
        currentUser={currentUser}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
      />

      {/* Main View Switcher */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'feed' && (
          <VideoFeed
            videos={videos}
            users={users}
            currentUser={currentUser}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onLike={handleLikeVideo}
            onBookmark={handleBookmarkVideo}
            onOpenComments={(id) => setActiveCommentVideoId(id)}
            onOpenShare={(v) => setShareVideo(v)}
            onFollowToggle={handleFollowToggle}
            onSelectCreator={handleSelectCreator}
            onSelectHashtag={handleSelectHashtag}
            onSelectMention={handleSelectMention}
            feedFilter={feedFilter}
            onOpenDiscover={() => setShowDiscoverModal(true)}
            onOpenCreate={() => setShowCreateModal(true)}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverModal
            users={users}
            currentUser={currentUser}
            onFollowToggle={handleFollowToggle}
            onStartChat={handleStartChatWithUser}
            onSelectUser={handleSelectCreator}
          />
        )}

        {activeTab === 'inbox' && (
          <ChatView
            users={users}
            currentUser={currentUser}
            videos={videos}
            messages={messages}
            onSendMessage={handleSendMessage}
            activeChatUserId={activeChatUserId}
            onSelectChatUser={setActiveChatUserId}
            onOpenDiscover={() => setShowDiscoverModal(true)}
            onSelectVideo={handleSelectVideoFromProfileOrChat}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profileUser={selectedProfileUser || currentUser}
            currentUser={currentUser}
            allUsers={users}
            videos={videos}
            onFollowToggle={handleFollowToggle}
            onStartChat={handleStartChatWithUser}
            onSelectVideo={handleSelectVideoFromProfileOrChat}
            onUpdateProfile={handleUpdateProfile}
            onSwitchUser={handleSwitchUser}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenDiscover={() => setShowDiscoverModal(true)}
            onLogout={handleLogout}
          />
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        currentTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'create') {
            setShowCreateModal(true);
            return;
          }
          if (tab === 'profile') {
            setSelectedProfileUser(currentUser);
          }
          setActiveTab(tab);
        }}
        unreadMessagesCount={unreadMessagesCount}
        currentUser={currentUser}
      />

      {/* Floating Push Toast Banner for Mentions & Followers */}
      <PushToast
        notification={activePushToast?.notification || null}
        actor={activePushToast?.actor}
        onClose={() => setActivePushToast(null)}
        onClick={() => {
          if (activePushToast?.notification.type === 'message') {
            setActiveChatUserId(activePushToast.actor?.id || null);
            setActiveTab('inbox');
          } else if (activePushToast?.actor) {
            handleSelectCreator(activePushToast.actor);
          }
          setActivePushToast(null);
        }}
      />

      {/* Slide-Up Comments Drawer */}
      {activeCommentVideoId && currentCommentVideo && (
        <CommentsDrawer
          video={currentCommentVideo}
          comments={comments}
          users={users}
          currentUser={currentUser}
          onClose={() => setActiveCommentVideoId(null)}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onSelectUser={handleSelectCreator}
        />
      )}

      {/* Share Modal */}
      {shareVideo && (
        <ShareModal
          video={shareVideo}
          users={users}
          currentUser={currentUser}
          onClose={() => setShareVideo(null)}
          onSendToFriend={handleSendVideoToFriend}
        />
      )}

      {/* Create Video Post Modal */}
      {showCreateModal && (
        <CreateVideoModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onPostVideo={handlePostVideo}
        />
      )}

      {/* Discover / Add People Modal (when opened from header/buttons) */}
      {showDiscoverModal && (
        <DiscoverModal
          users={users}
          currentUser={currentUser}
          onFollowToggle={handleFollowToggle}
          onStartChat={handleStartChatWithUser}
          onSelectUser={(u) => {
            setShowDiscoverModal(false);
            handleSelectCreator(u);
          }}
          onClose={() => setShowDiscoverModal(false)}
          isModal={true}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <NotificationsView
          notifications={notifications}
          users={users}
          videos={videos}
          currentUser={currentUser}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onSelectUser={(u) => {
            setShowNotificationsModal(false);
            handleSelectCreator(u);
          }}
          onSelectVideo={(v) => {
            setShowNotificationsModal(false);
            handleSelectVideoFromProfileOrChat(v);
          }}
          onClose={() => setShowNotificationsModal(false)}
          isModal={true}
        />
      )}

      {/* Auth Modal (Sign Up / Sign In) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        existingUsers={users}
      />

    </div>
  );
}
