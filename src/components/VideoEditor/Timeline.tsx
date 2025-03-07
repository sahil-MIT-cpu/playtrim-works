
import { useState, useRef, useEffect } from 'react';
import { formatTime, TrimRange } from '@/lib/videoProcessor';

interface TimelineProps {
  duration: number;
  currentTime: number;
  trimRange: TrimRange | null;
  thumbnails: string[];
  onTimeChange: (time: number) => void;
  onTrimChange?: (trimRange: TrimRange) => void;
}

const Timeline = ({ 
  duration, 
  currentTime, 
  trimRange, 
  thumbnails,
  onTimeChange,
  onTrimChange
}: TimelineProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const startHandleRef = useRef<HTMLDivElement>(null);
  const endHandleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'progress' | 'trimStart' | 'trimEnd' | null>(null);

  // Calculate progress percentage
  const progressPercentage = (currentTime / duration) * 100;
  
  // Set trim ranges
  const trimStartPercentage = trimRange ? (trimRange.startTime / duration) * 100 : 0;
  const trimEndPercentage = trimRange ? (trimRange.endTime / duration) * 100 : 100;

  // Generate time markers
  const generateTimeMarkers = () => {
    // For durations less than 1 minute, show markers every 5 seconds
    // For longer durations, show markers every 30 seconds
    const interval = duration < 60 ? 5 : 30;
    const markers = [];
    
    for (let time = 0; time <= duration; time += interval) {
      const percentage = (time / duration) * 100;
      markers.push({ time, percentage });
    }
    
    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  // Handle mouse down on track
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    
    // Calculate the click position as a percentage of the track width
    const rect = trackRef.current.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const newTime = clickPos * duration;
    
    // Update current time
    onTimeChange(Math.max(0, Math.min(newTime, duration)));
    
    // Start dragging the progress handle
    setIsDragging(true);
    setDragType('progress');
  };

  // Handle mouse down on trim handles
  const handleTrimHandleMouseDown = (e: React.MouseEvent, type: 'trimStart' | 'trimEnd') => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const dragPos = (e.clientX - rect.left) / rect.width;
      const newTime = dragPos * duration;
      const clampedTime = Math.max(0, Math.min(newTime, duration));
      
      // Handle different drag types
      if (dragType === 'progress') {
        onTimeChange(clampedTime);
      } else if (dragType === 'trimStart' && trimRange && onTrimChange) {
        const newStartTime = Math.min(clampedTime, trimRange.endTime - 0.5);
        onTrimChange({ ...trimRange, startTime: newStartTime });
      } else if (dragType === 'trimEnd' && trimRange && onTrimChange) {
        const newEndTime = Math.max(clampedTime, trimRange.startTime + 0.5);
        onTrimChange({ ...trimRange, endTime: newEndTime });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, duration, onTimeChange, trimRange, onTrimChange]);

  return (
    <div className="w-full space-y-2 select-none animate-slide-up">
      {/* Thumbnails row */}
      {thumbnails.length > 0 && (
        <div className="flex h-16 w-full overflow-hidden rounded-md">
          {thumbnails.map((thumb, index) => (
            <div 
              key={index} 
              className="h-full" 
              style={{ width: `${100 / thumbnails.length}%` }}
            >
              <img 
                src={thumb} 
                alt={`Thumbnail ${index}`} 
                className="h-full w-full object-cover opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Timeline track */}
      <div 
        ref={trackRef}
        className="timeline-track"
        onMouseDown={handleTrackMouseDown}
      >
        {/* Progress bar */}
        <div 
          className="timeline-progress" 
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Trim region overlay */}
        {trimRange && (
          <div 
            className="absolute top-0 h-full bg-primary/20"
            style={{ 
              left: `${trimStartPercentage}%`, 
              width: `${trimEndPercentage - trimStartPercentage}%` 
            }}
          />
        )}
        
        {/* Current position handle */}
        <div 
          className="timeline-handle"
          style={{ left: `calc(${progressPercentage}% - 8px)` }}
        />
        
        {/* Trim handles */}
        {trimRange && onTrimChange && (
          <>
            <div 
              ref={startHandleRef}
              className="trim-handle left-0"
              style={{ left: `${trimStartPercentage}%` }}
              onMouseDown={(e) => handleTrimHandleMouseDown(e, 'trimStart')}
            />
            <div 
              ref={endHandleRef}
              className="trim-handle right-0"
              style={{ left: `${trimEndPercentage}%` }}
              onMouseDown={(e) => handleTrimHandleMouseDown(e, 'trimEnd')}
            />
          </>
        )}
      </div>
      
      {/* Time markers */}
      <div className="flex justify-between text-xs text-muted-foreground">
        {timeMarkers.map((marker, index) => (
          <div 
            key={index}
            className="text-center"
            style={{ 
              position: 'absolute',
              left: `calc(${marker.percentage}% - 12px)` 
            }}
          >
            {formatTime(marker.time)}
          </div>
        ))}
      </div>
      
      {/* Current time / Duration display */}
      <div className="flex justify-between text-sm">
        <div className="font-medium">{formatTime(currentTime)}</div>
        <div className="text-muted-foreground">{formatTime(duration)}</div>
      </div>
    </div>
  );
};

export default Timeline;
