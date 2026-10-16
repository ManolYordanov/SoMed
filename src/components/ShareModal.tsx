import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Share2, 
  MessageSquare, 
  Users, 
  Link as LinkIcon 
} from 'lucide-react';
import { VideoItem, User } from '../types';

interface ShareModalProps {
  video: VideoItem | null;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSendToFriend: (friendId: string, videoId: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  video,
  users,
  currentUser,
  onClose,
  onSendToFriend,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentFriendIds, setSentFriendIds] = useState<string[]>([]);

  if (!video) return null;

  // Added friends (or people you follow)
  const friends = users.filter(
    (u) =>
      u.id !== currentUser.id &&
      (currentUser.friends.includes(u.id) || currentUser.following.includes(u.id))
  );

  const handleCopyLink = () => {
    const url = `${window.location.origin}?video=${video.id}`;
    navigator.clipboard.writeText(url).catch(console.warn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `VibeStream Video by ${video.soundAuthor}`,
          text: video.caption,
          url: `${window.location.origin}?video=${video.id}`,
        });
      } catch (err) {
        console.warn('Share cancelled or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSend = (friendId: string) => {
    onSendToFriend(friendId, video.id);
    setSentFriendIds((prev) => [...prev, friendId]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Surface */}
      <div 
        className="relative z-10 w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-rose-500" />
            Share With Friends
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Send Directly to Added Friends / People Added */}
        <div className="py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Send via Direct Message
          </p>

          {friends.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {friends.map((friend) => {
                const isSent = sentFriendIds.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    className="flex flex-col items-center gap-1.5 shrink-0 w-16 text-center"
                  >
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        alt={friend.displayName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      {isSent && (
                        <div className="absolute inset-0 bg-emerald-500/80 rounded-full flex items-center justify-center text-white">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] font-medium text-slate-200 truncate w-full">
                      {friend.displayName.split(' ')[0]}
                    </p>

                    <button
                      onClick={() => handleSend(friend.id)}
                      disabled={isSent}
                      className={`w-full py-1 rounded-md text-[10px] font-semibold transition-colors ${
                        isSent
                          ? 'bg-slate-800 text-emerald-400'
                          : 'bg-rose-500 hover:bg-rose-600 text-white'
                      }`}
                    >
                      {isSent ? 'Sent' : 'Send'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/50 text-center">
              <p className="text-xs text-slate-300 mb-1">No friends added yet</p>
              <p className="text-[11px] text-slate-500">
                Add creators using their @username to send videos directly!
              </p>
            </div>
          )}
        </div>

        {/* Share Action Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-medium text-white transition-colors"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>More Options</span>
          </button>
        </div>

      </div>
    </div>
  );
};
