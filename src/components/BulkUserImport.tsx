import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const BulkUserImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid CSV file");
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const users = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Split by comma but handle quoted values
      const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"(.*)"$/, '$1').trim()) || [];
      const user: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        if (!value) return;
        
        // Handle telegram_id (ID column)
        if (header === 'telegram_id' || header === 'id' || header === 'user_id') {
          const parsedId = parseInt(value);
          if (!isNaN(parsedId)) {
            user.telegram_id = parsedId;
          }
        } 
        // Handle username
        else if (header === 'username') {
          if (value && value !== '') {
            user.username = value;
          }
        } 
        // Handle first name
        else if (header === 'first name' || header === 'first_name' || header === 'firstname') {
          if (value && value !== '') {
            user.first_name = value;
          }
        } 
        // Handle last name
        else if (header === 'last name' || header === 'last_name' || header === 'lastname') {
          if (value && value !== '') {
            user.last_name = value;
          }
        }
      });
      
      // Only add if we have a valid telegram_id and it's not a bot
      if (user.telegram_id) {
        users.push(user);
      }
    }
    
    return users;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const users = parseCSV(text);
      
      if (users.length === 0) {
        toast.error("No valid users found in CSV");
        return;
      }

      toast.info(`Importing ${users.length} users...`);

      const { data, error } = await supabase.functions.invoke('bulk-import-users', {
        body: { users }
      });

      if (error) throw error;

      toast.success(`Successfully imported ${data.imported} users!`);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import users");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import Users</CardTitle>
        <CardDescription>
          Upload a CSV file to import telegram users. CSV should have columns: telegram_id, username, first_name, last_name
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1 text-sm"
          />
        </div>
        {file && (
          <p className="text-sm text-muted-foreground">
            Selected: {file.name}
          </p>
        )}
        <Button 
          onClick={handleImport} 
          disabled={!file || isImporting}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isImporting ? "Importing..." : "Import Users"}
        </Button>
      </CardContent>
    </Card>
  );
};
