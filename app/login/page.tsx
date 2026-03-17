"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? "Email ou mot de passe incorrect."
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎙️</div>
          <h1 className="text-2xl font-bold text-gray-800">Ma Communauté Podcasts</h1>
          <p className="text-sm text-gray-500 mt-1">Espace réservé aux membres</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Connexion</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link
              href="/reset-password"
              className="text-indigo-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Accès sur invitation uniquement.{" "}
          <Link href="/mentions-legales" className="underline">
            Mentions légales
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
