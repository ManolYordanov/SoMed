import { User, VideoItem, CommentItem, DirectMessage, NotificationItem, ThemeSettings } from '../types';
import { INITIAL_USERS, INITIAL_VIDEOS, INITIAL_COMMENTS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'vibestream_current_user',
  USERS: 'vibestream_users',
  VIDEOS: 'vibestream_videos',
  COMMENTS: 'vibestream_comments',
  MESSAGES: 'vibestream_messages',
  NOTIFICATIONS: 'vibestream_notifications',
  THEME: 'vibestream_theme_settings',
};

// Default current user if not signed up yet
export const DEFAULT_CURRENT_USER: User = {
  id: 'user_current',
  username: 'alex_creator',
  displayName: 'Alex Rivera',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  bio: 'Visual artist & digital creator. Making everyday moments feel cinematic 🎬',
  password: 'password123',
  followers: ['user_maya', 'user_leo', 'user_marcus'],
  following: ['user_maya', 'user_leo'],
  friends: ['user_maya', 'user_leo'],
  likedVideos: ['v1', 'v2'],
  savedVideos: ['v3'],
  createdAt: '2026-03-01T00:00:00Z',
  isVerified: true,
};

export function getThemeSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse theme settings', e);
  }
  return { mode: 'dark-eyecare', warmthFilter: false };
}

export function saveThemeSettings(settings: ThemeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save theme settings', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load current user', e);
  }
  return null;
}

export function logoutCurrentUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch (e) {
    console.error('Failed to logout current user', e);
  }
}

export function saveCurrentUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // also sync in all users list
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    saveAllUsers(users);
  } catch (e) {
    console.error('Failed to save current user', e);
  }
}

export function getAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const users: User[] = JSON.parse(raw);
      if (users.length > 0) return users;
    }
  } catch (e) {
    console.error('Failed to load users', e);
  }
  saveAllUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

export function saveAllUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function getAllVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (raw) {
      const list: VideoItem[] = JSON.parse(raw);
      if (list.length > 0) return list;
    }
  } catch (e) {
    console.error('Failed to load videos', e);
  }
  saveAllVideos(INITIAL_VIDEOS);
  return INITIAL_VIDEOS;
}

export function saveAllVideos(videos: VideoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  } catch (e) {
    console.error('Failed to save videos', e);
  }
}

export function getAllComments(): CommentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (raw) {
      const list: CommentItem[] = JSON.parse(raw);
      if (list.length > 0) return list;
    }
  } catch (e) {
    console.error('Failed to load comments', e);
  }
  saveAllComments(INITIAL_COMMENTS);
  return INITIAL_COMMENTS;
}

export function saveAllComments(comments: CommentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  } catch (e) {
    console.error('Failed to save comments', e);
  }
}

export function getAllMessages(): DirectMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (raw) {
      const list: DirectMessage[] = JSON.parse(raw);
      if (list.length > 0) return list;
    }
  } catch (e) {
    console.error('Failed to load messages', e);
  }
  saveAllMessages(INITIAL_MESSAGES);
  return INITIAL_MESSAGES;
}

export function saveAllMessages(messages: DirectMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages', e);
  }
}

export function getAllNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      const list: NotificationItem[] = JSON.parse(raw);
      if (list.length > 0) return list;
    }
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
  saveAllNotifications(INITIAL_NOTIFICATIONS);
  return INITIAL_NOTIFICATIONS;
}

export function saveAllNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

/**
 * Trigger native browser push notification if permitted
 */
export function sendBrowserPushNotification(title: string, body: string, icon?: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        badge: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Native notification suppressed by browser context', e);
    }
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    console.warn('Permission request error', e);
    return false;
  }
}
