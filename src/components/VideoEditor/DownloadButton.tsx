
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TrimRange, TextOverlay } from '@/lib/videoProcessor';

interface DownloadButtonProps {
  videoSrc: string | null;
  trimRange: TrimRange | null;
  textOverlays: TextOverlay[];
  disabled?: boolean;
}

const DownloadButton = ({
  videoSrc,
  trimRange,
  textOverlays,
  disabled = false
}: DownloadButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleDownload = async () => {
    if (!videoSrc) {
      toast.error("No video to download");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real application, this would process the video with server-side
      // tools or WebAssembly-based video processing libraries
      
      // For this demo, we'll simulate processing time and just download the original video
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a download link for the original video
      const link = document.createElement('a');
      link.href = videoSrc;
      link.download = `edited_video_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Video downloaded successfully");
      
      // Note: In a production app, we would:
      // 1. Send the video, trim range, and text overlays to a server
      // 2. Process the video on the server using ffmpeg or similar
      // 3. Return the processed video for download
      
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to process video");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isProcessing || !videoSrc}
      className="w-full"
    >
      {isProcessing ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Download size={16} className="mr-2" />
          Download Video
        </>
      )}
    </Button>
  );
};

export default DownloadButton;
