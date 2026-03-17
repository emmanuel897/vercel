"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/update-password` }
      );
      if (authError) throw authError;
      setSent(true);
    } catch {
      setError("Impossible d'envoyer l'e-mail. Vérifiez l'adresse saisie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800">Réinitialiser le mot de passe</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <p className="text-gray-700 font-medium">E-mail envoyé !</p>
              <p className="text-sm text-gray-500 mt-2">
                Vérifiez votre boîte de réception et suivez le lien pour
                choisir un nouveau mot de passe.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm text-indigo-600 hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="vous@exemple.fr"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Envoi en cours…" : "Envoyer le lien"}
              </button>
              <p className="mt-4 text-center text-sm">
                <Link href="/login" className="text-indigo-600 hover:underline">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
