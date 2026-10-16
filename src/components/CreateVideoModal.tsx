import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Film, 
  Sparkles, 
  Check, 
  Music, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle 
} from 'lucide-react';
import { VideoItem, User } from '../types';

interface CreateVideoModalProps {
  currentUser: User;
  onClose: () => void;
  onPostVideo: (video: Omit<VideoItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'viewsCount'>) => void;
}

// Creative preset clips to test posting without uploading large files
const PRESET_CLIPS = [
  {
    name: 'Neon City Night',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&auto=format&fit=crop&q=80',
    sound: 'Midnight City Drift - Lofi Edit',
  },
  {
    name: 'Skatepark Action',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=400&auto=format&fit=crop&q=80',
    sound: 'Adrenaline Rush (Original Mix)',
  },
  {
    name: 'Analog Beats & Synth',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    sound: 'Raindrops & Analog Waves',
  },
  {
    name: 'Digital Light Shader',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    sound: 'Cybernetic Flow - Electronic',
  },
];

export const CreateVideoModal: React.FC<CreateVideoModalProps> = ({
  currentUser,
  onClose,
  onPostVideo,
}) => {
  const [sourceMode, setSourceMode] = useState<'upload' | 'camera' | 'presets'>('presets');
  const [videoUrl, setVideoUrl] = useState<string>(PRESET_CLIPS[0].url);
  const [posterUrl, setPosterUrl] = useState<string>(PRESET_CLIPS[0].poster);
  const [caption, setCaption] = useState<string>('');
  const [soundTitle, setSoundTitle] = useState<string>(PRESET_CLIPS[0].sound);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Stop camera on unmount or mode switch
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Switch to Camera Mode
  const startCamera = async () => {
    setSourceMode('camera');
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Unable to access camera or microphone. Please check permissions or upload a video instead.');
    }
  };

  const handleStartRecording = () => {
    if (!mediaStreamRef.current) return;
    try {
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const recordedUrl = URL.createObjectURL(blob);
        setVideoUrl(recordedUrl);
        setPosterUrl('');
        stopCameraStream();
        setSourceMode('upload'); // return to preview
      };

      recorder.start();
      setIsRecording(true);
      setRecordTimer(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.warn('Media recorder error', e);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setPosterUrl('');
      setSoundTitle(`Original Audio - ${currentUser.displayName}`);
      setSourceMode('upload');
    }
  };

  // Submit Post
  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    // Extract hashtags and mentions
    const words = caption.split(/\s+/);
    const hashtags = words
      .filter((w) => w.startsWith('#'))
      .map((w) => w.replace(/[^a-zA-Z0-9_]/g, ''));
    const mentions = words
      .filter((w) => w.startsWith('@'))
      .map((w) => w.replace(/[^a-zA-Z0-9_]/g, ''));

    onPostVideo({
      userId: currentUser.id,
      videoUrl,
      posterUrl,
      caption: caption.trim() || 'Sharing my new moment on VibeStream ✨',
      hashtags,
      mentions,
      soundTitle: soundTitle || `Original Sound - @${currentUser.username}`,
      soundAuthor: currentUser.displayName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative z-10 w-full sm:max-w-xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-sm sm:text-base text-white">Create New Video Post</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          
          {/* Source Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                setSourceMode('presets');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sourceMode === 'presets' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Inspiration Clips
            </button>

            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                fileInputRef.current?.click();
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sourceMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              Upload Video
            </button>

            <button
              type="button"
              onClick={startCamera}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sourceMode === 'camera' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              Record Cam
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Camera View Mode */}
          {sourceMode === 'camera' && (
            <div className="relative aspect-[9/16] max-h-72 sm:max-h-80 mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              {cameraError ? (
                <div className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 mb-3">{cameraError}</p>
                  <button
                    onClick={() => setSourceMode('presets')}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-xs font-semibold text-white"
                  >
                    Use Sample Clips
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={cameraVideoRef}
                    className="w-full h-full object-cover -scale-x-100"
                    playsInline
                    muted
                  />
                  
                  {/* Record Control HUD */}
                  <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
                    {isRecording && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse tabular-nums">
                        REC {recordTimer}s
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className={`w-14 h-14 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                        isRecording ? 'bg-rose-600 scale-110' : 'bg-rose-500 hover:scale-105'
                      }`}
                    >
                      <div className={`rounded-sm bg-white transition-all ${isRecording ? 'w-5 h-5' : 'w-6 h-6 rounded-full'}`} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Preset Selection Mode */}
          {sourceMode === 'presets' && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Select a Video Clip</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_CLIPS.map((clip) => {
                  const isSelected = videoUrl === clip.url;
                  return (
                    <button
                      key={clip.name}
                      type="button"
                      onClick={() => {
                        setVideoUrl(clip.url);
                        setPosterUrl(clip.poster);
                        setSoundTitle(clip.sound);
                      }}
                      className={`relative aspect-[9/16] rounded-xl overflow-hidden border-2 text-left transition-all ${
                        isSelected ? 'border-rose-500 shadow-lg shadow-rose-500/20 scale-[1.02]' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={clip.poster}
                        alt={clip.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                        <p className="text-[11px] font-semibold text-white leading-tight">
                          {clip.name}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Video Preview Player */}
          {sourceMode !== 'camera' && videoUrl && (
            <div className="relative aspect-[16/9] max-h-48 mx-auto rounded-xl overflow-hidden bg-black border border-slate-800">
              <video
                ref={videoPreviewRef}
                src={videoUrl}
                poster={posterUrl}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Caption & Hashtag Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Caption & Mentions
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's going on? Tag friends with @username and topics with #hashtag..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Quick tag inserts */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Quick tags:</span>
              {['#vibe', '#trending', '#aesthetic', '#daily', '#cinematic'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCaption((prev) => `${prev} ${tag} `)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Sound Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" />
                Soundtrack Title
              </label>
              <input
                type="text"
                value={soundTitle}
                onChange={(e) => setSoundTitle(e.target.value)}
                placeholder="e.g. Midnight Waves (Original Mix)"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={!videoUrl}
            className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-xs font-bold text-white shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Post Video
          </button>
        </div>

      </div>
    </div>
  );
};
