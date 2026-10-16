import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  AtSign, 
  Lock, 
  Camera, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Video,
  X
} from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean;
  onSignUp: (newUser: Omit<UserType, 'id' | 'followers' | 'following' | 'friends' | 'likedVideos' | 'savedVideos' | 'createdAt'>) => void;
  onSignIn: (username: string, password?: string) => boolean;
  existingUsers: UserType[];
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  onSignUp,
  onSignIn,
  existingUsers,
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [bio, setBio] = useState('New creator exploring VibeStream ✨');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  // Camera selfie snapshot
  const startCameraSnap = async () => {
    setIsTakingPhoto(true);
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 300 }, height: { ideal: 300 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      console.warn('Camera snap failed', e);
      setIsTakingPhoto(false);
      setErrorMessage('Camera access was not available. Please choose a preset or upload an image.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 250, 250);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setAvatar(dataUrl);
    }
    stopCamera();
    setIsTakingPhoto(false);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 2) {
      setErrorMessage('Username must be at least 2 characters long (letters, numbers, underscores)');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setErrorMessage('Please enter your display name');
        return;
      }
      if (!password.trim() || password.length < 3) {
        setErrorMessage('Please enter a password with at least 3 characters');
        return;
      }

      // Check if username already registered
      const exists = existingUsers.some((u) => u.username.toLowerCase() === cleanUsername);
      if (exists) {
        setErrorMessage(`@${cleanUsername} is already registered. Try a different username.`);
        return;
      }

      onSignUp({
        displayName: displayName.trim(),
        username: cleanUsername,
        password: password.trim(),
        avatar,
        bio: bio.trim(),
      });

      if (onClose) onClose();
    } else {
      const success = onSignIn(cleanUsername, password.trim());
      if (!success) {
        setErrorMessage('Invalid username or password. Please verify your credentials or choose a demo creator.');
        return;
      }
      if (onClose) onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto no-scrollbar ${
        isMandatory ? 'bg-black/95 backdrop-blur-2xl' : 'bg-black/80 backdrop-blur-md'
      } animate-in fade-in`}
    >
      {/* Backdrop */}
      {!isMandatory && <div className="absolute inset-0" onClick={onClose} />}

      <div 
        className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Banner Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white font-display">
                VibeStream
              </h2>
              <p className="text-[11px] text-rose-400 font-semibold tracking-wide">
                {isMandatory ? 'ACCOUNT REGISTRATION REQUIRED' : 'ACCOUNT ACCESS'}
              </p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isMandatory && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="leading-relaxed">
              <strong>Account Setup Required:</strong> You need an account to watch infinite video reels, follow creators, post videos, and chat with friends.
            </p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'signup' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'signin' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In Existing
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <>
              {/* Profile Picture Required */}
              <div>
                <label className="block font-semibold text-slate-300 mb-2">
                  Profile Picture <span className="text-rose-400">*</span>
                </label>

                {isTakingPhoto ? (
                  <div className="flex flex-col items-center gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <video
                      ref={videoRef}
                      className="w-32 h-32 rounded-full object-cover -scale-x-100 border-2 border-rose-500"
                      playsInline
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-1.5 rounded-xl bg-rose-500 text-white font-bold"
                      >
                        Snap Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopCamera();
                          setIsTakingPhoto(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={avatar}
                        alt="Avatar preview"
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-rose-500 shadow-md bg-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <label 
                        className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-950 border border-slate-700 text-white cursor-pointer hover:bg-rose-500 transition-colors"
                        title="Upload photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFile}
                        />
                      </label>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-slate-400">Choose avatar or take selfie:</span>
                        <button
                          type="button"
                          onClick={startCameraSnap}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                        >
                          <Video className="w-3 h-3" />
                          <span>Use Camera</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAvatar(preset)}
                            className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                              avatar === preset ? 'border-rose-500 scale-110 shadow' : 'border-slate-700 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt="preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Name */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Display Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    required
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Username (@handle) */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Username (@handle) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g. jordan_stream"
                required
                className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
            {mode === 'signup' && (
              <p className="text-[10px] text-slate-500 mt-1">
                Your unique handle used by friends to find and tag you (@{username || 'yourname'}).
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full py-2.5 pl-9 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Bio (Optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short bio about what you create..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'signup' ? 'Create Account & Enter' : 'Sign In & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
