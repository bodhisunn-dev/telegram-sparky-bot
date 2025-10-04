import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

export const UploadMemetropolisVideo = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Fetch the video from public folder
      const response = await fetch('/memetropolis-animation.mp4');
      
      if (!response.ok) {
        throw new Error(`Failed to load video: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Video blob size:', blob.size, 'type:', blob.type);
      
      // Check if file is too large (max 20MB for Telegram)
      if (blob.size > 20 * 1024 * 1024) {
        throw new Error('Video file is too large (max 20MB). Please use a smaller file.');
      }
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('bot-media')
        .upload('memetropolis-animation.mp4', blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: blob.type || 'video/mp4'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bot-media')
        .getPublicUrl('memetropolis-animation.mp4');

      toast({
        title: "Video uploaded! ✅",
        description: `File size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`,
      });
      
      console.log('Video uploaded to:', publicUrl);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Upload Animation to Storage</CardTitle>
        <CardDescription>
          Upload the Memetropolis animation to Supabase Storage for reliable access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Video to Storage
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
