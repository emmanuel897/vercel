"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-6 font-mono break-all">
          {error.message || "Erreur inconnue"}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
