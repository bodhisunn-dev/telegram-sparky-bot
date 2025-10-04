import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

export const UploadMemetropolisVideo = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is too large (max 20MB for Telegram)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Video must be under 20MB for Telegram. Please compress it first.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      console.log('Uploading file:', selectedFile.name, 'size:', selectedFile.size, 'type:', selectedFile.type);
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('bot-media')
        .upload('memetropolis-animation.mp4', selectedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: selectedFile.type || 'video/mp4'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bot-media')
        .getPublicUrl('memetropolis-animation.mp4');

      toast({
        title: "Video uploaded! ✅",
        description: `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`,
      });
      
      console.log('Video uploaded to:', publicUrl);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <CardContent className="space-y-4">
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
        </div>
        <Button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="gap-2 w-full"
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
