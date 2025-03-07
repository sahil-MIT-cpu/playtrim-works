
import { useState } from 'react';
import { Plus, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatTime, TextOverlay as TextOverlayType } from '@/lib/videoProcessor';

interface TextOverlayEditorProps {
  currentTime: number;
  duration: number;
  overlays: TextOverlayType[];
  onAddOverlay: (overlay: Omit<TextOverlayType, 'id'>) => void;
  onUpdateOverlay: (id: string, overlay: Partial<TextOverlayType>) => void;
  onDeleteOverlay: (id: string) => void;
}

const TextOverlayEditor = ({
  currentTime,
  duration,
  overlays,
  onAddOverlay,
  onUpdateOverlay,
  onDeleteOverlay
}: TextOverlayEditorProps) => {
  const [newText, setNewText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<TextOverlayType['position']>('center');
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState('#ffffff');
  
  // Add new overlay
  const handleAddOverlay = () => {
    if (!newText.trim()) return;
    
    onAddOverlay({
      text: newText,
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, duration),
      position: selectedPosition,
      fontSize,
      color: textColor
    });
    
    // Reset form
    setNewText('');
  };
  
  // Set overlay start time to current time
  const handleSetStartTime = (id: string) => {
    const overlay = overlays.find(o => o.id === id);
    if (!overlay) return;
    
    // Ensure start time doesn't exceed end time
    const newStartTime = Math.min(currentTime, overlay.endTime - 0.5);
    onUpdateOverlay(id, { startTime: newStartTime });
  };
  
  // Set overlay end time to current time
  const handleSetEndTime = (id: string) => {
    const overlay = overlays.find(o => o.id === id);
    if (!overlay) return;
    
    // Ensure end time doesn't precede start time
    const newEndTime = Math.max(currentTime, overlay.startTime + 0.5);
    onUpdateOverlay(id, { endTime: newEndTime });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Text Overlays</h3>
      </div>
      
      <Separator />
      
      {/* Add new overlay form */}
      <div className="space-y-3 p-3 bg-secondary/40 rounded-lg">
        <Label htmlFor="overlay-text">Add New Text Overlay</Label>
        <div className="grid grid-cols-4 gap-2">
          <Input
            id="overlay-text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter text"
            className="col-span-3"
          />
          <Button
            onClick={handleAddOverlay}
            disabled={!newText.trim()}
            className="col-span-1"
          >
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="font-size" className="text-xs">Font Size</Label>
            <div className="flex items-center gap-2">
              <Input
                id="font-size"
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="h-8"
              />
              <span className="text-sm w-8 text-center">{fontSize}</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="text-color" className="text-xs">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-8 w-12 p-1"
              />
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-1">
                  <button 
                    type="button"
                    onClick={() => setSelectedPosition('top')}
                    className={`flex justify-center items-center p-1 rounded ${selectedPosition === 'top' ? 'bg-primary text-white' : 'bg-secondary'}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedPosition('center')}
                    className={`flex justify-center items-center p-1 rounded ${selectedPosition === 'center' ? 'bg-primary text-white' : 'bg-secondary'}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedPosition('bottom')}
                    className={`flex justify-center items-center p-1 rounded ${selectedPosition === 'bottom' ? 'bg-primary text-white' : 'bg-secondary'}`}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* List of existing overlays */}
      {overlays.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {overlays.map((overlay) => (
            <div 
              key={overlay.id}
              className="p-3 bg-card rounded-lg border shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <div 
                  className="font-medium truncate mr-2" 
                  style={{ maxWidth: 'calc(100% - 30px)' }}
                >
                  {overlay.text}
                </div>
                <button
                  onClick={() => onDeleteOverlay(overlay.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs mb-1 block">Start Time</Label>
                  <div className="flex items-center gap-1">
                    <div className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                      {formatTime(overlay.startTime)}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-8"
                      onClick={() => handleSetStartTime(overlay.id)}
                    >
                      Set to current
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-1 block">End Time</Label>
                  <div className="flex items-center gap-1">
                    <div className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                      {formatTime(overlay.endTime)}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-8"
                      onClick={() => handleSetEndTime(overlay.id)}
                    >
                      Set to current
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border" 
                  style={{ backgroundColor: overlay.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {overlay.fontSize}px / {overlay.position}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No text overlays added yet
        </div>
      )}
    </div>
  );
};

export default TextOverlayEditor;
