
import { useState, useEffect, useRef } from 'react';
import { Upload, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

import VideoPlayer from '@/components/VideoEditor/VideoPlayer';
import Timeline from '@/components/VideoEditor/Timeline';
import TextOverlayEditor from '@/components/VideoEditor/TextOverlay';
import TrimControls from '@/components/VideoEditor/TrimControls';
import DownloadButton from '@/components/VideoEditor/DownloadButton';

import { 
  TextOverlay, 
  TrimRange, 
  generateThumbnails 
} from '@/lib/videoProcessor';

const Index = () => {
  // Video state
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  
  // Editing state
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [trimRange, setTrimRange] = useState<TrimRange | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('text');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    
    // Reset state when new video is loaded
    setCurrentTime(0);
    setIsPlaying(false);
    setTextOverlays([]);
    setTrimRange(null);
    setThumbnails([]);
    
    toast.success(`Video "${file.name}" loaded`);
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast.error('Please drop a valid video file');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    
    // Reset state when new video is loaded
    setCurrentTime(0);
    setIsPlaying(false);
    setTextOverlays([]);
    setTrimRange(null);
    setThumbnails([]);
    
    toast.success(`Video "${file.name}" loaded`);
  };
  
  // Handle timeline updates
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  // Handle duration change
  const handleDurationChange = async (duration: number) => {
    setVideoDuration(duration);
    
    if (videoSrc && videoRef.current) {
      // Generate thumbnails when duration is available
      try {
        const thumbs = await generateThumbnails(videoRef.current, 8);
        setThumbnails(thumbs);
      } catch (error) {
        console.error('Error generating thumbnails:', error);
      }
    }
  };
  
  // Handle playback controls
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleReset = () => {
    setCurrentTime(trimRange?.startTime || 0);
  };
  
  // Handle text overlay actions
  const handleAddTextOverlay = (overlay: Omit<TextOverlay, 'id'>) => {
    setTextOverlays([
      ...textOverlays,
      { ...overlay, id: `overlay-${Date.now()}` }
    ]);
    
    toast.success('Text overlay added');
  };
  
  const handleUpdateTextOverlay = (id: string, data: Partial<TextOverlay>) => {
    setTextOverlays(
      textOverlays.map(overlay => 
        overlay.id === id ? { ...overlay, ...data } : overlay
      )
    );
  };
  
  const handleDeleteTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
    toast.success('Text overlay removed');
  };
  
  // Handle trim changes
  const handleTrimChange = (newTrimRange: TrimRange | null) => {
    setTrimRange(newTrimRange);
    
    // If we have a new trim range, jump to its start
    if (newTrimRange && (!trimRange || newTrimRange.startTime !== trimRange.startTime)) {
      setCurrentTime(newTrimRange.startTime);
    }
  };
  
  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);
  
  return (
    <div 
      className="min-h-screen bg-background py-8 px-4 sm:px-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight mb-2 animate-fade-in">
            Video Editor
          </h1>
          <p className="text-muted-foreground animate-slide-up">
            Upload, edit, and download your videos with elegant simplicity
          </p>
        </header>
        
        <main className="space-y-8">
          {/* Video Upload Area */}
          {!videoSrc && (
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 animate-scale-in",
                isDraggingFile 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
              )}
            >
              <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload size={28} className="text-primary" />
                </div>
                
                <h3 className="text-xl font-medium">Upload your video</h3>
                
                <p className="text-muted-foreground">
                  Drag and drop a video file here, or click the button below to browse your files
                </p>
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="animate-fade-in"
                >
                  Select Video
                </Button>
              </div>
            </div>
          )}
          
          {/* Video Editor */}
          {videoSrc && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Preview and Timeline - Left Column */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="overflow-hidden border-none shadow-lg animate-scale-in">
                  <CardContent className="p-0">
                    <div className="hidden"> {/* Hidden video for thumbnail generation */}
                      <video ref={videoRef} src={videoSrc} />
                    </div>
                    
                    <VideoPlayer
                      src={videoSrc}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      textOverlays={textOverlays}
                      onTimeUpdate={handleTimeUpdate}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onDurationChange={handleDurationChange}
                    />
                  </CardContent>
                </Card>
                
                <div className="p-4 bg-card rounded-lg border shadow-sm animate-slide-up">
                  <Timeline
                    duration={videoDuration}
                    currentTime={currentTime}
                    thumbnails={thumbnails}
                    trimRange={trimRange}
                    onTimeChange={setCurrentTime}
                    onTrimChange={trimRange ? handleTrimChange : undefined}
                  />
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={isPlaying ? handlePause : handlePlay}
                        className="h-10 w-10 rounded-full"
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleReset}
                        className="h-10 w-10 rounded-full"
                      >
                        <RotateCcw size={18} />
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      <Upload size={16} className="mr-2" />
                      Replace Video
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Editing Controls - Right Column */}
              <div className="space-y-4">
                <Card className="animate-slide-up">
                  <CardContent className="p-6">
                    <Tabs 
                      defaultValue="text" 
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="text">Text Overlay</TabsTrigger>
                        <TabsTrigger value="trim">Cut & Trim</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="text">
                        <TextOverlayEditor
                          currentTime={currentTime}
                          duration={videoDuration}
                          overlays={textOverlays}
                          onAddOverlay={handleAddTextOverlay}
                          onUpdateOverlay={handleUpdateTextOverlay}
                          onDeleteOverlay={handleDeleteTextOverlay}
                        />
                      </TabsContent>
                      
                      <TabsContent value="trim">
                        <TrimControls
                          currentTime={currentTime}
                          duration={videoDuration}
                          trimRange={trimRange}
                          onTrimChange={handleTrimChange}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <Card className="animate-slide-up">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-medium">Finish Editing</h3>
                    <Separator />
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      Download your video with all edits applied
                    </p>
                    
                    <DownloadButton
                      videoSrc={videoSrc}
                      trimRange={trimRange}
                      textOverlays={textOverlays}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground animate-fade-in">
          <p>Minimalist Video Editor • Created with precision and simplicity</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
