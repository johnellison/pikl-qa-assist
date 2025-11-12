'use client';

import { FileUpload } from '@/components/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function UploadPage() {
  const handleUpload = (files: File[]) => {
    console.log('Uploading files:', files);
    // TODO: Implement actual upload logic in Task 6 (API route)
    // For now, just log the files
    files.forEach((file) => {
      console.log(`File: ${file.name}, Size: ${file.size} bytes`);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Call Recordings</h1>
        <p className="text-muted-foreground mt-2">
          Upload WAV files for automatic transcription and AI-powered quality analysis
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>File naming convention:</strong> Files should be named as{' '}
          <code className="text-sm bg-muted px-1 py-0.5 rounded">
            [LastName, FirstName]_AgentID-Phone_Timestamp(CallID).wav
          </code>
          <br />
          <span className="text-xs text-muted-foreground">
            Example: [Stevens, Rebecca]_218-07786515254_20251112120634(2367).wav
          </span>
          <br />
          <br />
          <span className="text-xs text-muted-foreground">
            <strong>Note:</strong> Files larger than 25MB will be automatically compressed to meet API requirements. Audio quality will remain sufficient for accurate transcription.
          </span>
        </AlertDescription>
      </Alert>

      <FileUpload onUpload={handleUpload} />
    </div>
  );
}
