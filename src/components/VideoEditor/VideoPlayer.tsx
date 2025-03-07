
import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextOverlay as TextOverlayType, isOverlayVisible, getOverlayPosition } from '@/lib/videoProcessor';

interface VideoPlayerProps {
  src: string | null;
  currentTime: number;
  isPlaying: boolean;
  textOverlays: TextOverlayType[];
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onDurationChange: (duration: number) => void;
}

const VideoPlayer = ({
  src,
  currentTime,
  isPlaying,
  textOverlays,
  onTimeUpdate,
  onPlay,
  onPause,
  onDurationChange
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Handle video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onTimeUpdate]);

  // Handle duration change when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleDurationChange = () => {
      onDurationChange(video.duration);
      setVideoLoaded(true);
    };

    video.addEventListener('loadedmetadata', handleDurationChange);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleDurationChange);
    };
  }, [onDurationChange]);

  // Sync current time with external state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || Math.abs(video.currentTime - currentTime) < 0.5) return;
    
    video.currentTime = currentTime;
  }, [currentTime]);

  // Sync play/pause state with external state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying && video.paused) {
      video.play().catch(() => {
        // Handle autoplay restrictions
        onPause();
      });
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, onPause]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative w-full aspect-video bg-black/5 rounded-lg overflow-hidden transition-all duration-300 animate-scale-in",
        !src && "flex items-center justify-center",
        isFullscreen && "fixed inset-0 z-50 w-screen h-screen rounded-none"
      )}
    >
      {src ? (
        <>
          <video 
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            src={src}
          />
          
          {/* Text Overlays */}
          {videoLoaded && textOverlays.map((overlay) => (
            isOverlayVisible(currentTime, overlay) && (
              <div
                key={overlay.id}
                className="text-overlay animate-fade-in"
                style={{
                  ...getOverlayPosition(overlay.position),
                  fontSize: `${overlay.fontSize}px`,
                  color: overlay.color,
                }}
              >
                {overlay.text}
              </div>
            )
          ))}
          
          {/* Floating Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2 glass p-1 rounded-full">
            <button 
              onClick={isPlaying ? onPause : onPlay}
              className="btn-icon"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="btn-icon"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </>
      ) : (
        <div className="text-muted-foreground animate-pulse">
          Upload a video to get started
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
