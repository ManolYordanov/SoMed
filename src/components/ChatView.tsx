import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  MessageSquare, 
  UserPlus, 
  Users,
  Film, 
  Play, 
  Smile, 
  ChevronLeft, 
  Sparkles, 
  CheckCheck 
} from 'lucide-react';
import { DirectMessage, User, VideoItem } from '../types';

interface ChatViewProps {
  users: User[];
  currentUser: User;
  videos: VideoItem[];
  messages: DirectMessage[];
  onSendMessage: (receiverId: string, text: string, sharedVideoId?: string) => void;
  activeChatUserId: string | null;
  onSelectChatUser: (userId: string | null) => void;
  onOpenDiscover: () => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  users,
  currentUser,
  videos,
  messages,
  onSendMessage,
  activeChatUserId,
  onSelectChatUser,
  onOpenDiscover,
  onSelectVideo,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Added friends (or people you follow / have messaged)
  const conversationPartners = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    const hasMessaged = messages.some(
      (m) =>
        (m.senderId === u.id && m.receiverId === currentUser.id) ||
        (m.senderId === currentUser.id && m.receiverId === u.id)
    );
    const isAdded = currentUser.friends.includes(u.id) || currentUser.following.includes(u.id);
    return hasMessaged || isAdded;
  });

  const activeFriend = users.find((u) => u.id === activeChatUserId);

  // Filter conversations
  const filteredPartners = conversationPartners.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchFriend.toLowerCase()) ||
      u.username.toLowerCase().includes(searchFriend.toLowerCase())
  );

  // Active messages between current user and active friend
  const activeMessages = activeFriend
    ? messages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === activeFriend.id) ||
          (m.senderId === activeFriend.id && m.receiverId === currentUser.id)
      )
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, isTyping]);

  // Handle message submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeFriend) return;

    const messageText = inputText.trim();
    onSendMessage(activeFriend.id, messageText);
    setInputText('');

    // Simulate friendly reply after 1.8 seconds to create a realistic live chat experience
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const sampleReplies = [
        `Thanks for reaching out! Really appreciate you following along 🔥`,
        `Yo! Just wrapped up editing my next reel. What do you think of the new clips?`,
        `Awesome! Let's definitely collaborate on a video soon 🎬✨`,
        `Loved this! Tag me in your next post so I can share it too!`,
        `Haha that's amazing! Keep the creativity flowing 🙌`,
      ];
      const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
      onSendMessage(currentUser.id, randomReply); // receiver simulates response back
    }, 1800);
  };

  const getVideoById = (id: string) => videos.find((v) => v.id === id);

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex bg-black text-slate-100 pb-16 md:pb-0 overflow-hidden">
      
      {/* Left Sidebar: Conversations & Added Friends */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 ${
          activeChatUserId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              Direct Messages
            </h2>
            <button
              onClick={onOpenDiscover}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Add people to chat"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Friends</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFriend}
              onChange={(e) => setSearchFriend(e.target.value)}
              placeholder="Search chats by name or @username..."
              className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 no-scrollbar">
          {filteredPartners.length > 0 ? (
            filteredPartners.map((friend) => {
              const isSelected = activeChatUserId === friend.id;
              const lastMsg = messages
                .filter(
                  (m) =>
                    (m.senderId === currentUser.id && m.receiverId === friend.id) ||
                    (m.senderId === friend.id && m.receiverId === currentUser.id)
                )
                .slice(-1)[0];

              return (
                <button
                  key={friend.id}
                  onClick={() => onSelectChatUser(friend.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-rose-500/10 border-l-2 border-rose-500' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatar}
                      alt={friend.displayName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-xs text-white truncate">
                        {friend.displayName}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Online'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {lastMsg ? lastMsg.text : `@${friend.username} · Added Friend`}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No added friends to chat with</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-4">
                Add people by their @username to start messaging!
              </p>
              <button
                onClick={onOpenDiscover}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
              >
                Find & Add People
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Active Chat Window */}
      <div
        className={`flex-1 flex flex-col h-full bg-slate-900 ${
          activeChatUserId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeFriend ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectChatUser(null)}
                  className="md:hidden p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={activeFriend.avatar}
                    alt={activeFriend.displayName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                    {activeFriend.displayName}
                    {activeFriend.isVerified && (
                      <span className="w-3 h-3 rounded-full bg-sky-500 text-white text-[8px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    @{activeFriend.username} · Active now
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {activeMessages.length > 0 ? (
                activeMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  const sharedVideo = msg.sharedVideoId ? getVideoById(msg.sharedVideoId) : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                          isMine
                            ? 'bg-rose-500 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                        }`}
                      >
                        {/* If a video was shared in this message */}
                        {sharedVideo && (
                          <div 
                            onClick={() => onSelectVideo(sharedVideo)}
                            className="mb-2 rounded-xl overflow-hidden bg-black/40 border border-white/20 p-2 cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-1.5 flex items-center justify-center">
                              {sharedVideo.posterUrl ? (
                                <img
                                  src={sharedVideo.posterUrl}
                                  alt={sharedVideo.caption}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                  <Film className="w-6 h-6 text-rose-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow">
                                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] font-semibold truncate text-white">
                              {sharedVideo.caption}
                            </p>
                            <p className="text-[10px] text-white/70">
                              Tap to watch reel
                            </p>
                          </div>
                        )}

                        <p className="break-words">{msg.text}</p>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && <CheckCheck className="w-3 h-3 text-sky-400" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 text-rose-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-white">
                    Start chatting with {activeFriend.displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Say hello or share a cool video from your feed!
                  </p>
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                  <div className="flex items-center gap-1 bg-slate-800 px-3 py-2 rounded-2xl rounded-bl-none border border-slate-700">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[10px] text-slate-500">{activeFriend.displayName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeFriend.displayName}...`}
                className="flex-1 py-2.5 px-4 rounded-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-md shadow-rose-500/20 shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-rose-500">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Your Direct Messages</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Select an added friend on the left to start chatting, or add new creators using their @username.
            </p>
            <button
              onClick={onOpenDiscover}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
            >
              Find Creators to Add
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
