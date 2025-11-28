'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a client-side component that listens for Firestore permission errors.
// In a development environment, it throws the error to be caught by Next.js's overlay.
// In production, it could be configured to log to a service or show a generic toast.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught a Firestore Permission Error:", error);

      // In a real production app, you might want to show a generic toast
      // and log the detailed error to a monitoring service.
      if (process.env.NODE_ENV === 'production') {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You do not have permission to perform this action.",
        });
      } else {
        // In development, we want to see the full, rich error.
        // Throwing it here will activate the Next.js error overlay.
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
