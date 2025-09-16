import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  userId?: string;
  feature?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  id?: string;
  user_id?: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  context?: Record<string, any>;
  created_at?: string;
}

export function useErrorTracking() {
  const { toast } = useToast();

  const logError = useCallback(async (
    error: Error | string,
    context: ErrorContext = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      const errorLog: Omit<ErrorLog, 'id' | 'created_at'> = {
        user_id: user?.id,
        error_type: context.feature || 'general',
        error_message: errorMessage,
        error_stack: errorStack,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }
      };

      // Log to console for development
      console.error('Error tracked:', {
        message: errorMessage,
        stack: errorStack,
        context
      });

      // Store in database for production tracking
      await supabase.from('error_logs').insert(errorLog);

      // For critical errors, show user notification
      if (context.feature && ['voice_generation', 'video_generation', 'avatar_upload'].includes(context.feature)) {
        toast({
          title: "Something went wrong",
          description: "We've logged the issue and will look into it.",
          variant: "destructive",
        });
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }, [toast]);

  const logFeatureError = useCallback(async (
    feature: string,
    action: string,
    error: Error | string,
    metadata?: Record<string, any>
  ) => {
    await logError(error, {
      feature,
      action,
      metadata
    });
  }, [logError]);

  const logApiError = useCallback(async (
    endpoint: string,
    status: number,
    response: any,
    requestData?: any
  ) => {
    await logError(`API Error: ${endpoint} - ${status}`, {
      feature: 'api',
      action: 'request',
      metadata: {
        endpoint,
        status,
        response,
        requestData
      }
    });
  }, [logError]);

  const logJobError = useCallback(async (
    jobId: string,
    jobType: string,
    error: Error | string,
    stage?: string
  ) => {
    await logError(error, {
      feature: 'job_processing',
      action: jobType,
      metadata: {
        jobId,
        stage
      }
    });
  }, [logError]);

  // Wrapper for async functions with automatic error tracking
  const withErrorTracking = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: ErrorContext = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        await logError(error as Error, context);
        return null;
      }
    };
  }, [logError]);

  return {
    logError,
    logFeatureError,
    logApiError,
    logJobError,
    withErrorTracking
  };
}

// Create error boundary hook for React error handling
export function useErrorBoundary() {
  const { logError } = useErrorTracking();

  const captureError = useCallback((error: Error, errorInfo: any) => {
    logError(error, {
      feature: 'react_error_boundary',
      action: 'component_error',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }, [logError]);

  return { captureError };
}