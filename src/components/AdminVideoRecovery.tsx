import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Video, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AdminVideoRecovery = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runRecovery = async () => {
    setIsScanning(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('recover-videos');

      if (error) throw error;

      setResults(data);
      
      toast({
        title: 'Recovery Complete',
        description: `Found ${data.foundVideos} videos, matched ${data.matchedItems} to library items.`,
      });
    } catch (error: any) {
      console.error('Recovery error:', error);
      toast({
        title: 'Recovery Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Recovery Tool
        </CardTitle>
        <CardDescription>
          Scan storage buckets and automatically import missing videos into the library
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This tool scans all storage buckets for video files and attempts to match them with 
            existing library items based on creation timestamps.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={runRecovery} 
          disabled={isScanning}
          className="w-full"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning Storage...
            </>
          ) : (
            <>
              <Video className="mr-2 h-4 w-4" />
              Start Video Recovery
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{results.foundVideos}</div>
                  <div className="text-sm text-muted-foreground">Videos Found</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{results.matchedItems}</div>
                  <div className="text-sm text-muted-foreground">Items Matched</div>
                </CardContent>
              </Card>
            </div>

            {results.updates && results.updates.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Updated Items:</h4>
                {results.updates.map((update: any, idx: number) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm"
                  >
                    {update.success ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="truncate flex-1">{update.matched_file}</span>
                  </div>
                ))}
              </div>
            )}

            {results.allVideos && results.allVideos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">All Found Videos:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {results.allVideos.map((video: any, idx: number) => (
                    <div 
                      key={idx}
                      className="text-xs p-2 bg-muted rounded"
                    >
                      <div className="font-mono">{video.bucket}/{video.name}</div>
                      <div className="text-muted-foreground">
                        {new Date(video.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
