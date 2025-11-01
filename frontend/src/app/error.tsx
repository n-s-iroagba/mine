'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Something went wrong!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We apologize for the inconvenience. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-600">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <div className="space-y-4">
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}