export interface User {
  id: string;
  username: string; // e.g. "alex_rivera"
  displayName: string;
  avatar: string;
  bio: string;
  password?: string;
  followers: string[]; // user ids
  following: string[]; // user ids
  friends: string[]; // mutual or explicitly added friends
  likedVideos: string[];
  savedVideos: string[];
  createdAt: string;
  isVerified?: boolean;
}

export interface VideoItem {
  id: string;
  userId: string;
  videoUrl: string;
  posterUrl?: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  soundTitle: string;
  soundAuthor: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  replyToId?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  sharedVideoId?: string;
  createdAt: string;
  isRead: boolean;
}

export type NotificationType = 'follow' | 'mention' | 'like' | 'comment' | 'message';

export interface NotificationItem {
  id: string;
  userId: string; // recipient
  actorId: string; // sender / actor
  type: NotificationType;
  content: string;
  videoId?: string;
  createdAt: string;
  isRead: boolean;
}

export type ThemeMode = 'dark-oled' | 'dark-eyecare' | 'light';

export interface ThemeSettings {
  mode: ThemeMode;
  warmthFilter: boolean;
}

export type ActiveTab = 'feed' | 'discover' | 'create' | 'inbox' | 'profile';
