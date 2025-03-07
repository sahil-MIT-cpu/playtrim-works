
/**
 * Video processing utility functions
 */

export interface TrimRange {
  startTime: number;
  endTime: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  position: 'top' | 'center' | 'bottom';
  fontSize: number;
  color: string;
}

/**
 * Format time in seconds to mm:ss format
 */
export const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format time in seconds to mm:ss:ms format for precise editing
 */
export const formatTimePrecise = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00:00:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 100);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
};

/**
 * Extract frame from video at specific time
 */
export const extractFrame = async (videoElement: HTMLVideoElement, timeInSeconds: number): Promise<string> => {
  return new Promise((resolve) => {
    // Save current time
    const currentTime = videoElement.currentTime;
    
    // Set video to the requested time
    videoElement.currentTime = timeInSeconds;
    
    // When the time update happens, capture the frame
    const handleTimeUpdate = () => {
      // Create canvas and context
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to the canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Restore original time
        videoElement.currentTime = currentTime;
        
        // Remove event listener
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        
        // Resolve with data URL
        resolve(dataUrl);
      }
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate, { once: true });
  });
};

/**
 * Generate thumbnail images at regular intervals
 */
export const generateThumbnails = async (
  videoElement: HTMLVideoElement, 
  count: number = 10
): Promise<string[]> => {
  const duration = videoElement.duration;
  const interval = duration / count;
  const thumbnails: string[] = [];
  
  // Generate thumbnails at regular intervals
  for (let i = 0; i < count; i++) {
    const time = interval * i;
    const thumbnail = await extractFrame(videoElement, time);
    thumbnails.push(thumbnail);
  }
  
  return thumbnails;
};

/**
 * Check if current time is within the display range for text overlay
 */
export const isOverlayVisible = (currentTime: number, overlay: TextOverlay): boolean => {
  return currentTime >= overlay.startTime && currentTime <= overlay.endTime;
};

/**
 * Calculate position style for text overlay based on position setting
 */
export const getOverlayPosition = (position: TextOverlay['position']): { [key: string]: string } => {
  switch (position) {
    case 'top':
      return { top: '10%', left: '50%', transform: 'translateX(-50%)' };
    case 'center':
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    case 'bottom':
      return { bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
    default:
      return { bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
  }
};
