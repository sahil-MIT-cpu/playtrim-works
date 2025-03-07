import { useState } from 'react';
import { Scissors, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatTime, TrimRange } from '@/lib/videoProcessor';

interface TrimControlsProps {
  currentTime: number;
  duration: number;
  trimRange: TrimRange | null;
  onTrimChange: (trimRange: TrimRange | null) => void;
}

const TrimControls = ({
  currentTime,
  duration,
  trimRange,
  onTrimChange
}: TrimControlsProps) => {
  const [isTrimming, setIsTrimming] = useState(false);
  
  // Start trimming mode
  const handleStartTrimming = () => {
    // Start with a small range around the current time
    const startTime = Math.max(0, currentTime - 2);
    const endTime = Math.min(duration, currentTime + 2);
    
    onTrimChange({ startTime, endTime });
    setIsTrimming(true);
  };
  
  // Cancel trimming
  const handleCancelTrim = () => {
    onTrimChange(null);
    setIsTrimming(false);
  };
  
  // Confirm trim settings
  const handleConfirmTrim = () => {
    // Keep the trim range and exit trim mode
    setIsTrimming(false);
  };
  
  // Set trim start to current time
  const handleSetTrimStart = () => {
    if (!trimRange) return;
    
    // Ensure start time doesn't exceed end time
    const newStartTime = Math.min(currentTime, trimRange.endTime - 0.5);
    onTrimChange({ ...trimRange, startTime: newStartTime });
  };
  
  // Set trim end to current time
  const handleSetTrimEnd = () => {
    if (!trimRange) return;
    
    // Ensure end time doesn't precede start time
    const newEndTime = Math.max(currentTime, trimRange.startTime + 0.5);
    onTrimChange({ ...trimRange, endTime: newEndTime });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trim Video</h3>
        
        {!isTrimming ? (
          <Button 
            variant="outline" 
            onClick={handleStartTrimming}
            className="h-8"
          >
            <Scissors size={16} className="mr-1" />
            Trim Mode
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelTrim}
              size="sm"
              className="h-8"
            >
              <X size={16} className="mr-1" />
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleConfirmTrim}
              size="sm"
              className="h-8"
            >
              <Check size={16} className="mr-1" />
              Confirm
            </Button>
          </div>
        )}
      </div>
      
      <Separator />
      
      {isTrimming && trimRange ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Start Time</span>
                <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                  {formatTime(trimRange.startTime)}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSetTrimStart}
                className="w-full"
              >
                Set to Current Position
              </Button>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">End Time</span>
                <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                  {formatTime(trimRange.endTime)}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSetTrimEnd}
                className="w-full"
              >
                Set to Current Position
              </Button>
            </div>
          </div>
          
          <div className="bg-secondary/40 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">Selected Duration:</span>
              <span className="text-sm font-medium">
                {formatTime(trimRange.endTime - trimRange.startTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm">Original Duration:</span>
              <span className="text-sm">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Drag the trim handles on the timeline to adjust the start and end points.</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          {trimRange ? (
            <p>Trim range selected. Enable trim mode to make adjustments.</p>
          ) : (
            <p>Click "Trim Mode" to start selecting a range to keep in your video.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrimControls;
