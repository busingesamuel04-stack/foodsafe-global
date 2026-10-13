'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-gray-200 shadow-md">
          <h2 className="text-2xl font-black text-gray-900">Application Error</h2>
          <p className="text-xs text-gray-600">
            A critical system issue occurred. Please refresh or retry.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
