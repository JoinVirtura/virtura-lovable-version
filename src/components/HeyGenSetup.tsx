import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HeyGenSetupProps {
  onApiKeyAdded?: () => void;
}

export const HeyGenSetup: React.FC<HeyGenSetupProps> = ({ onApiKeyAdded }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your HeyGen API key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Test the API key by making a simple request
      const response = await fetch('https://api.heygen.com/v2/avatars', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsValid(true);
        toast({
          title: "Success!",
          description: "HeyGen API key is valid and ready to use",
        });
        onApiKeyAdded?.();
      } else {
        setIsValid(false);
        toast({
          title: "Invalid API Key",
          description: "Please check your HeyGen API key and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsValid(false);
      toast({
        title: "Validation Failed",
        description: "Unable to validate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          HeyGen API Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To generate photorealistic talking avatar videos, you need a HeyGen API key. 
            This enables high-quality lip sync and natural avatar movements.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="heygen-api-key">HeyGen API Key</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="heygen-api-key"
                type="password"
                placeholder="Enter your HeyGen API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={validateApiKey}
                disabled={isValidating || !apiKey.trim()}
                variant={isValid === true ? "default" : "outline"}
              >
                {isValidating ? (
                  "Validating..."
                ) : isValid === true ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  "Validate"
                )}
              </Button>
            </div>
            {isValid === false && (
              <p className="text-sm text-destructive mt-1">
                Invalid API key. Please check and try again.
              </p>
            )}
            {isValid === true && (
              <p className="text-sm text-green-600 mt-1">
                ✓ API key validated successfully
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">With HeyGen API</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Photorealistic talking avatars</li>
                <li>✓ Perfect lip synchronization</li>
                <li>✓ Natural facial expressions</li>
                <li>✓ HD video quality (1080p+)</li>
                <li>✓ Multiple avatar styles</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">Without HeyGen API</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Static avatar images</li>
                <li>• No lip synchronization</li>
                <li>• Limited functionality</li>
                <li>• Basic preview only</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">How to get your HeyGen API Key:</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Visit the HeyGen developer portal</li>
            <li>Sign up or log in to your account</li>
            <li>Navigate to API Keys section</li>
            <li>Generate a new API key</li>
            <li>Copy and paste it above</li>
          </ol>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://app.heygen.com/api', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get HeyGen API Key
          </Button>
        </div>

        {isValid === true && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Great! Your HeyGen API is configured. You can now generate photorealistic talking avatar videos.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};